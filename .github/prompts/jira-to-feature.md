---
description: Jira ticket → Playwright test scenarios → TypeScript spec implementation. Provide a Jira URL or key and the agent will extract AC, propose scenarios, and implement approved ones.
mode: agent
tools:
  - codebase
  - editFiles
  - browser
---

You are working in a **Playwright Test + JavaScript** project. Use the Playwright MCP browser to open the Jira ticket, extract requirements, propose test scenarios as Playwright specs, and implement only the ones the user approves.

## Step 1 — Read the ticket

Use the MCP browser to open the Jira ticket URL or key provided by the user.

Extract:
- **Summary** — one-line description of the feature or bug
- **Acceptance criteria** — all conditions that define done
- **Scope** — which layer(s) are affected: web UI (`WEB_BASE_URL`), HTTP API (`API_BASE_URL`), or both

If the ticket is not accessible, ask the user to paste the summary and AC directly.

## Step 2 — Review existing coverage

Before proposing anything new, read the relevant existing specs:

- `tests/web/` — web scenarios already covered
- `tests/api/` — API scenarios already covered
- `data/web/*.json` and `data/api/*.json` — data already in fixtures

Do not propose scenarios that are already covered.

## Step 3 — Propose scenarios

Present a scenario table grouped by type. Do not write code yet.

For each scenario include:

| # | Type | Scenario description | Layer | Priority | Expected result | Suggested test name | Target file |
|---|------|----------------------|-------|----------|-----------------|---------------------|-------------|
| 1 | Positive | ... | Web / API | P0 / P1 / P2 | ... | `Positive: ...` | `tests/web/<name>.web.spec.js` |
| 2 | Negative | ... | API | P0 | ... | `Negative: ...` | `tests/api/<name>.api.spec.js` |
| 3 | Edge | ... | Web | P2 | ... | `Edge: ...` | `tests/web/<name>.web.spec.js` |

**Types:**
- **Positive** — happy path; confirms the feature works as specified
- **Negative** — invalid input, error states, rejected requests
- **Edge** — boundary values, empty input, whitespace, oversized payloads, timing

**Priority:**
- P0 — core behaviour; blocks release if broken
- P1 — important but not blocking
- P2 — edge case; low likelihood or impact

Wait for the user to confirm which scenarios to implement before proceeding.

## Step 4 — Implement approved scenarios

Implement only the scenarios the user explicitly approves.

### Web specs (`tests/web/<name>.web.spec.js`)

Follow `tests/web/login.web.spec.js`:

- Import `test`, `expect` from `fixtures/webTest.js`
- Import the relevant `*Page` from `pages/` — create the page object if it does not exist
- Load credentials with `getRequiredEnv()` from `utils/env.js`
- Load negative/edge values from `data/web/<name>.json` (create the file if needed)
- Wrap each test in `test.step(...)` with user-journey-readable titles
- Start each test with `expect.hasAssertions()`
- Extract repeated navigation and assertion flows to local helpers inside `test.describe`

### API specs (`tests/api/<name>.api.spec.js`)

Follow `tests/api/login.api.spec.js` and `tests/api/user.crud.api.spec.js`:

- Import `test`, `expect` from `fixtures/apiTest.js`
- Instantiate the client: `new <Name>ApiClient({ request, testInfo })`
- Load credentials with `getRequiredEnv()`
- Load negative payload values from `data/api/<name>.json` (create the file if needed)
- Assert `response.ok()`, `response.status()`, body fields, and optionally `metrics.finalAttemptDurationMs`
- If a new client or client method is needed, add it to `clients/<Name>ApiClient.js` using `callApiWithReport`

### Data files

- Negative and edge values go in `data/web/<name>.json` or `data/api/<name>.json`
- No real credentials, tokens, or personally identifiable values in data files
- Use clearly labelled placeholders matching the naming in `data/web/login.json` and `data/api/login.json`

## Step 5 — Validate

After implementation:

1. Run `npm run lint` — report any errors
2. Run the narrowest Playwright command that covers the new specs:
   - `npx playwright test tests/web/<file>.web.spec.js`
   - `npx playwright test tests/api/<file>.api.spec.js`
   - Or `npm run test:web` / `npm run test:api` for the full suite
3. Report: commands run, pass/fail counts, any failures with titles

## Inputs needed from the user

- **Jira ticket URL or key** — e.g. `https://your-workspace.atlassian.net/browse/TE-123` or `TE-123`
- **Existing spec files to review** (optional) — if known, speeds up duplicate detection
- **Scenarios to skip** (optional) — if some AC are out of scope for automation
