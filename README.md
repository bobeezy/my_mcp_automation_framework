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
  - Negative login with invalid username
  - Negative login with empty password
  - Edge login with whitespace username + long password
  - `test.step(...)` for step-level traceability in reports
  - Login step includes full absolute URL for clearer Allure traceability
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
  .husky/
    pre-commit
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
  eslint.config.js
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

1. Validate code quality with ESLint:

```bash
npm run lint
```

1. Install Playwright browser(s):

```bash
npm run pw:install
```

1. Create/update local environment file at `data/credentials/.env.credentials` if needed.

## Environment file (`data/credentials/.env.credentials`)

The framework loads environment data from `data/credentials/.env.credentials` by default.
Credentials are not hardcoded in test files; tests fail fast if required env values are missing.
Env validation helper is centralized in `utils/env.js` (`getRequiredEnv`) to enforce this behavior.
This file is local-only and is ignored by git to prevent secret leakage.

Sample values:

```bash
WEB_BASE_URL=https://the-internet.herokuapp.com
WEB_LOGIN_USERNAME=tomsmith
WEB_LOGIN_PASSWORD=SuperSecretPassword!

API_BASE_URL=https://dummyjson.com
API_LOGIN_USERNAME=emilys
API_LOGIN_PASSWORD=emilyspass

# Jira values (local use)
JIRA_BASE_URL=https://bobymangoua.atlassian.net
JIRA_EMAIL=your-atlassian-email@example.com
JIRA_API_TOKEN=your_generated_api_token
```

To run against another environment file, use `ENV_FILE`:

```bash
ENV_FILE=data/credentials/.env.staging.credentials npx playwright test
```

Additional optional API reliability/performance env variables:

```bash
# Retry policy (enabled only when API_RETRY_ENABLED=true and TEST_ENV is not production)
TEST_ENV=local
API_RETRY_ENABLED=true
API_RETRY_MAX_ATTEMPTS=2
API_RETRY_BACKOFF_MS=300

# API response-time assertion threshold in tests (milliseconds)
API_MAX_RESPONSE_TIME_MS=4000
```

Defaults used by the framework:

- `TEST_ENV=local` (implicit if not set)
- `API_RETRY_ENABLED=false` (retries are opt-in)
- `API_RETRY_MAX_ATTEMPTS=2`
- `API_RETRY_BACKOFF_MS=300`
- `API_MAX_RESPONSE_TIME_MS=4000`

Recommended values:

- Local/dev: `API_MAX_RESPONSE_TIME_MS=4000`
- CI: `API_MAX_RESPONSE_TIME_MS=6000` or `8000` depending on runner/network latency

## Test data files

Non-secret scenario data is externalized in JSON files:

- Web login data: `data/web/login.json`
  - negative credentials/messages (invalid password, invalid username)
  - generic invalid-message pattern for edge assertions
  - edge inputs (whitespace username, long password)
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

## Linting (ESLint)

Purpose of ESLint (quick summary):

- Statically analyzes JavaScript code to catch issues before runtime.
- Enforces consistent coding standards across the project.
- Helps reduce bugs and improve maintainability for test automation code.

ESLint is configured with:

- Base JavaScript recommended rules (`@eslint/js`)
- Node.js globals (`globals`)
- Playwright lint rules for test files (`eslint-plugin-playwright`)

### ESLint setup steps

1. Install lint dependencies:

```bash
npm i -D eslint @eslint/js globals eslint-plugin-playwright
```

1. Create/update lint config:

- File: `eslint.config.js`
- Ensure it includes:
  - JS recommended rules (`@eslint/js`)
  - Node globals (`globals`)
  - Playwright plugin rules for `tests/`, `hooks/`, `fixtures/`
  - Ignore paths for generated reports/artifacts

1. Add npm scripts in `package.json`:

```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix"
  }
}
```

1. Run lint and fix issues:

```bash
npm run lint
npm run lint:fix
```

1. (Optional, recommended) add `npm run lint` in CI before test execution.

### Pre-commit lint hook (Husky)

Purpose:

- Automatically runs lint checks before each `git commit`.
- Prevents commits that introduce lint errors.

Setup steps:

1. Install Husky:

```bash
npm i -D husky
```

1. Add/keep this script in `package.json`:

```json
{
  "scripts": {
    "prepare": "husky"
  }
}
```

