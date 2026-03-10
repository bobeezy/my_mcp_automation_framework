const { test, expect } = require('../../fixtures/apiTest');
const { getRequiredEnv } = require('../../utils/env');
const { AuthApiClient } = require('../../clients/AuthApiClient');
const apiLoginData = require('../../data/api/login.json');

const validUsername = getRequiredEnv('API_LOGIN_USERNAME');
const validPassword = getRequiredEnv('API_LOGIN_PASSWORD');
const maxResponseTimeMs = Number(process.env.API_MAX_RESPONSE_TIME_MS || 4000);

test.describe('API Login - positive and negative scenarios', () => {
  test('Positive: login returns access token', async ({ request }, testInfo) => {
    const authClient = new AuthApiClient({ request, testInfo });

    const { response, body, metrics } = await authClient.login({
      username: validUsername,
      password: validPassword
    });

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    expect(body.accessToken).toBeTruthy();
    expect(body.refreshToken).toBeTruthy();
    expect(body.username).toBe(validUsername);
    expect(metrics.finalAttemptDurationMs).toBeLessThan(maxResponseTimeMs);
  });

  test('Negative: login fails with invalid password', async ({ request }, testInfo) => {
    const authClient = new AuthApiClient({ request, testInfo });

    const { response, body, metrics } = await authClient.login({
      username: validUsername,
      password: apiLoginData.negative.invalidPassword
    });

    expect(response.ok()).toBeFalsy();
    expect(response.status()).toBe(apiLoginData.negative.expectedStatus);
    expect(String(body.message || '')).toMatch(new RegExp(apiLoginData.negative.expectedMessagePattern, 'i'));
    expect(metrics.finalAttemptDurationMs).toBeLessThan(maxResponseTimeMs);
  });
});
