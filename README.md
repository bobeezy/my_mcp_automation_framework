# MCP Automation Framework

AI-assisted test automation framework using **Playwright + JavaScript** and a **Playwright MCP server** workflow to help generate test cases from Jira tickets.

## What this project covers

- Basic API automation for a Login domain using:
  - `POST` (create/login)
  - `GET` (read user/session/profile)
  - `PUT` (update user/session settings)
  - `DELETE` (cleanup/delete test data)
- Playwright test execution (`@playwright/test`)
- MCP-driven test design flow (read Jira ticket -> derive scenarios -> create test cases)

## Recommended project structure

Use this structure as a starting point:

```text
my_mcp_automation_framework/
  pages/
    LoginPage.js
  tests/
    web/
      login.web.spec.js
    api/
      login.api.spec.js
  test-data/
    users.json
  utils/
    env.js
    apiClient.js
  fixtures/
    auth.fixture.js
  playwright-report/
  test-results/
  playwright.config.js
  package.json
  .env
  .env.example
  README.md
```

### Page Object Model (Web)

Follow Page Object Model for web tests:

- Keep selectors and page actions in `pages/`.
- Keep assertions and scenarios in `tests/web/`.
- Keep API checks in `tests/api/`.
- Reuse shared test data from `test-data/`.

Example mapping:

```text
pages/LoginPage.js              -> page locators + actions (goto, login, validation helpers)
tests/web/login.web.spec.js     -> web test cases using LoginPage
tests/api/login.api.spec.js     -> API test cases (POST, GET, PUT, DELETE)
fixtures/auth.fixture.js        -> shared auth/session fixtures (optional)
```

## Prerequisites

- Node.js 18+
- npm or yarn
- Playwright installed in the project
- Access to your API environment (base URL + credentials)
- Access to Jira (for ticket-based test case generation workflow)
- Playwright MCP server configured in your Cursor/agent environment

## Setup

1. Initialize the project (if not already done):

```bash
npm init -y
npm i -D @playwright/test
npx playwright install
```

1. Add environment variables in `.env`:

```bash
API_BASE_URL=https://your-api-host.com
LOGIN_EMAIL=test.user@example.com
LOGIN_PASSWORD=your_password
```

1. Add scripts in `package.json`:

```json
{
  "scripts": {
    "test:api": "playwright test tests/api",
    "test:api:headed": "playwright test tests/api --headed",
    "test:api:debug": "PWDEBUG=1 playwright test tests/api"
  }
}
```

## Playwright config (API-focused)

Create `playwright.config.js`:

```js
// @ts-check
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30_000,
  fullyParallel: false,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.API_BASE_URL,
    extraHTTPHeaders: {
      Accept: 'application/json'
    }
  }
});
```

## Basic Login API tests (POST, GET, PUT, DELETE)

Create `tests/api/login.api.spec.js`:

