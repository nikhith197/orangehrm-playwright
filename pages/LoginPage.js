const { expect } = require('@playwright/test');

class LoginPage {
  constructor(page) {
    this.page = page;

    this.usernameInput = page.getByPlaceholder('Username');
    this.passwordInput = page.getByPlaceholder('Password');

    this.loginButton = page.getByRole('button', {
      name: 'Login',
      exact: true
    });

    this.dashboardHeading = page.getByRole('heading', {
      name: 'Dashboard',
      exact: true
    });
  }

  async open() {
    // Allow extra time because the public OrangeHRM demo can occasionally
    // respond slowly.
    this.page.setDefaultNavigationTimeout(60000);

    await this.page.goto(
      'https://opensource-demo.orangehrmlive.com/web/index.php/auth/login',
      {
        waitUntil: 'domcontentloaded',
        timeout: 60000
      }
    );

    // Wait for the actual login form instead of waiting for every page
    // resource to finish loading.
    await this.usernameInput.waitFor({
      state: 'visible',
      timeout: 30000
    });
  }

  async login(username, password) {
    await this.usernameInput.fill(username);

    await this.passwordInput.fill(password);

    await this.loginButton.click();
  }

  async assertLoggedIn() {
    await expect(
      this.dashboardHeading,
      'Dashboard should be visible after successful login'
    ).toBeVisible({
      timeout: 30000
    });
  }
}

module.exports = { LoginPage };