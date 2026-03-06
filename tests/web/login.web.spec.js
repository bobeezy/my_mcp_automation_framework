const { test, expect } = require('../../fixtures/webTest');
const { LoginPage } = require('../../pages/LoginPage');
const { getRequiredEnv } = require('../../utils/env');
const webLoginData = require('../../data/web/login.json');

const validUsername = getRequiredEnv('WEB_LOGIN_USERNAME');
const validPassword = getRequiredEnv('WEB_LOGIN_PASSWORD');

test.describe('Web Login - positive and negative scenarios', () => {
  test('Positive: user logs in successfully', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await test.step('Open login page', async () => {
      await loginPage.goto();
      await expect(page).toHaveURL(/\/login$/);
    });

    await test.step('Submit valid credentials', async () => {
      await loginPage.login(validUsername, validPassword);
    });

    await test.step('Verify successful login', async () => {
      await expect(page).toHaveURL(/\/secure$/);
      await expect(loginPage.flashMessage).toContainText('You logged into a secure area!');
      await expect(loginPage.logoutButton).toBeVisible();
    });
  });

  test('Negative: user fails login with invalid password', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await test.step('Open login page', async () => {
      await loginPage.goto();
      await expect(page).toHaveURL(/\/login$/);
    });

    await test.step('Submit invalid credentials', async () => {
      await loginPage.login(validUsername, webLoginData.negative.invalidPassword);
    });

    await test.step('Verify validation error', async () => {
      await expect(page).toHaveURL(/\/login$/);
      await expect(loginPage.flashMessage).toContainText(webLoginData.negative.expectedMessage);
    });
  });
});
