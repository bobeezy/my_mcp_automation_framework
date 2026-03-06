# MCP Automation Framework

Playwright + JavaScript test automation framework for:

- Web login validation (positive and negative)
- API login validation (positive and negative)
- API user CRUD coverage (`POST`, `GET`, `PUT`, `DELETE`)
- Rich reporting with Playwright HTML + Allure attachments

## What is implemented

### Web automation (Page Object Model)

- Public test page: `https://the-internet.herokuapp.com/login`
- POM class: `pages/LoginPage.js`
- Web tests: `tests/web/login.web.spec.js`
  - Positive login with valid credentials
  - Negative login with invalid password
  - `test.step(...)` for step-level traceability in reports
  - Screenshot attached after each test (last executed step)
  - On failure: failure-point screenshot + failure details attachment
- Shared web hook registration:
  - `hooks/WebHooks.js`
  - `fixtures/webTest.js`

### API automation

- Public API: `https://dummyjson.com`
- Login tests: `tests/api/login.api.spec.js`
  - Positive login returns tokens
  - Negative login returns proper error
- User CRUD tests: `tests/api/user.crud.api.spec.js`
  - `POST /users/add`
  - `GET /users/{id}`
  - `PUT /users/{id}`
  - `DELETE /users/{id}`
- Shared API hook registration:
  - `hooks/ApiHooks.js`
  - `fixtures/apiTest.js`

### Reporting

- `playwright-report/`: Playwright HTML report
- `allure-results/`: raw Allure result files
- `allure-report/`: generated Allure report
- API request/response attachments are created by `utils/apiReporter.js`:
  - method, URL, headers, params, body
  - response status, headers, body

## Project structure

```text
my_mcp_automation_framework/
  data/
    credentials/
      .env.credentials
    web/
      login.json
    api/
      login.json
  hooks/
    WebHooks.js
    ApiHooks.js
  fixtures/
    webTest.js
    apiTest.js
  pages/
    LoginPage.js
  tests/
    web/
      login.web.spec.js
    api/
      login.api.spec.js
      user.crud.api.spec.js
  utils/
    apiReporter.js
    env.js
  playwright.config.js
  package.json
  README.md
```

## Prerequisites

- Node.js 18+
- npm

## Setup

1. Install dependencies:

```bash
npm install
```

1. Install Playwright browser(s):

```bash
npx playwright install chromium
```

1. Update environment values in `data/credentials/.env.credentials` if needed.

## Environment file (`data/credentials/.env.credentials`)

The framework loads environment data from `data/credentials/.env.credentials` by default.
Credentials are not hardcoded in test files; tests fail fast if required env values are missing.
Env validation helper is centralized in `utils/env.js` (`getRequiredEnv`) to enforce this behavior.

Current sample values:

```bash
WEB_BASE_URL=https://the-internet.herokuapp.com
WEB_LOGIN_USERNAME=tomsmith
WEB_LOGIN_PASSWORD=SuperSecretPassword!

API_BASE_URL=https://dummyjson.com
API_LOGIN_USERNAME=emilys
API_LOGIN_PASSWORD=emilyspass
```

To run against another environment file, use `ENV_FILE`:

```bash
ENV_FILE=data/credentials/.env.staging.credentials npx playwright test
```

## Test data files

Non-secret scenario data is externalized in JSON files:

- Web login data: `data/web/login.json`
  - negative password value
  - expected UI validation message
- API login data: `data/api/login.json`
  - negative password value
  - expected status code
  - expected error-message regex pattern

## How to execute tests

### Run all tests

```bash
npm test
```

### Run only web tests

```bash
npm run test:web
```

### Run web tests in headless mode (default)

```bash
npx playwright test tests/web --project=web-chromium
```

### Run web tests in headed mode (browser UI visible)

```bash
npx playwright test tests/web --project=web-chromium --headed
```

### Run only API tests

```bash
npm run test:api
```

### Run tests in headed mode (browser visible)

```bash
npm run test:headed
```

### Run a specific test file

```bash
npx playwright test tests/web/login.web.spec.js
npx playwright test tests/api/login.api.spec.js
```

### Run a single test by name

```bash
npx playwright test -g "Positive: user logs in successfully"
npx playwright test -g "POST: create a user"
```

### Run tests by Playwright project

