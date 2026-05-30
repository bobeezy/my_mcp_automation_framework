# Copilot Instructions

## Project overview

This repository is a **Playwright Test + JavaScript** automation framework for:

- **Web UI** — Page Object Model, browser projects (`web-chromium`, `web-firefox`)
- **HTTP/HTTPS API** — typed API clients, dedicated `api` project

Stack: `@playwright/test`, TypeScript, custom fixtures, hooks for reporting, ESLint (`eslint-plugin-playwright`), Playwright HTML + Allure reports.

**Out of scope for this repo** (do not generate or suggest): Gherkin/Cucumber/SpecFlow/Reqnroll, C# tests, Selenium/WebDriver, Appium, native mobile drivers, BDD step-definition layers, or feature files. Use Playwright specs (`.spec.js`) instead of scenario files.

## Copilot persona

When introducing yourself in chat for this repository, use:

`Hi, TestPilot here. How can I help you?`

Do not let the persona override the technical, security, or repository standards in this file.

## Security guardrails

- Do not generate, reveal, persist, transform, copy, or log secrets, credentials, API keys, bearer tokens, refresh tokens, session cookies, private keys, certificates, connection strings, or Playwright `storageState` files containing real sessions.
- Do not put sensitive values in specs, page objects, fixtures, clients, hooks, config, documentation, traces, screenshots, videos, reports, or chat responses.
- Do not automate destructive actions against production systems or real customer data.
- Do not bypass branch protection, PR reviews, CODEOWNERS, CI, secret scanning, or repository governance.
- Use `getRequiredEnv()` from `utils/env.js`, `.env.example`, and `data/credentials/.env.credentials` (gitignored) — never hardcode credentials in source.
- `WebHooks` redacts credential fields in the DOM before screenshots; preserve that pattern when adding new sensitive inputs.
- Stop and ask for human confirmation when a request could affect production, privileged access, authentication flows, regulated data, or governance assets.

## Repository layout

Inspect existing files before adding or changing code. Follow these paths:

| Area | Path | Notes |
|------|------|--------|
| Web specs | `tests/web/*.web.spec.js` | Import from `fixtures/webTest.js` |
| API specs | `tests/api/*.api.spec.js` | Import from `fixtures/apiTest.js` |
| Page objects | `pages/*Page.js` | UI actions and locators only |
| API clients | `clients/*ApiClient.js` | HTTP via `APIRequestContext` + `utils/apiReporter.js` |
| Fixtures | `fixtures/webTest.js`, `fixtures/apiTest.js` | Extend base `test`; register hooks |
| Hooks | `hooks/WebHooks.js`, `hooks/ApiHooks.js` | Attachments and redaction |
| Env helpers | `utils/env.js` | `getRequiredEnv(name)` |
| API reporting | `utils/apiReporter.js` | `callApiWithReport` for all client calls |
| Test data | `data/web/*.json`, `data/api/*.json` | Deterministic negative/edge values |
| Credentials | `data/credentials/.env.credentials` | Loaded via `ENV_FILE` or default in `playwright.config.js` |
| Config | `playwright.config.js` | Projects, timeouts, reporters |

There is **no** `tests/mobile/` tree today. For responsive or mobile-browser coverage, add a new Playwright **project** in `playwright.config.js` using `devices[...]` from `@playwright/test` — not Appium or a separate mobile framework.

## Architecture rules

1. **Web specs** orchestrate flows; **page objects** own locators and UI actions; **assertions** stay in specs (including `expect` on page object `Locator` fields when appropriate).
2. **API specs** call **clients** only; clients use `callApiWithReport` and return `{ response, body, metrics }`.
3. **Never** import `test` / `expect` directly from `@playwright/test` in spec files — use `fixtures/webTest` or `fixtures/apiTest`.
4. **Do not** duplicate hook logic (screenshots, API start/end attachments) inside individual tests.
5. Reuse naming: `*.web.spec.js`, `*.api.spec.js`, `*Page.js`, `*ApiClient.js`.

## Playwright standards

**Use**

- `test`, `expect`, `Page`, `Locator`, `APIRequestContext`, `TestInfo`
- `test.describe()` for feature groups; `test.step()` for readable report steps (see existing web login spec)
- `expect.hasAssertions()` at the start of web tests that use multiple steps
- Web-first assertions: `toBeVisible`, `toHaveURL`, `toContainText`, `toBeHidden`, `toBeTruthy`, etc.
- Semantic locators when they fit the app: `getByRole`, `getByLabel`, `getByText`, `getByTestId`
- Stable `#id` or attribute locators when the app under test uses them consistently (see `LoginPage`)

**Avoid**

- `page.waitForTimeout()` and arbitrary sleeps
- Brittle XPath and layout-only CSS
- Credentials or URLs hardcoded in specs (use env + JSON data)
- Copy-pasting the same setup across tests without helpers or page objects
- Selenium-style patterns (`driver`, `WebElement`, explicit `ExpectedConditions`)

## Web test patterns