1. Ensure the hook file exists at `.husky/pre-commit` with:

```sh
#!/usr/bin/env sh
npm run lint
```

1. Activate hooks locally (run once per clone):

```bash
npm run prepare
```

When to use:

- Use by default in daily development so lint is validated before each commit.
- Keep CI lint checks as a second safety layer (`npm run lint` in pipeline).

Lint commands:

```bash
npm run lint
npm run lint:fix
```

### How to confirm lint pass/fail

In your local terminal, after running:

```bash
npm run lint
```

check exit code:

```bash
echo $?
```

- `0` -> passed
- non-`0` -> failed

Example fail output pattern:

- `path/to/file.js`
- line/column
- rule name (for example `no-undef`)
- summary like `✖ 1 problem`

With your Husky pre-commit hook:

- If lint fails, commit is blocked and you will see lint errors in terminal.
- If commit succeeds, lint passed.

Lint config file:

- `eslint.config.js`

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

Generate and open in one command:

```bash
npm run report:allure
```

OR

```bash
npm run report:allure:generate && npm run report:allure:open
```

If report results look stale (old failed tests), regenerate cleanly before opening:

```bash
npx playwright test
npm run report:allure:generate
npm run report:allure:open
```

If stale failures still appear, remove old artifacts and regenerate:

```bash
rm -rf allure-results allure-report
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

## Playwright MCP server setup (Jira ticket reading)

Use the official Playwright MCP server to open Jira tickets in the browser, extract acceptance criteria, and generate/implement additional test coverage.

### 1) Cursor MCP server configuration

`settings.json` entry (already configured in this environment):

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": [
        "-y",
        "@playwright/mcp@latest",
        "--browser",
        "chrome",
        "--output-dir",
        ".playwright-mcp",
        "--save-session"
      ],
      "cwd": "/Users/bobeezy/Workspace/JavaScript/my_mcp_automation_framework"
    }
  }
}
```

### 2) Optional local run command

You can run the same server from terminal:

```bash
npm run mcp:playwright
```

### 3) Login/session guidance for Jira

When Playwright MCP opens Jira, sign in once if prompted. Session state is stored in `.playwright-mcp/` so later runs can reuse it.

### 3.1) Jira credentials quick path

Use this quick setup for Jira environment values:

1. `JIRA_BASE_URL`
   - Open Jira in your browser.
   - Copy only the domain part before `/jira/...`.
   - Example for this workspace:
     - `JIRA_BASE_URL=https://bobymangoua.atlassian.net`
