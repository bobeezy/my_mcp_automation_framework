const { test, expect } = require('../../fixtures/apiTest');
const { UserApiClient } = require('../../clients/UserApiClient');

const maxResponseTimeMs = Number(process.env.API_MAX_RESPONSE_TIME_MS || 4000);
const existingUserId = 1;

test.describe.serial('API User CRUD (dummyjson-compatible)', () => {
  let createdUser;

  test('POST: create a user', async ({ request }, testInfo) => {
    const userClient = new UserApiClient({ request, testInfo });

    const { response, body, metrics } = await userClient.createUser({
      firstName: 'Playwright',
      lastName: 'Automation',
      age: 30
    });

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(201);
    expect(body.id).toBeTruthy();
    expect(body.firstName).toBe('Playwright');
    expect(body.lastName).toBe('Automation');
    expect(body.age).toBe(30);
    expect(metrics.finalAttemptDurationMs).toBeLessThan(maxResponseTimeMs);

    createdUser = body;
  });

  test('GET: read existing user', async ({ request }, testInfo) => {
    const userClient = new UserApiClient({ request, testInfo });
    const { response, body, metrics } = await userClient.getUser(existingUserId);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    expect(body.id).toBe(existingUserId);
    expect(metrics.finalAttemptDurationMs).toBeLessThan(maxResponseTimeMs);
  });

  test('PUT: update existing user', async ({ request }, testInfo) => {
    const userClient = new UserApiClient({ request, testInfo });
    const { response, body, metrics } = await userClient.updateUser(existingUserId, {
      firstName: 'UpdatedPlaywright'
    });

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    expect(body.firstName).toBe('UpdatedPlaywright');
    expect(metrics.finalAttemptDurationMs).toBeLessThan(maxResponseTimeMs);
  });

  test('DELETE: delete existing user', async ({ request }, testInfo) => {
    const userClient = new UserApiClient({ request, testInfo });
    const { response, body, metrics } = await userClient.deleteUser(existingUserId);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    expect(body.id).toBe(existingUserId);
    expect(body.isDeleted).toBeTruthy();
    expect(metrics.finalAttemptDurationMs).toBeLessThan(maxResponseTimeMs);
  });

  test('POST contract: created response remains traceable', async () => {
    expect(createdUser).toBeTruthy();
    expect(createdUser.id).toBeTruthy();
  });
});