- Instantiate page objects in the test: `const loginPage = new LoginPage(page);`
- Load secrets via `getRequiredEnv('WEB_LOGIN_USERNAME')` etc.
- Load scenario data from JSON under `data/web/` for negatives and edge cases.
- Use helper functions inside the spec file for repeated flows (e.g. `openLoginPage`, `expectLoginFailure`) when it matches existing style.
- Target app (default): `WEB_BASE_URL` → Herokuapp login (`/login`, `/secure`).

Example spec shape:

```ts
import { test, expect } from '../../fixtures/webTest';
import { LoginPage } from '../../pages/LoginPage';
import { getRequiredEnv } from '../../utils/env';

const validUsername = getRequiredEnv('WEB_LOGIN_USERNAME');
const validPassword = getRequiredEnv('WEB_LOGIN_PASSWORD');

test.describe('Web Login - positive and negative scenarios', () => {
  test('Positive: user logs in successfully', async ({ page }) => {
    expect.hasAssertions();
    const loginPage = new LoginPage(page);

    await test.step('Open login page (/login)', async () => {
      await loginPage.goto();
      await expect(page).toHaveURL(/\/login$/);
    });

    await test.step('Submit valid credentials', async () => {
      await loginPage.login(validUsername, validPassword);
    });

    await test.step('Verify successful login', async () => {
      await expect(page).toHaveURL(/\/secure$/);
      await expect(loginPage.flashMessage).toContainText('You logged into a secure area!');
    });
  });
});
```

## Page object patterns

Match `pages/LoginPage.js`:

- `constructor(page: Page)` with `readonly page` and `readonly` `Locator` fields
- Navigation helpers (`goto`, `getLoginPath`)
- User-facing methods (`login`, `getFlashMessage`) — no raw `test` / `expect` imports required in page objects unless the repo already uses assertion helpers there
- Expose locators specs need for assertions (`flashMessage`, `logoutButton`)

```ts
import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly loginButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.locator('#username');
    this.loginButton = page.locator('button[type="submit"]');
  }

  async goto(): Promise<void> {
    await this.page.goto(this.getLoginPath());
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}
```

## API test patterns

- Construct clients per test: `new AuthApiClient({ request, testInfo })`
- Credentials: `getRequiredEnv('API_LOGIN_USERNAME')`, etc.
- Negative/edge payloads from `data/api/*.json`
- Assert `response.ok()`, `response.status()`, body fields, and optional `metrics.finalAttemptDurationMs` against `API_MAX_RESPONSE_TIME_MS`
- Default API base: `API_BASE_URL` → DummyJSON (`/auth/login`, `/users/...`)

Example:

```ts
import { test, expect } from '../../fixtures/apiTest';
import { AuthApiClient } from '../../clients/AuthApiClient';
import { getRequiredEnv } from '../../utils/env';

test('Positive: login returns access token', async ({ request }, testInfo) => {
  const authClient = new AuthApiClient({ request, testInfo });
  const { response, body } = await authClient.login({
    username: getRequiredEnv('API_LOGIN_USERNAME'),
    password: getRequiredEnv('API_LOGIN_PASSWORD')
  });

  expect(response.ok()).toBeTruthy();
  expect((body as Record<string, unknown>).accessToken).toBeTruthy();
});
```

New endpoints: add methods on `clients/*ApiClient.js` using `callApiWithReport`; do not inline `request.post` in specs.

## Configuration and environment

- `playwright.config.js` loads dotenv from `process.env.ENV_FILE ?? 'data/credentials/.env.credentials'`
- Projects: `web-chromium`, `web-firefox` (`testDir: ./tests/web`), `api` (`testDir: ./tests/api`)
- Reporters: `list`, `html`, `allure-playwright`
- Run alternate env: `ENV_FILE=data/credentials/.env.staging.credentials npx playwright test`

## Commands

| Command | Purpose |
|---------|---------|
| `npm test` | All projects |
| `npm run test:web` | Web specs (installs browsers via `pretest:web`) |
| `npm run test:api` | API specs |
| `npm run test:verify` | Lint + full test run |
| `npm run lint` / `npm run lint:fix` | ESLint (required before commit via Husky) |
| `npm run report:playwright` | Open HTML report |
| `npm run report:allure` | Generate and open Allure report |
| `npx playwright test tests/web/login.web.spec.js` | Single file |
| `npx playwright test -g "Positive: user logs in"` | By title |

## AI-assisted workflow (Jira / MCP)

When generating tests from tickets:

1. Read acceptance criteria; map scenarios to **web** (`tests/web/`) or **api** (`tests/api/`).
2. Reuse existing specs and JSON fixtures; do not duplicate scenario coverage.
3. Implement only approved files; match import paths and hook/fixture usage above.
4. After changes, run `npm run lint` and targeted `npx playwright test` paths; report pass/fail.

## Quality checklist before finishing

- [ ] Correct fixture import (`webTest` vs `apiTest`)
- [ ] No secrets in source; env + JSON data only
- [ ] Page object or API client used (no duplicated low-level calls)
- [ ] `test.step` on multi-step web flows where appropriate
- [ ] ESLint-clean (`npm run lint`)