```bash
npx playwright test --project=web-chromium
npx playwright test --project=api
```

## Parallel execution

Playwright supports parallel runs at worker level and project level.

### 1) Run web tests on 2 different browsers in parallel

Add a second web project in `playwright.config.js` (example with Firefox):

```js
{
  name: 'web-firefox',
  testDir: './tests/web',
  use: {
    browserName: 'firefox',
    baseURL: process.env.WEB_BASE_URL || 'https://the-internet.herokuapp.com'
  }
}
```

Then run both browser projects together:

```bash
npx playwright test tests/web --project=web-chromium --project=web-firefox
```

Optional: control parallel worker count explicitly:

```bash
npx playwright test tests/web --project=web-chromium --project=web-firefox --workers=4
```

What `--workers=4` means:

- Playwright runs up to 4 test workers (parallel processes) at the same time.
- More workers usually reduce total execution time when tests are independent.
- If your machine has limited CPU/RAM, too many workers can slow tests or cause instability.
- Good starting point: set workers close to available CPU cores, then tune from there.

### 2) Run web and API tests in parallel

Run both projects in one command:

```bash
npx playwright test --project=web-chromium --project=api
```

Optional: increase workers to speed up CI/local execution:

```bash
npx playwright test --project=web-chromium --project=api --workers=4
```

Notes:

- Parallelism increases execution speed but may increase resource usage.
- Keep tests isolated and independent to avoid flaky behavior in parallel runs.
- For CI, tune `--workers` based on machine CPU and memory.

## Reporting and artifacts

### Playwright HTML report

Generate/open after run:

```bash
npm run report:playwright
```

### Allure report

Generate report:

```bash
npm run report:allure:generate
```

Open report:

```bash
npm run report:allure:open
```

If report results look stale (old failed tests), regenerate cleanly before opening:

```bash
npx playwright test
npm run report:allure:generate
npm run report:allure:open
```

## Report details captured

### Web report details

- Step-level execution via `test.step(...)`
- `web-last-step.png` attached after each test
- Credential fields are redacted before screenshots are captured
- On failure:
  - `web-failure-point.png`
  - `web-failure-details.json` (error summary)
- Playwright failure artifacts:
  - trace
  - video
  - failure screenshot

### API report details

For each API test request:

- `*-request.json`
  - method, full endpoint URL, relative URL, headers, params, body
- `*-response.json`
  - full endpoint URL, status, status text, headers, parsed body
- Positive credential values are redacted from request/response attachments
- Token-like and secret fields are redacted (e.g., `accessToken`, `refreshToken`, `Authorization`, `cookie`, session-related keys)
- `api-test-start.json`
  - test title, start timestamp
- `api-test-end.json`
  - test title, status, expected status, end timestamp, failure message (if any)

## Hook architecture (SOLID-friendly)

To avoid repeating hook logic in each spec file:

- `hooks/WebHooks.js` owns web `afterEach` reporting attachments.
- `hooks/ApiHooks.js` owns API `beforeEach/afterEach` test metadata attachments.
- `fixtures/webTest.js` registers web hooks once and exports `test`/`expect`.
- `fixtures/apiTest.js` registers API hooks once and exports `test`/`expect`.
- Test files now import the right fixture instead of defining duplicate hooks.

### Migration note (old import -> new import)

Use fixture imports so shared hooks are applied automatically.

Old style:

```js
const { test, expect } = require('@playwright/test');
```

New style:

```js
// Web specs
const { test, expect } = require('../../fixtures/webTest');

// API specs
const { test, expect } = require('../../fixtures/apiTest');
```

## MCP + Jira workflow (for test case generation)

Use Playwright MCP + Jira to derive test cases:

1. Read ticket summary/description/acceptance criteria.
1. Extract positive, negative, boundary, and risk scenarios.
1. Map each scenario to:
   - web test coverage in `tests/web/`
   - API coverage in `tests/api/`
1. Convert to runnable Playwright tests.

Suggested prompt:

```text
Read Jira ticket <TICKET_ID> and extract acceptance criteria and risks.
Generate web and API test cases for login flow.
Include positive and negative scenarios, priorities (P0/P1/P2), and expected outcomes.
Return suggested Playwright test names and where to place them (tests/web or tests/api).
```
