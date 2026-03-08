const { test, expect } = require('../../fixtures/webTest');
const { LoginPage } = require('../../pages/LoginPage');
const { getRequiredEnv } = require('../../utils/env');
const webLoginData = require('../../data/web/login.json');

const validUsername = getRequiredEnv('WEB_LOGIN_USERNAME');
const validPassword = getRequiredEnv('WEB_LOGIN_PASSWORD');

test.describe('Web Login - positive and negative scenarios', () => {
  async function openLoginPage(loginPage, page, fullLoginUrl) {
    await loginPage.goto();
    await expect(page).toHaveURL(/\/login$/);
    await expect(page).toHaveURL(fullLoginUrl);
  }

  async function expectLoginFailure(loginPage, page, expectedTextOrPattern) {
    await expect(page).toHaveURL(/\/login$/);
    if (expectedTextOrPattern instanceof RegExp) {
      await expect(loginPage.flashMessage).toContainText(expectedTextOrPattern);
    } else {
      await expect(loginPage.flashMessage).toContainText(expectedTextOrPattern);
    }
    await expect(loginPage.logoutButton).toBeHidden();
  }

  test('Positive: user logs in successfully', async ({ page }) => {
    expect.hasAssertions();
    const loginPage = new LoginPage(page);
    const loginUrl = loginPage.getLoginUrl();

    await test.step(`Open login page (${loginUrl})`, async () => {
      await openLoginPage(loginPage, page, loginUrl);
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
    expect.hasAssertions();
    const loginPage = new LoginPage(page);
    const loginUrl = loginPage.getLoginUrl();

    await test.step(`Open login page (${loginUrl})`, async () => {
      await openLoginPage(loginPage, page, loginUrl);
    });

    await test.step('Submit invalid credentials', async () => {
      await loginPage.login(validUsername, webLoginData.negative.invalidPassword);
    });

    await test.step('Verify validation error', async () => {
      await expect(loginPage.flashMessage).toBeVisible();
      await expectLoginFailure(loginPage, page, webLoginData.negative.expectedInvalidPasswordMessage);
    });
  });

  test('Negative: user fails login with invalid username', async ({ page }) => {
    expect.hasAssertions();
    const loginPage = new LoginPage(page);
    const loginUrl = loginPage.getLoginUrl();

    await test.step(`Open login page (${loginUrl})`, async () => {
      await openLoginPage(loginPage, page, loginUrl);
    });

    await test.step('Submit invalid username with valid password', async () => {
      await loginPage.login(webLoginData.negative.invalidUsername, validPassword);
    });

    await test.step('Verify validation error', async () => {
      await expect(loginPage.flashMessage).toBeVisible();
      await expectLoginFailure(loginPage, page, webLoginData.negative.expectedInvalidUsernameMessage);
    });
  });

  test('Negative: user fails login with empty password', async ({ page }) => {
    expect.hasAssertions();
    const loginPage = new LoginPage(page);
    const loginUrl = loginPage.getLoginUrl();

    await test.step(`Open login page (${loginUrl})`, async () => {
      await openLoginPage(loginPage, page, loginUrl);
    });

    await test.step('Submit valid username with empty password', async () => {
      await loginPage.login(validUsername, '');
    });

    await test.step('Verify validation error', async () => {
      await expect(loginPage.flashMessage).toBeVisible();
      await expectLoginFailure(loginPage, page, webLoginData.negative.expectedInvalidPasswordMessage);
    });
  });

  test('Edge: login remains blocked with whitespace username and long password', async ({ page }) => {
    expect.hasAssertions();
    const loginPage = new LoginPage(page);
    const loginUrl = loginPage.getLoginUrl();

    await test.step(`Open login page (${loginUrl})`, async () => {
      await openLoginPage(loginPage, page, loginUrl);
    });

    await test.step('Submit whitespace username and oversized password', async () => {
      await loginPage.login(webLoginData.edge.usernameWithSpaces, webLoginData.edge.longPassword);
    });

    await test.step('Verify generic invalid feedback and blocked access', async () => {
      await expect(loginPage.flashMessage).toBeVisible();
      await expectLoginFailure(
        loginPage,
        page,
        new RegExp(webLoginData.negative.expectedGenericInvalidPattern, 'i')
      );
    });
  });
});
