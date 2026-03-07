class WebHooks {
  static async redactCredentialFields(page) {
    await page.evaluate(() => {
      const doc = globalThis.document;
      const credentialSelectors = [
        '#username',
        'input[name="username"]',
        'input[type="email"]',
        '#password',
        'input[name="password"]',
        'input[type="password"]'
      ];

      for (const selector of credentialSelectors) {
        const element = doc.querySelector(selector);
        if (!element || typeof element.value !== 'string') continue;
        element.value = '[REDACTED]';
      }
    });
  }

  static register(test) {
    test.afterEach(async ({ page }, testInfo) => {
      await WebHooks.redactCredentialFields(page);

      const finalStepScreenshot = await page.screenshot({ fullPage: true });
      await testInfo.attach('web-last-step.png', {
        body: finalStepScreenshot,
        contentType: 'image/png'
      });

      if (testInfo.status !== testInfo.expectedStatus) {
        const failureScreenshot = await page.screenshot({ fullPage: true });
        await testInfo.attach('web-failure-point.png', {
          body: failureScreenshot,
          contentType: 'image/png'
        });

        const failureSummary = {
          title: testInfo.title,
          status: testInfo.status,
          expectedStatus: testInfo.expectedStatus,
          error: testInfo.error?.message || 'No error message available'
        };

        await testInfo.attach('web-failure-details.json', {
          body: Buffer.from(JSON.stringify(failureSummary, null, 2)),
          contentType: 'application/json'
        });
      }
    });
  }
}

module.exports = { WebHooks };
