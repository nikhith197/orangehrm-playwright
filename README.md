# OrangeHRM QA Automation Assessment

## Objective

Automate the Employee Lifecycle Management workflow for the OrangeHRM public demo using Playwright with JavaScript. The framework demonstrates Page Object Model, data-driven test data, API validation, assertions, HTML reporting, video recording, and CI execution.

## Application Under Test

- URL: https://opensource-demo.orangehrmlive.com/
- Default demo credentials: `Admin` / `admin123`
- Credentials can be overridden with environment variables.

## Assessment Coverage

1. Login and verify Dashboard.
2. Navigate to PIM > Add Employee.
3. Create an employee using JSON data.
4. Upload a profile picture.
5. Verify the employee record.
6. Search by Employee ID.
7. Update Job Title and Employment Status.
8. Validate the employee through the OrangeHRM employee API.
9. Cross-check API values against UI values.
10. Delete the employee.
11. Verify deletion in UI.
12. Verify the deleted employee is no longer returned by the API where supported.
13. Logout and verify the login page/session state.

## Framework Structure

```text
OrangeHRM_QA_Automation/
├── .github/workflows/playwright.yml
├── assets/profile.png
├── data/employee.json
├── fixtures/test-data.js
├── pages/
│   ├── DashboardPage.js
│   ├── LoginPage.js
│   └── PimPage.js
├── tests/employee-lifecycle.spec.js
├── utils/api-client.js
├── playwright.config.js
├── package.json
└── README.md
```

## Design Decisions

- **POM:** UI selectors and business actions are isolated in page classes.
- **Data-driven:** Employee input is stored in JSON and Employee ID is generated dynamically to reduce collision risk.
- **API validation:** Playwright's authenticated `page.request` is used so the API check can reuse the active session context.
- **Test steps:** `test.step()` makes the HTML report readable and maps directly to the assessment workflow.
- **Artifacts:** Screenshots are captured on failure; videos are retained for test runs; Playwright HTML report is generated after execution.
- **CI:** GitHub Actions installs dependencies/browsers, runs tests, and publishes reports/artifacts.

## Prerequisites

- Node.js 20+
- npm 10+
- Internet access

## Installation

```bash
npm ci
npx playwright install chromium
```

## Run Tests

Headless:

```bash
npm test
```

Headed:

```bash
npm run test:headed
```

Debug:

```bash
npm run test:debug
```

Open HTML report:

```bash
npm run report
```

## Credentials

For local execution, the default public demo credentials are used if environment variables are not supplied. For CI, set these GitHub repository secrets:

- `ORANGEHRM_USERNAME`
- `ORANGEHRM_PASSWORD`

## Reports and Artifacts

After execution:

- HTML report: `playwright-report/`
- Videos/screenshots/traces: `test-results/`

The GitHub Actions workflow uploads these as build artifacts.