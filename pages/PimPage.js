const { expect } = require('@playwright/test');

class PimPage {
  constructor(page) {
    this.page = page;

    // =========================
    // Navigation
    // =========================
    this.pimMenu = page.getByRole('link', {
      name: 'PIM',
      exact: true
    });

    this.addEmployeeMenu = page.getByRole('link', {
      name: 'Add Employee',
      exact: true
    });

    this.employeeListMenu = page.getByRole('link', {
      name: 'Employee List',
      exact: true
    });

    // =========================
    // Add Employee
    // =========================
    this.firstName = page.getByPlaceholder('First Name');

    this.lastName = page.getByPlaceholder('Last Name');

    /*
     * Employee Id does not expose a reliable name/placeholder
     * attribute on the current OrangeHRM demo application.
     */
    this.employeeId = page
      .getByText('Employee Id', { exact: true })
      .locator('..')
      .locator('..')
      .locator('input')
      .first();

    // Profile picture upload
    this.fileInput = page.locator('input[type="file"]');

    // Save button
    this.saveButton = page.getByRole('button', {
      name: 'Save',
      exact: true
    });
  }

  // =========================
  // Open Add Employee
  // =========================
  async openAddEmployee() {
    await this.pimMenu.click();

    await this.addEmployeeMenu.click();

    await this.page
      .getByRole('heading', {
        name: 'Add Employee',
        exact: true
      })
      .waitFor({
        state: 'visible'
      });
  }

  // =========================
  // Add Employee
  // =========================
  async addEmployee(data) {
    await this.firstName.fill(data.firstName);

    await this.lastName.fill(data.lastName);

    await this.employeeId.fill(data.employeeId);

    // Upload profile picture
    await this.fileInput.setInputFiles(data.profilePicture);

    /*
     * Capture the employee creation API response.
     * empNumber will be used for exact API validation.
     */
    const responsePromise = this.page.waitForResponse(response =>
      response.url().includes('/api/v2/pim/employees') &&
      response.request().method() === 'POST' &&
      response.status() >= 200 &&
      response.status() < 300
    );

    await this.saveButton.click();

    const response = await responsePromise;

    const body = await response.json();

    // Verify employee details page
    await this.page
      .getByRole('heading', {
        name: 'Personal Details',
        exact: true
      })
      .waitFor({
        state: 'visible'
      });

    return body.data;
  }

  // =========================
  // Validate Created Employee
  // =========================
  async assertEmployeeDetails(firstName, lastName) {
    await expect(
      this.firstName,
      'First Name should match the test data'
    ).toHaveValue(firstName);

    await expect(
      this.lastName,
      'Last Name should match the test data'
    ).toHaveValue(lastName);
  }

  // =========================
  // Open Employee List
  // =========================
  async openEmployeeList() {
    await this.pimMenu.click();

    await this.employeeListMenu.click();

    await this.page
      .getByRole('heading', {
        name: 'Employee Information',
        exact: true
      })
      .waitFor({
        state: 'visible'
      });
  }

  // =========================
  // Search Employee By ID
  // =========================
  async searchByEmployeeId(employeeId) {
    const idInput = this.page
      .getByText('Employee Id', { exact: true })
      .locator('..')
      .locator('..')
      .locator('input')
      .first();

    await idInput.fill(employeeId);

    await this.page
      .getByRole('button', {
        name: 'Search',
        exact: true
      })
      .click();

    /*
     * Wait for the search result request to complete.
     * This prevents the validation from running against
     * stale table data.
     */
    await this.page.waitForTimeout(1500);
  }

  // =========================
  // Open Employee From Results
  // =========================
  async openEmployeeFromResults(employeeId) {
    const row = this.page
      .locator('.oxd-table-row')
      .filter({
        hasText: employeeId
      })
      .first();

    await row.waitFor({
      state: 'visible'
    });

    // Employee ID is in the second table cell
    await row
      .getByRole('cell')
      .nth(1)
      .click();

    await this.page
      .getByRole('heading', {
        name: 'Personal Details',
        exact: true
      })
      .waitFor({
        state: 'visible'
      });
  }

