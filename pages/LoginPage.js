const { getRequiredEnv } = require('../utils/env');

class LoginPage {
  constructor(page) {
    this.page = page;
    this.usernameInput = page.locator('#username');
    this.passwordInput = page.locator('#password');
    this.loginButton = page.locator('button[type="submit"]');
    this.flashMessage = page.locator('#flash');
    this.logoutButton = page.locator('a.button.secondary.radius');
  }

  getLoginUrl() {
    const baseUrl = getRequiredEnv('WEB_BASE_URL');
    return new URL('/login', baseUrl).toString();
  }

  async goto() {
    await this.page.goto(this.getLoginUrl());
  }

  async login(username, password) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async getFlashMessage() {
    return (await this.flashMessage.textContent())?.trim() ?? '';
  }
}

module.exports = { LoginPage };
