class ApiHooks {
  static register(test) {
    test.beforeEach(async ({}, testInfo) => {
      const start = {
        title: testInfo.title,
        startTime: new Date().toISOString()
      };

      await testInfo.attach('api-test-start.json', {
        body: Buffer.from(JSON.stringify(start, null, 2)),
        contentType: 'application/json'
      });
    });

    test.afterEach(async ({}, testInfo) => {
      const end = {
        title: testInfo.title,
        status: testInfo.status,
        expectedStatus: testInfo.expectedStatus,
        endTime: new Date().toISOString(),
        error: testInfo.error?.message || null
      };

      await testInfo.attach('api-test-end.json', {
        body: Buffer.from(JSON.stringify(end, null, 2)),
        contentType: 'application/json'
      });
    });
  }
}

module.exports = { ApiHooks };
