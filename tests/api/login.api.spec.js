const { test, expect } = require('../../fixtures/apiTest');
const { callApiWithReport } = require('../../utils/apiReporter');
const { getRequiredEnv } = require('../../utils/env');
const apiLoginData = require('../../data/api/login.json');

const validUsername = getRequiredEnv('API_LOGIN_USERNAME');
const validPassword = getRequiredEnv('API_LOGIN_PASSWORD');

test.describe('API Login - positive and negative scenarios', () => {
  test('Positive: login returns access token', async ({ request }, testInfo) => {
    const { response, body } = await callApiWithReport({
      requestContext: request,
      method: 'POST',
      url: '/auth/login',
      headers: { 'Content-Type': 'application/json' },
      data: {
        username: validUsername,
        password: validPassword
      },
      testInfo,
      name: 'api-login-positive'
    });

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    expect(body.accessToken).toBeTruthy();
    expect(body.refreshToken).toBeTruthy();
    expect(body.username).toBe(validUsername);
  });

  test('Negative: login fails with invalid password', async ({ request }, testInfo) => {
    const { response, body } = await callApiWithReport({
      requestContext: request,
      method: 'POST',
      url: '/auth/login',
      headers: { 'Content-Type': 'application/json' },
      data: {
        username: validUsername,
        password: apiLoginData.negative.invalidPassword
      },
      testInfo,
      name: 'api-login-negative'
    });

    expect(response.ok()).toBeFalsy();
    expect(response.status()).toBe(apiLoginData.negative.expectedStatus);
    expect(String(body.message || '')).toMatch(new RegExp(apiLoginData.negative.expectedMessagePattern, 'i'));
  });
});
