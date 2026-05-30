---
description: Refactor Playwright specs, page objects, or API clients in this repo — improve readability, remove duplication, fix smells, and enforce layering without changing test behaviour.
mode: agent
tools:
  - codebase
  - editFiles
---

You are working in a **Playwright Test + JavaScript** project. Refactor the file(s) provided by the user without changing the intended test behaviour.

## Scope

Refactoring may apply to any of:

- `tests/web/*.web.spec.js` — spec readability, step coverage, assertion style
- `tests/api/*.api.spec.js` — spec readability, client usage, assertion style
- `pages/*Page.js` — locator stability, method naming, encapsulation
- `clients/*ApiClient.js` — method extraction, `callApiWithReport` usage
- `fixtures/`, `hooks/`, `utils/` — if the user explicitly includes them

## What to improve

### Specs (`tests/web/`, `tests/api/`)

- Ensure `test` and `expect` are imported from `fixtures/webTest.js` or `fixtures/apiTest.js` — not from `@playwright/test`
- Add `expect.hasAssertions()` at the start of web tests if missing
- Wrap multi-step web flows in `test.step('...', async () => { ... })` — steps should read like a user journey
- Extract repeated navigation and assertion sequences into local helper functions within the `test.describe` block (see `openLoginPage`, `expectLoginFailure` in `login.web.spec.js`)
- Move data literals (invalid passwords, edge-case strings) to `data/web/*.json` or `data/api/*.json`
- Remove duplicated setup that belongs in `beforeEach` or a page object method
- Replace `response.json()` casts with typed `body as Record<string, unknown>` where the codebase already does so

### Page objects (`pages/*Page.js`)

- Ensure all locator fields are `readonly` and typed as `Locator`
- Replace brittle selectors with the next stable option in the priority order:
  1. `page.locator('#id')`
  2. `page.getByRole(role, { name })`
  3. `page.getByLabel(text)`
  4. `page.getByPlaceholder(text)`
  5. `page.getByText(text)`
  6. Stable attribute selector
- Move any assertion (`expect(...)`) that crept into the page object back into the spec
- Extract repeated selector logic into a named `Locator` field rather than calling `page.locator(...)` inline inside methods

### API clients (`clients/*ApiClient.js`)

- Ensure every HTTP call goes through `callApiWithReport` from `utils/apiReporter.js`
- Extract duplicated request-building logic into a shared private method or a shared `ClientOptions` pattern (see `AuthApiClient` and `UserApiClient`)
- Remove any inline `request.post / request.get` calls that bypassed the client

## What not to change

- Test titles, scenario coverage, or expected outcomes
- The behaviour under test (no logic changes)
- `hooks/WebHooks.js` credential redaction selectors unless the user explicitly asks
- `playwright.config.js` unless the user explicitly asks
- Fixture registration in `fixtures/webTest.js` or `fixtures/apiTest.js`

## How to proceed

1. Read the target file(s) in full before suggesting changes
2. List the specific smells or issues found
3. Apply the refactoring
4. Show a brief diff summary: what changed and why
5. Run `npm run lint` mentally — flag any likely ESLint issues in the output for the user to confirm; do not auto-fix lint outside the changed file
6. Do **not** run tests — the user will validate with `npm run test:web`, `npm run test:api`, or a targeted `npx playwright test` command

## Inputs needed from the user

- File path(s) to refactor, e.g. `tests/web/login.web.spec.js`, `pages/LoginPage.js`, `clients/UserApiClient.js`
- Any specific smell or concern to focus on (optional — if omitted, apply all applicable rules above)
