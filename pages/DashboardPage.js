const { expect } = require('@playwright/test');

class DashboardPage {
  constructor(page) {
    this.page = page;

    // Top-right user menu
    this.userMenu = page.locator('.oxd-userdropdown-tab');

    // Logout menu item
    this.logoutOption = page.getByRole('menuitem', {
      name: 'Logout',
      exact: true
    });

    // Login page username field
    this.usernameInput = page.getByPlaceholder('Username');
  }

  async logout() {
    // Open the user dropdown
    await expect(
      this.userMenu,
      'Admin user menu should be visible'
    ).toBeVisible({
      timeout: 15000
    });

    await this.userMenu.click();

    // Wait for the logout option
    await expect(
      this.logoutOption,
      'Logout option should be visible'
    ).toBeVisible({
      timeout: 10000
    });

    // Click Logout
    await this.logoutOption.click();

    // Verify redirect to login page
    await expect(
      this.usernameInput,
      'Username field should be visible after logout'
    ).toBeVisible({
      timeout: 15000
    });
  }

  async assertLoggedOut() {
    await expect(
      this.usernameInput,
      'User should be logged out and returned to the login page'
    ).toBeVisible({
      timeout: 15000
    });
  }
}

module.exports = { DashboardPage };