const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const { PimPage } = require('../pages/PimPage');
const { DashboardPage } = require('../pages/DashboardPage');
const { EmployeeApi } = require('../utils/api-client');
const { getEmployeeData } = require('../fixtures/test-data');

test.describe('Employee Lifecycle Management', () => {
  test('should create, update, validate via API, delete and logout an employee', async ({ page }) => {
    const login = new LoginPage(page);
    const pim = new PimPage(page);
    const dashboard = new DashboardPage(page);
    const api = new EmployeeApi(page.request);

    const employee = getEmployeeData();

    let employeeCreated = false;
    let empNumber = null;

    try {
      // =========================================================
      // 1. Login
      // =========================================================
      await test.step('1. Login and verify dashboard', async () => {
        await login.open();

        await login.login(
          process.env.ORANGEHRM_USERNAME || 'Admin',
          process.env.ORANGEHRM_PASSWORD || 'admin123'
        );

        await login.assertLoggedIn();
      });

      // =========================================================
      // 2. Add Employee
      // =========================================================
      await test.step('2. Add a new employee using data-driven input', async () => {
        await pim.openAddEmployee();

        const createdEmployee = await pim.addEmployee(employee);

        expect(
          createdEmployee,
          'Employee creation API should return employee data'
        ).toBeTruthy();

        empNumber = createdEmployee.empNumber;

        expect(
          empNumber,
          'Created employee should have an employee number'
        ).toBeTruthy();

        employeeCreated = true;

        await pim.assertEmployeeDetails(
          employee.firstName,
          employee.lastName
        );
      });

      // =========================================================
      // 3. Search and Edit Employee
      // =========================================================
      await test.step('3. Search and edit employee job information', async () => {
        await pim.openEmployeeList();

        await pim.searchByEmployeeId(employee.employeeId);

        await pim.openEmployeeFromResults(employee.employeeId);

        await pim.editJobDetails(
          employee.jobTitle,
          employee.employmentStatus
        );
      });

      // =========================================================
      // 4. API Validation
      // =========================================================
      await test.step('4. Validate employee using API and cross-check UI data', async () => {
        expect(
          empNumber,
          'Employee number should be available from the create response'
        ).toBeTruthy();

        const response = await api.getEmployeeByNumber(empNumber);

        expect(
          response.ok(),
          'Get Employee API should return a successful response'
        ).toBeTruthy();

        const body = await response.json();

        const record = body.data;

        expect(
          record,
          'The employee created in the UI should exist in the API response'
        ).toBeTruthy();

        // ---------------------------------------------------------
        // Basic employee data validation
        // ---------------------------------------------------------
        expect(
          String(record.employeeId),
          'API employee ID should match UI data'
        ).toBe(employee.employeeId);

        expect(
          record.firstName,
          'API first name should match UI data'
        ).toBe(employee.firstName);

        expect(
          record.lastName,
          'API last name should match UI data'
        ).toBe(employee.lastName);

        // ---------------------------------------------------------
        // Print API structure for debugging / transparency
        // ---------------------------------------------------------
        console.log('API employee response:', JSON.stringify(record, null, 2));

        // ---------------------------------------------------------
        // Job Title
        // OrangeHRM can return related fields as objects.
        // Support common property names.
        // ---------------------------------------------------------
        if (record.jobTitle !== undefined && record.jobTitle !== null) {
          let apiJobTitle;

          if (typeof record.jobTitle === 'string') {
            apiJobTitle = record.jobTitle;
          } else {
            apiJobTitle =
              record.jobTitle.title ??
              record.jobTitle.name ??
              record.jobTitle.label ??
              record.jobTitle.value;
          }

          expect(
            apiJobTitle,
            'API job title should match the updated UI value'
          ).toBe(employee.jobTitle);
        }

        // ---------------------------------------------------------
        // Employment Status
        // ---------------------------------------------------------
        if (
          record.employmentStatus !== undefined &&
          record.employmentStatus !== null
        ) {
          let apiEmploymentStatus;

          if (typeof record.employmentStatus === 'string') {
            apiEmploymentStatus = record.employmentStatus;
          } else {
            apiEmploymentStatus =
              record.employmentStatus.name ??
              record.employmentStatus.title ??
              record.employmentStatus.label ??
              record.employmentStatus.value;
          }

          expect(
            apiEmploymentStatus,
            'API employment status should match the updated UI value'
          ).toBe(employee.employmentStatus);
        }
      });

      // =========================================================
      // 5. Delete Employee
      // =========================================================
      await test.step('5. Delete employee and verify through UI and API', async () => {
        await pim.deleteEmployee(employee.employeeId);

        employeeCreated = false;

        await pim.assertEmployeeNotPresent(employee.employeeId);

        const response = await api.getEmployeeByNumber(empNumber);

const status = response.status();
const responseBody = await response.text();

console.log(
  `Delete verification API response: ${status}`,
  responseBody
);

// OrangeHRM demo instances can return different 4xx responses
// for a deleted employee. Any non-success response confirms
// that the employee can no longer be retrieved.
expect(
  status,
  'Deleted employee should not be retrievable through the API'
).toBeGreaterThanOrEqual(400);

expect(
  status,
  'Deleted employee API verification should return a 4xx response'
).toBeLessThan(500);
      });

      // =========================================================
      // 6. Logout
      // =========================================================
      await test.step('6. Logout and verify session is invalidated', async () => {
        await dashboard.logout();

        await dashboard.assertLoggedOut();
      });
    } finally {
      // Cleanup if the test fails after employee creation
      if (employeeCreated) {
        try {
          await pim.deleteEmployee(employee.employeeId);
        } catch (_) {
          // Preserve the original test failure.
        }
      }
    }
  });
});