1. `JIRA_EMAIL`
   - Use the Atlassian account email you sign in with.
   - Verify at [Atlassian profile and visibility](https://id.atlassian.com/manage-profile/profile-and-visibility).
   - Example:
     - `JIRA_EMAIL=you@example.com`
1. `JIRA_API_TOKEN`
   - Go to [Atlassian API tokens](https://id.atlassian.com/manage-profile/security/api-tokens).
   - Click `Create API token`.
   - Name it like `mcp-jira-local`.
   - Copy the token (shown once).
   - Add:
     - `JIRA_API_TOKEN=<paste-token>`

Put all three values in `data/credentials/.env.credentials`:

```bash
JIRA_BASE_URL=https://bobymangoua.atlassian.net
JIRA_EMAIL=your-atlassian-email@example.com
JIRA_API_TOKEN=your_generated_api_token
```

Validate credentials quickly:

```bash
set -a && source data/credentials/.env.credentials && set +a && curl -s -o /tmp/jira_me.json -w "%{http_code}\n" -u "$JIRA_EMAIL:$JIRA_API_TOKEN" "$JIRA_BASE_URL/rest/api/3/myself"
```

Expected result:

- `200` -> credentials are valid
- `401` or `403` -> check email/token/site access

### 4) Prompt to read ticket and extract scenarios

```text
Using Playwright MCP, open Jira ticket https://bobymangoua.atlassian.net/browse/KAN-6.
Extract requirement and acceptance criteria.
Return additional negative and edge test scenarios for web login in Given/When/Then format.
Do not repeat existing scenario: "Negative: user fails login with invalid password".
```

### 5) Prompt to generate and write test code

```text
Using extracted scenarios from KAN-6, update tests/web/login.web.spec.js.
Add only new negative and edge tests not already covered.
Keep existing test style with test.step blocks and assertions on URL + flash message.
If needed, update data/web/login.json with deterministic test data.
```

### 6) VS Code setup (Copilot Chat + MCP)

Use this when you want Playwright MCP available from VS Code chat.

1. Install extensions:
   - GitHub Copilot
   - GitHub Copilot Chat
1. Open VS Code user `settings.json`.
1. Add the same `mcpServers.playwright` block used above (or merge into existing `mcpServers`).
1. Reload VS Code.
1. Open Copilot Chat and run an MCP-aware prompt (examples below).

Minimal config block:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": [
        "-y",
        "@playwright/mcp@latest",
        "--browser",
        "chrome",
        "--output-dir",
        ".playwright-mcp",
        "--save-session"
      ],
      "cwd": "/Users/bobeezy/Workspace/JavaScript/my_mcp_automation_framework"
    }
  }
}
```

### 7) IntelliJ setup (Copilot Chat + MCP)

Use this when you want Playwright MCP available from IntelliJ chat.

1. Install the GitHub Copilot plugin (includes Copilot Chat).
1. Open IDE settings and locate MCP server/tool configuration (or the MCP-capable chat plugin settings, depending on your IntelliJ setup).
1. Add a server named `playwright` using the same command/args/cwd from this README.
1. Restart IntelliJ.
1. Open Copilot Chat and run MCP-aware prompts.

Recommended Playwright MCP command for IntelliJ MCP settings:

```bash
npx -y @playwright/mcp@latest --browser chrome --output-dir .playwright-mcp --save-session
```

### 8) Copilot Chat prompts (all IDEs)

Read Jira ticket and generate scenarios:

```text
Use Playwright MCP to open https://bobymangoua.atlassian.net/browse/KAN-6.
Extract acceptance criteria.
Generate additional negative and edge web login test cases in Given/When/Then format.
Exclude the existing case: invalid password.
```

Write code directly in this project:

```text
Using the generated scenarios from KAN-6, update tests/web/login.web.spec.js.
Add only new negative and edge tests.
Keep existing style with test.step, URL assertions, and flash message assertions.
Update data/web/login.json only if required for deterministic test data.
```

### 9) Master prompt template (reusable)

Use this template for any Jira story:

```text
Use Playwright MCP to open Jira ticket: <JIRA_URL_OR_KEY>.

Context:
- Project path: /Users/bobeezy/Workspace/JavaScript/my_mcp_automation_framework
- Existing tests to review first: <SPEC_FILES>
- Existing scenarios to exclude: <EXISTING_SCENARIOS_TO_EXCLUDE>

Tasks:
1) Extract requirement and acceptance criteria from the ticket.
2) Return test scenarios in Given/When/Then grouped by:
   - Positive
   - Negative
   - Edge
3) For each scenario include:
   - Priority (P0/P1/P2)
   - Expected result
   - Suggested test name
   - Suggested target file path
4) If requested, implement selected scenarios in code:
   - Update only approved files
   - Reuse existing test style and helper patterns
   - Keep deterministic data in JSON fixtures
5) After code generation, run lint and targeted tests and report results.

