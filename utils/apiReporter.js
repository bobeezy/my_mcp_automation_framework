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

async function callApiWithReport({
  requestContext,
  method,
  url,
  testInfo,
  name,
  headers,
  params,
  data
}) {
  const response = await requestContext.fetch(url, {
    method,
    headers,
    params,
    data
  });
  const fullUrl = response.url();
  const sensitiveValues = getSensitiveValues();

  const requestPayload = {
    method,
    url: fullUrl,
    relativeUrl: url,
    headers: sanitizeValue(headers || {}, sensitiveValues),
    params: sanitizeValue(params || {}, sensitiveValues),
    body: sanitizeValue(data || {}, sensitiveValues)
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
    body: sanitizeValue(parsedBody, sensitiveValues)
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
    body: parsedBody
  };
}

module.exports = {
  callApiWithReport
};
