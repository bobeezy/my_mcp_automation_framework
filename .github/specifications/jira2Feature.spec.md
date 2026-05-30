# Spec: Jira ticket → Playwright specs

**Used by:** `.github/prompts/jira-to-feature.md`

## Goal

Given a Jira ticket, extract acceptance criteria, propose Playwright test scenarios without writing code, then implement only the user-approved scenarios as `.web.spec.js` or `.api.spec.js` files matching the patterns in this repo.

## Inputs

| Input | Description | Example |
|-------|-------------|---------|
| Jira ticket | URL or key | `https://workspace.atlassian.net/browse/TE-123` or `TE-123` |
| Existing specs (optional) | Files to read before proposing, to avoid duplicating coverage | `tests/web/login.web.spec.js` |
| Scenarios to skip (optional) | AC items out of scope for automation | `"do not automate the SSO path"` |

## Process

### Phase 1 — Ticket reading

1. Use MCP browser to open the ticket
2. Extract: summary, acceptance criteria, affected layer (web / API / both)
3. If ticket is inaccessible, request summary and AC from the user directly

### Phase 2 — Existing coverage check

Read relevant files in `tests/web/`, `tests/api/`, `data/web/`, `data/api/` to identify already-covered scenarios. Do not propose duplicates.

### Phase 3 — Scenario proposal (no code)

Return a table with columns: `#`, `Type`, `Description`, `Layer`, `Priority`, `Expected result`, `Suggested test name`, `Target file`.

**Types:** Positive · Negative · Edge

**Priorities:** P0 (blocks release) · P1 (important) · P2 (edge / low risk)

**Wait for explicit user approval before writing any files.**

### Phase 4 — Implementation (approved scenarios only)

#### Web specs

| Rule | Detail |
|------|--------|
| File location | `tests/web/<name>.web.spec.js` |
| Fixture import | `import { test, expect } from '../../fixtures/webTest'` |
| Credentials | `getRequiredEnv('WEB_LOGIN_USERNAME')` etc. |
| Negative/edge data | `data/web/<name>.json` — no real credentials |
| Steps | Each test wrapped in `test.step(...)` with user-journey titles |
| Guard | `expect.hasAssertions()` at the start of each test |
| Helpers | Repeated navigation/assertion flows extracted to local functions inside `test.describe` |
| Page object | Reuse from `pages/` or create `pages/<Name>Page.js` if missing |

#### API specs

| Rule | Detail |
|------|--------|
| File location | `tests/api/<name>.api.spec.js` |
| Fixture import | `import { test, expect } from '../../fixtures/apiTest'` |
| Client | `new <Name>ApiClient({ request, testInfo })` |
| Credentials | `getRequiredEnv('API_LOGIN_USERNAME')` etc. |
| Negative data | `data/api/<name>.json` — no real credentials |
| Assertions | `response.ok()`, `response.status()`, body fields, optional `metrics.finalAttemptDurationMs` |
| New endpoints | Add method to `clients/<Name>ApiClient.js` using `callApiWithReport` |

### Phase 5 — Validation

Run and report:

```
npx playwright test tests/web/<file>.web.spec.js
npx playwright test tests/api/<file>.api.spec.js
npm run lint
```

Report: commands run, pass/fail, any failing test titles and error messages.

## Constraints

- Do not implement any scenario before user approval
- Do not duplicate existing scenario coverage
- No real credentials, tokens, or PII in data files or chat output
- No Gherkin, feature files, or step definitions
- No `import { test, expect } from '@playwright/test'` in spec files

## Acceptance criteria

- [ ] Ticket summary and AC extracted and shown before any code is written
- [ ] Scenario table presented, grouped by type, with priority and target file
- [ ] No code written until user confirms approved scenarios
- [ ] Approved specs follow `login.web.spec.js` or `login.api.spec.js` patterns
- [ ] Negative/edge data in `data/web/` or `data/api/` JSON files — no literals in specs
- [ ] New page objects or client methods follow repo conventions
- [ ] `npm run lint` passes on all new files
- [ ] Playwright run executed and results reported

