class LoginPage {
  constructor(page) {
    this.page = page;
    this.usernameInput = page.locator('#username');
    this.passwordInput = page.locator('#password');
    this.loginButton = page.locator('button[type="submit"]');
    this.flashMessage = page.locator('#flash');
    this.logoutButton = page.locator('a.button.secondary.radius');
  }

  getLoginPath() {
    return '/login';
  }

  async goto() {
    await this.page.goto(this.getLoginPath());
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
