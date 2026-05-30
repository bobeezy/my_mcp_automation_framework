---
name: test-maintenance-and-quality
description: Fix failing or flaky tests, improve readability, remove duplication, and enforce layering in this Playwright + JavaScript repo — without changing test behaviour or coverage.
---

# 🔧 Skill: Test maintenance and quality

## Use when

- A test is failing, flaky, or producing inconsistent results
- Locators have become brittle after an app update
- Specs contain duplicated setup, hardcoded data, or logic that belongs in a page object or client
- Code smell is reducing readability or making the suite harder to extend

## Workflow

1. **Reproduce the failure** — run `npx playwright test <file> -g "<title>"` and capture the error; check the Playwright trace or Allure report if available
2. **Identify the root cause** — spec logic, locator, test data, or timing
3. **Fix at the right layer** — spec, page object, client, or data file; do not patch symptoms
4. **Apply quality improvements** opportunistically on touched files (see rules below)
5. **Validate** — re-run the affected test(s) and `npm run lint`; report commands and results

## Common failure patterns

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| `Timeout waiting for locator` | Locator is fragile or the element ID changed | Update locator in `pages/*Page.js` using priority order |
| `Expected X, received Y` on URL | Navigation changed or `baseURL` env mismatch | Check `WEB_BASE_URL` env and `goto()` path in page object |
| API test `status 401` / `403` | Credentials stale or env not loaded | Verify `data/credentials/.env.credentials` and `getRequiredEnv()` call |
| Test passes locally, fails CI | Timing or worker isolation | Remove `waitForTimeout`; use web-first `expect`; check `fullyParallel` / `workers` config |
| Intermittent assertion failure | Shared mutable state between tests | Use `test.describe.serial` only with CRUD order dependencies; otherwise isolate state |

## Locator repair priority

Replace broken selectors using this order — same as the `find-locator` prompt:

1. `page.locator('#id')` — stable unique ID
2. `page.getByRole(role, { name })` — semantic
3. `page.getByLabel(text)` — labelled input
4. `page.getByPlaceholder(text)` — placeholder
5. `page.getByText(text)` — readable text
6. Stable attribute selector — `[type="submit"]`, `[data-testid="..."]`

## Quality rules (apply on touched files)

### Specs

- `test` / `expect` imported from `fixtures/webTest.js` or `fixtures/apiTest.js`
- `expect.hasAssertions()` present in web tests
- Multi-step flows wrapped in `test.step(...)` with user-journey titles
- Repeated navigation or assertion sequences extracted to local helpers inside `test.describe`
- Negative/edge values in `data/web/*.json` or `data/api/*.json` — not inline

### Page objects

- All locator fields are `readonly Locator`
- No `expect(...)` calls inside page objects — assertions belong in specs
- No inline `page.locator(...)` inside methods — use named fields

### API clients

- All HTTP calls via `callApiWithReport` — no raw `request.post` in specs
- Shared request-building logic in private methods rather than duplicated per endpoint

## What not to change

- Test titles, scenario coverage, or expected outcomes
- `WebHooks.js` credential redaction selectors unless the fix requires it
- `playwright.config.js` unless the failure is a configuration issue
- Fixture registration in `fixtures/webTest.js` or `fixtures/apiTest.js`

## Security

- Do not introduce credentials or real tokens while fixing tests
- Preserve `WebHooks.redactCredentialFields()` — extend `credentialSelectors` if new sensitive inputs are added as part of the fix

## Done when

- [ ] Failure reproduced and root cause identified
- [ ] Fix applied at the correct layer (spec / page / client / data / config)
- [ ] No test titles, coverage, or intended outcomes changed
- [ ] `npm run lint` passes on touched files
- [ ] Affected tests re-run and pass; results reported