Output format:
- Section A: Extracted AC
- Section B: Generated scenarios
- Section C: Proposed code changes
- Section D: Verification commands and outcomes
```

### 10) How to confirm Playwright MCP is connected

Use this checklist:

1. Reload the IDE window after editing MCP settings.
1. Open MCP servers/tools panel and confirm server name `playwright` is visible.
1. Run a tiny prompt in chat:

```text
Use Playwright MCP to open https://bobymangoua.atlassian.net/browse/KAN-6 and return only the ticket summary.
```

Connected behavior:

- MCP tool/browser actions start
- Prompt returns live page-derived content (for example ticket summary text)

Not connected behavior:

- chat cannot find/use `playwright` MCP tools
- prompt returns a tool/server-not-available style error

Quick fallback:

```bash
npm run mcp:playwright
```

If this command starts successfully, the Playwright MCP server binary/config is valid.

### 11) Test execution runbook (quick self-check)

Use this sequence before reporting failures:

1. Lint first:

```bash
npm run lint
```

2. Confirm browser binaries:

```bash
npm run pw:install
```

3. Run web tests:

```bash
npm run test:web
```

Note:

- Browser binaries are now pinned to a project-local cache: `.playwright-browsers/`.
- `npm run test:web` auto-runs `npm run pw:install` first (`pretest:web`) to prevent "Executable doesn't exist" browser-launch failures.

4. Run API tests:

```bash
npm run test:api
```

5. If API fails with DNS/network errors (for example `ENOTFOUND`), verify host reachability:

```bash
curl -I https://dummyjson.com/users/1
```

6. If web tests stall early, run a single smoke case:

```bash
PLAYWRIGHT_BROWSERS_PATH=.playwright-browsers npx playwright test tests/web/login.web.spec.js -g "Positive: user logs in successfully" --max-failures=1
```

7. If Allure still shows old failures, clear stale results then regenerate:

```bash
rm -rf allure-results allure-report test-results playwright-report && npm test && npm run report:allure
```

### 12) Verification modes (fast vs full)

#### Fast daily verification

Use this for normal development runs:

```bash
npm run test:verify
```

What it does:

1. Runs `npm run lint` to catch static issues first.
1. Runs `npm test` to execute all Playwright projects (`web` + `api`).

#### Full repair + verification

Use this when browser binaries are broken/missing (for example `Executable doesn't exist`):

```bash
npm run test:verify:full
```

What it does:

1. Runs `npm run lint`.
1. Runs `npm run pw:install` (forced Playwright browser reinstall in `.playwright-browsers`).
1. Runs `npm test`.

Why it exists:

- `test:verify` stays fast for day-to-day work.
- `test:verify:full` is the recovery path when browser cache issues appear.
- both keep the same lint-first validation pattern.

### Mac browser architecture caveat

On macOS (especially Apple Silicon), if Playwright downloads wrong-architecture browser binaries
(example error: `Executable doesn't exist ... chrome-headless-shell-mac-arm64`), reinstall Chromium
and headless shell for the current machine architecture:

```bash
rm -rf .playwright-browsers/chromium-1208 .playwright-browsers/chromium_headless_shell-1208
PLAYWRIGHT_BROWSERS_PATH=.playwright-browsers npx playwright install chromium
```

## Secret scanning with Gitleaks

This project uses `gitleaks` in the pre-commit hook to prevent committing secrets.

Current hook (`.husky/pre-commit`):

```sh
#!/usr/bin/env sh
npm run lint

# setup Gitleaks secret scanner before commits
gitleaks detect --source .
```

### How it behaves

- On every `git commit`, lint runs first.
- Then `gitleaks` scans repository content for potential secrets.
- If leaks are found, commit is blocked.

### Run Gitleaks manually

```bash
gitleaks detect --source .
```

Recommended before pushing:

```bash
npm run lint && gitleaks detect --source . && npm test
```

### Notes

- Keep real credentials only in local ignored files.
- If a secret is found, rotate it and remove it from tracked history if needed.

## Architecture guardrails

Use these guardrails for maintainability and consistent design:

- Fixtures:
  - Web specs must import `test/expect` from `fixtures/webTest`.
  - API specs must import `test/expect` from `fixtures/apiTest`.

- Web automation:
  - Keep page selectors and UI actions inside `pages/` classes.
  - Specs should focus on scenario flow and assertions, not raw selectors.
  - Use relative navigation in page objects (example: `page.goto('/login')`) so `baseURL` remains centralized in `playwright.config.js`.

- API automation:
  - Route all API calls through `clients/` classes (`AuthApiClient`, `UserApiClient`).
  - Keep request/response reporting and sanitization in `utils/apiReporter.js`.
  - For persistent APIs, use lifecycle-realistic CRUD (create -> read -> update -> delete with created ID).
  - For demo/non-persistent APIs (like `dummyjson`), validate create response contract separately and run read/update/delete against known stable IDs.

- Naming:
  - Files: `*.spec.js` for specs, `*Page.js` for page objects, `*ApiClient.js` for API clients.
  - Test titles should include operation and intent (example: `POST: create a user`).

- Reliability:
  - Optional API retry for transient 5xx/network issues is allowed only in non-prod by env policy.
  - Always assert response-time thresholds with `API_MAX_RESPONSE_TIME_MS`.

- Security:
  - Never hardcode credentials or tokens in test code.
  - Keep secrets in `data/credentials/.env.credentials` (gitignored).
