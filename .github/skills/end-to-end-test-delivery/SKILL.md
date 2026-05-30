---
Name: end-to-end-test-delivery
Description: Deliver complete Playwright automation for a requirement spanning web UI, API, or both. Use when a single ticket or flow needs coverage across multiple layers.
---

# 🚀 Skill: End-to-end test delivery

## Use when

- A requirement or user story needs coverage at more than one layer (web + API, or a flow that spans both)
- A ticket has been approved for automation and the full slice — spec, page object or client, and test data — needs to be delivered together
- You want to orchestrate the other skills in the right order rather than working layer by layer manually

## Workflow

1. **Classify the requirement** — determine which layers are needed: web UI, API, or both; confirm with the user if unclear
2. **Inspect existing files** — read `tests/web/`, `tests/api/`, `pages/`, `clients/`, `data/` before creating anything new; do not duplicate existing coverage
3. **Author scenarios first** — use `../feature-authoring/SKILL.md` to produce a scenario table (Positive / Negative / Edge); wait for approval before writing code
4. **Implement by layer** in this order:
   - **Web UI** → `../browser-page-objects/SKILL.md` for page objects, then write `tests/web/*.web.spec.js`
   - **API** → `../api-test-development/SKILL.md` for clients and `tests/api/*.api.spec.js`
   - **Shared data** → `data/web/<name>.json` and `data/api/<name>.json` for negative/edge values
5. **Review quality** — apply `../test-maintenance-and-quality/SKILL.md` to remove duplication and obvious smell in touched files
6. **Validate** — run `npm run test:verify` (lint + all tests) or the narrowest commands that cover the new specs; report pass/fail

## Layer routing

| Requirement layer | Primary skill | Target paths |
|-------------------|--------------|-------------|
| Web UI only | `browser-page-objects` + web spec | `tests/web/`, `pages/` |
| API only | `api-test-development` | `tests/api/`, `clients/` |
| Web + API | Both skills; separate spec files | `tests/web/` + `tests/api/` |
| Responsive / device | `mobile-test-development` | `playwright.config.js` project + `tests/web/` |
| `.github/` control plane | `security-review-and-audit` first | `.github/agents/`, `skills/`, `guardrails/` |

**Do not mix UI assertions and HTTP assertions in a single spec file.** A web spec navigates and asserts on page objects; an API spec calls clients and asserts on response fields.

## Fixture and hook rules

- Web specs: import `test`, `expect` from `fixtures/webTest.js`
- API specs: import `test`, `expect` from `fixtures/apiTest.js`
- `WebHooks` (screenshots, credential redaction) and `ApiHooks` (start/end attachments) fire automatically — do not duplicate attachment logic in specs

## Validation commands

| Scope | Command |
|-------|---------|
| New web spec only | `npx playwright test tests/web/<file>.web.spec.js` |
| New API spec only | `npx playwright test tests/api/<file>.api.spec.js` |
| Both layers changed | `npm run test:verify` |
| Lint only | `npm run lint` |

## Security

- Credentials via `getRequiredEnv()` — never literals in specs, page objects, clients, or data files
- No real tokens, passwords, or PII in `data/web/*.json` or `data/api/*.json`
- Route `.github/` control-plane changes through `../security-review-and-audit/SKILL.md` before broader edits
- Do not target production endpoints without explicit human confirmation

## Done when

- [ ] Scenario table approved before any code was written
- [ ] No existing scenario coverage duplicated
- [ ] Web specs in `tests/web/`, API specs in `tests/api/` — no mixed-layer specs
- [ ] Page objects in `pages/`, API clients in `clients/` — no low-level calls in specs
- [ ] Negative/edge data in `data/web/` or `data/api/` JSON files
- [ ] `npm run lint` passes on all touched files
- [ ] `npm run test:verify` (or targeted commands) passes and results reported