```js
const { test, expect, request } = require('@playwright/test');

test.describe('Login API - basic CRUD-style checks', () => {
  let apiContext;
  let authToken;
  let userId;

  test.beforeAll(async () => {
    apiContext = await request.newContext({
      baseURL: process.env.API_BASE_URL
    });
  });

  test.afterAll(async () => {
    await apiContext.dispose();
  });

  test('POST /login - authenticate user', async () => {
    const response = await apiContext.post('/login', {
      data: {
        email: process.env.LOGIN_EMAIL,
        password: process.env.LOGIN_PASSWORD
      }
    });

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.token).toBeTruthy();
    expect(body.user).toBeTruthy();

    authToken = body.token;
    userId = body.user.id;
  });

  test('GET /users/{id} - fetch logged-in user profile', async () => {
    const response = await apiContext.get(`/users/${userId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.id).toBe(userId);
    expect(body.email).toBe(process.env.LOGIN_EMAIL);
  });

  test('PUT /users/{id} - update user metadata', async () => {
    const response = await apiContext.put(`/users/${userId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
      data: {
        displayName: 'Playwright API User'
      }
    });

    expect(response.ok()).toBeTruthy();
    expect([200, 204]).toContain(response.status());
  });

  test('DELETE /sessions/current - logout / cleanup session', async () => {
    const response = await apiContext.delete('/sessions/current', {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    expect(response.ok()).toBeTruthy();
    expect([200, 202, 204]).toContain(response.status());
  });
});
```

> Note: Endpoint paths differ by application. Replace `/login`, `/users/{id}`, and `/sessions/current` with your real API routes.

## Basic Login Web tests (Playwright)

Create `tests/web/login.web.spec.js`:

```js
const { test, expect } = require('@playwright/test');

test.describe('Login Web', () => {
  test('user logs in with valid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Email').fill(process.env.LOGIN_EMAIL);
    await page.getByLabel('Password').fill(process.env.LOGIN_PASSWORD);
    await page.getByRole('button', { name: /log in|sign in/i }).click();

    await expect(page).toHaveURL(/dashboard|home/);
    await expect(page.getByText(/welcome|dashboard/i)).toBeVisible();
  });

  test('error shown for invalid password', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Email').fill(process.env.LOGIN_EMAIL);
    await page.getByLabel('Password').fill('wrong-password');
    await page.getByRole('button', { name: /log in|sign in/i }).click();

    await expect(page.getByText(/invalid credentials|incorrect password/i)).toBeVisible();
  });

  test('required field validation is displayed', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /log in|sign in/i }).click();

    await expect(page.getByText(/email is required|password is required/i)).toBeVisible();
  });
});
```

### Web-specific config notes

For web tests, set `baseURL` in `playwright.config.js` to your web app URL (for example `https://your-web-app.com`), and keep credentials in `.env`.

You can run only web tests with:

```bash
npx playwright test tests/web
```

You can run both API and web tests with:

```bash
npx playwright test tests
```

### Suggested Login web test cases

- Successful login redirects user to dashboard/home.
- Invalid password shows authentication error message.
- Unknown user shows account-not-found or generic auth error.
- Empty fields show required field validation.
- Password field masks typed input.
- Session persists after page refresh (if expected by product).
- Logout returns user to login page and blocks protected routes.
- Locked/disabled account shows proper error handling.

## Running tests

```bash
npm run test:api
```

Optional:

```bash
npx playwright show-report
```

## Using Playwright MCP server + Jira to generate test cases

Use this repeatable workflow:

1. **Read Jira ticket with MCP tools**
   - Pull summary, description, acceptance criteria, priority, labels, linked defects.
2. **Extract test conditions**
   - Identify positive, negative, boundary, security, and role/permission scenarios.
3. **Map ticket requirements to API checks**
   - For login flows, usually:
     - Valid credentials (`POST`)
     - Invalid password/user (`POST` negative)
     - Token/session retrieval (`GET`)
     - User profile/settings update (`PUT`)
     - Logout/session revoke (`DELETE`)
4. **Generate test cases**
   - Produce clear test title, preconditions, steps, expected results, and API assertions.
5. **Implement tests in Playwright**
   - Convert each case into `test()` blocks and add data-driven coverage where needed.
   - Split cases by layer: `tests/api/*` and `tests/web/*`.

### Suggested prompt for MCP

You can use a prompt like:

```text
Read Jira ticket <TICKET_ID>. Extract acceptance criteria and risks.
Create API test cases for Login flow using POST, GET, PUT, and DELETE.
For each test case include: title, objective, preconditions, request, expected status code, and expected response checks.
Then suggest Playwright test names and execution priority (P0/P1/P2).
```

For web-specific generation:

```text
Read Jira ticket <TICKET_ID> for Login page behavior.
Create Playwright web test cases for positive, negative, validation, and session scenarios.
For each test include: title, objective, page path, steps, expected web behavior, and priority (P0/P1/P2).
Then suggest Playwright test names for tests/web/login.web.spec.js.
```

## Example test case template (from Jira ticket)

Use this template to keep generated test cases consistent:

```text
Test Case ID: API-LOGIN-001
Title: Login with valid credentials returns auth token
Priority: P0
Preconditions:
- User account exists and is active
Request:
- Method: POST
- Endpoint: /login
- Payload: valid email/password
Expected:
- Status code: 200
- Response contains non-empty token
- Response contains correct user id/email
```

## Best practices

- Keep API tests deterministic and independent.
- Avoid coupling test assertions to unstable fields (timestamps, random ids).
- Use dedicated test accounts and isolated test data.
- Add negative cases for each endpoint (401/403/404/422).
- Tag smoke vs regression tests using `test.describe` or naming conventions.
- Store sensitive values in environment variables, not in source code.

## Next steps

- Add negative login scenarios (`invalid password`, `locked user`, `missing fields`)
- Add schema validation for response bodies
- Add page object model for login page (`pages/LoginPage.js`)
- Add CI pipeline execution (GitHub Actions/Jenkins)
- Add trace/log artifacts on failure for faster debugging
