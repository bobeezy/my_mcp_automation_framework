const { test, expect } = require('../../fixtures/apiTest');
const { callApiWithReport } = require('../../utils/apiReporter');

test.describe('API User CRUD', () => {
  const existingUserId = 1;

  test('POST: create a user', async ({ request }, testInfo) => {
    const { response, body } = await callApiWithReport({
      requestContext: request,
      method: 'POST',
      url: '/users/add',
      headers: { 'Content-Type': 'application/json' },
      data: {
        firstName: 'Playwright',
        lastName: 'Automation',
        age: 30
      },
      testInfo,
      name: 'api-user-create'
    });

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(201);
    expect(body.id).toBeTruthy();
  });

  test('GET: read existing user', async ({ request }, testInfo) => {
    const { response, body } = await callApiWithReport({
      requestContext: request,
      method: 'GET',
      url: `/users/${existingUserId}`,
      testInfo,
      name: 'api-user-read'
    });

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    expect(body.id).toBe(existingUserId);
  });

  test('PUT: update user', async ({ request }, testInfo) => {
    const { response, body } = await callApiWithReport({
      requestContext: request,
      method: 'PUT',
      url: `/users/${existingUserId}`,
      headers: { 'Content-Type': 'application/json' },
      data: {
        firstName: 'UpdatedPlaywright'
      },
      testInfo,
      name: 'api-user-update'
    });

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    expect(body.firstName).toBe('UpdatedPlaywright');
  });

  test('DELETE: delete user', async ({ request }, testInfo) => {
    const { response, body } = await callApiWithReport({
      requestContext: request,
      method: 'DELETE',
      url: `/users/${existingUserId}`,
      testInfo,
      name: 'api-user-delete'
    });

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    expect(body.id).toBe(existingUserId);
    expect(body.isDeleted).toBeTruthy();
  });
});