  // =========================
  // Edit Job Information
  // =========================
  async editJobDetails(jobTitle, employmentStatus) {
    // Open Job tab
    await this.page
      .getByText('Job', {
        exact: true
      })
      .click();

    await this.page
      .getByText('Job Title', {
        exact: true
      })
      .waitFor({
        state: 'visible'
      });

    // =========================
    // Job Title
    // =========================
    const jobTitleGroup = this.page
      .locator('.oxd-input-group')
      .filter({
        hasText: 'Job Title'
      })
      .first();

    const jobTitleDropdown = jobTitleGroup.locator(
      '.oxd-select-text'
    );

    await jobTitleDropdown.click();

    await this.page
      .locator('.oxd-select-dropdown')
      .waitFor({
        state: 'visible'
      });

    await this.page
      .locator('.oxd-select-dropdown')
      .getByText(jobTitle, {
        exact: true
      })
      .click();

    // =========================
    // Employment Status
    // =========================
    const employmentStatusGroup = this.page
      .locator('.oxd-input-group')
      .filter({
        hasText: 'Employment Status'
      })
      .first();

    const employmentStatusDropdown =
      employmentStatusGroup.locator(
        '.oxd-select-text'
      );

    await employmentStatusDropdown.click();

    await this.page
      .locator('.oxd-select-dropdown')
      .waitFor({
        state: 'visible'
      });

    await this.page
      .locator('.oxd-select-dropdown')
      .getByText(employmentStatus, {
        exact: true
      })
      .click();

    // Save
    await this.saveButton.click();

    // Verify update
    await expect(
      this.page.getByText('Successfully Updated', {
        exact: false
      }),
      'Employee job information should be updated successfully'
    ).toBeVisible({
      timeout: 15000
    });
  }

  // =========================
  // Delete Employee
  // =========================
  async deleteEmployee(employeeId) {
    await this.openEmployeeList();

    await this.searchByEmployeeId(employeeId);

    const row = this.page
      .locator('.oxd-table-row')
      .filter({
        hasText: employeeId
      })
      .first();

    await row.waitFor({
      state: 'visible'
    });

    // Find action buttons in the employee row
    const actionButtons = row.locator('button');

    const buttonCount = await actionButtons.count();

    if (buttonCount === 0) {
      throw new Error(
        `No action buttons found for employee ${employeeId}`
      );
    }

    // Delete is the last action button
    await actionButtons
      .nth(buttonCount - 1)
      .click();

    // Wait for the confirmation button directly
    const confirmDelete = this.page
      .getByText('Yes, Delete', {
        exact: true
      })
      .last();

    await expect(
      confirmDelete,
      'Delete confirmation button should be visible'
    ).toBeVisible({
      timeout: 15000
    });

    await confirmDelete.click();

    // Verify successful deletion message
    await expect(
      this.page.getByText('Successfully Deleted', {
        exact: false
      }),
      'Employee should be successfully deleted'
    ).toBeVisible({
      timeout: 15000
    });
  }

  // =========================
  // Verify Employee Deleted
  // =========================
  async assertEmployeeNotPresent(employeeId) {
    await this.openEmployeeList();

    await this.searchByEmployeeId(employeeId);

    /*
     * Instead of relying on "No Records Found", directly verify
     * that no table row contains the deleted Employee ID.
     */
    const deletedEmployeeRow = this.page
      .locator('.oxd-table-body .oxd-table-row')
      .filter({
        hasText: employeeId
      });

    await expect(
      deletedEmployeeRow,
      `Deleted employee ${employeeId} should not appear in the employee list`
    ).toHaveCount(0, {
      timeout: 15000
    });
  }
}

module.exports = { PimPage };