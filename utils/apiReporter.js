function getSensitiveValues() {
  return [
    process.env.WEB_LOGIN_USERNAME,
    process.env.WEB_LOGIN_PASSWORD,
    process.env.API_LOGIN_USERNAME,
    process.env.API_LOGIN_PASSWORD
  ].filter(Boolean);
}

function shouldRedactKey(key) {
  const keyLower = String(key).toLowerCase();
  const sensitiveKeyParts = [
    'password',
    'token',
    'accessToken',
    'refreshToken',
    'authorization',
    'cookie',
    'set-cookie',
    'secret',
    'session',
    'apikey',
    'api-key'
  ];

  return sensitiveKeyParts.some((part) => keyLower.includes(part));
}

function redactTokenLikeStrings(value) {
  if (typeof value !== 'string') return value;

  let output = value;
  output = output.replace(/bearer\s+[a-z0-9\-._~+/]+=*/gi, 'Bearer [REDACTED]');
  output = output.replace(/\beyJ[A-Za-z0-9._-]+\b/g, '[REDACTED_JWT]');
  return output;
}

function sanitizeValue(value, sensitiveValues, parentKey = '') {
  if (shouldRedactKey(parentKey)) {
    return '[REDACTED]';
  }

  if (typeof value === 'string') {
    let sanitized = redactTokenLikeStrings(value);
    for (const secret of sensitiveValues) {
      sanitized = sanitized.split(secret).join('[REDACTED]');
    }
    return sanitized;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item, sensitiveValues, parentKey));
  }

  if (value && typeof value === 'object') {
    const output = {};
    for (const [key, nested] of Object.entries(value)) {
      output[key] = sanitizeValue(nested, sensitiveValues, key);
    }
    return output;
  }

  return value;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableStatus(status) {
  return status >= 500 && status < 600;
}

function toInt(value, fallback) {
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getRetryPolicy() {
  const testEnv = String(process.env.TEST_ENV || 'local').toLowerCase();
  const isProd = testEnv === 'prod' || testEnv === 'production';

  const explicitlyEnabled = String(process.env.API_RETRY_ENABLED || '').toLowerCase() === 'true';
  const maxAttempts = Math.max(1, toInt(process.env.API_RETRY_MAX_ATTEMPTS, 2));
  const backoffMs = Math.max(0, toInt(process.env.API_RETRY_BACKOFF_MS, 300));

  return {
    enabled: !isProd && explicitlyEnabled,
    maxAttempts,
    backoffMs,
    retryOnNetworkError: true
  };
}

async function callApiWithReport({
  requestContext,
  method,
  url,
  testInfo,
  name,
  headers,
  params,
  data,
  retryPolicy
}) {
  const policy = retryPolicy || getRetryPolicy();
  const attemptsLimit = policy.enabled ? policy.maxAttempts : 1;

  const startedAt = Date.now();
  const sensitiveValues = getSensitiveValues();
  const attempts = [];
  let lastError;

  for (let attempt = 1; attempt <= attemptsLimit; attempt += 1) {
    const attemptStart = Date.now();

    try {
      const response = await requestContext.fetch(url, {
        method,
        headers,
        params,
        data
      });

      const durationMs = Date.now() - attemptStart;
      attempts.push({
        attempt,
        durationMs,
        status: response.status(),
        ok: response.ok(),
        retryTriggered: isRetryableStatus(response.status()) && attempt < attemptsLimit
      });

      if (isRetryableStatus(response.status()) && attempt < attemptsLimit) {
        await sleep(policy.backoffMs * attempt);
        continue;
      }

      const fullUrl = response.url();
      const requestPayload = {
        method,
        url: fullUrl,
        relativeUrl: url,
        headers: sanitizeValue(headers || {}, sensitiveValues),
        params: sanitizeValue(params || {}, sensitiveValues),
        body: sanitizeValue(data || {}, sensitiveValues),
        retryPolicy: policy
      };

      const responseBodyText = await response.text();
      let parsedBody = responseBodyText;
      try {
        parsedBody = JSON.parse(responseBodyText);
      } catch {
        // Keep raw text when response is not JSON.
      }

      const responsePayload = {
        url: fullUrl,
        status: response.status(),
        statusText: response.statusText(),
        ok: response.ok(),
        headers: sanitizeValue(response.headers(), sensitiveValues),
        body: sanitizeValue(parsedBody, sensitiveValues),
        metrics: {
          attempts,
          totalDurationMs: Date.now() - startedAt,
          finalAttemptDurationMs: durationMs
        }
      };

      await testInfo.attach(`${name}-request.json`, {
        body: Buffer.from(JSON.stringify(requestPayload, null, 2)),
        contentType: 'application/json'
      });

      await testInfo.attach(`${name}-response.json`, {
        body: Buffer.from(JSON.stringify(responsePayload, null, 2)),
        contentType: 'application/json'
      });

      return {
        response,
        body: parsedBody,
        metrics: {
          attempts: attempts.length,
          totalDurationMs: Date.now() - startedAt,
          finalAttemptDurationMs: durationMs
        }
      };
    } catch (error) {
      const durationMs = Date.now() - attemptStart;
      attempts.push({
        attempt,
        durationMs,
        status: null,
        ok: false,
        retryTriggered: policy.retryOnNetworkError && attempt < attemptsLimit,
        error: String(error.message || error)
      });

      lastError = error;

      if (!(policy.retryOnNetworkError && attempt < attemptsLimit)) {
        break;
      }

      await sleep(policy.backoffMs * attempt);
    }
  }

  const failPayload = {
    method,
    relativeUrl: url,
    retryPolicy: policy,
    attempts,
    error: String(lastError?.message || lastError || 'Unknown network error')
  };

  await testInfo.attach(`${name}-failure.json`, {
    body: Buffer.from(JSON.stringify(failPayload, null, 2)),
    contentType: 'application/json'
  });

  throw lastError;
}

module.exports = {
  callApiWithReport
};
