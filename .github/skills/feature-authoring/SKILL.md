---
Name: feature-authoring
Description: Break a requirement into Playwright test scenarios before any code is written. Use when planning coverage for a new feature, ticket, or bug fix.
---

# 📋 Skill: Feature authoring

## Use when

- A Jira ticket, GitHub issue, or user story needs to be converted into a test plan
- You need to decide which scenarios to automate and at which layer before writing specs
- Existing coverage needs a gap analysis before adding new tests

## Workflow

1. **Read the requirement** — extract summary and acceptance criteria from the ticket or user story
2. **Inspect existing specs** — read `tests/web/` and `tests/api/` to identify what is already covered
3. **Map each AC item** to a scenario type and layer; flag items that are not automatable
4. **Produce a scenario table** — do not write code at this stage
5. **Present for approval** — wait for the user to confirm which scenarios to implement before proceeding

## Scenario table format

| # | Type | Description | Layer | Priority | Expected result | Suggested test name | Target file |
|---|------|-------------|-------|----------|-----------------|---------------------|-------------|
| 1 | Positive | Happy-path behaviour | Web / API | P0 | ... | `Positive: ...` | `tests/web/<name>.web.spec.js` |
| 2 | Negative | Invalid input or error state | API | P0 | ... | `Negative: ...` | `tests/api/<name>.api.spec.js` |
| 3 | Edge | Boundary value or unexpected input | Web | P2 | ... | `Edge: ...` | `tests/web/<name>.web.spec.js` |

**Types**

- **Positive** — confirms the feature works as specified under normal conditions
- **Negative** — invalid input, rejected requests, error messages, access denied
- **Edge** — boundary values, empty input, whitespace, oversized payloads, special characters

**Priorities**

- **P0** — core behaviour; a broken scenario blocks release
- **P1** — important but not blocking
- **P2** — edge case; low likelihood or limited impact

**Layers**

- **Web** → `tests/web/*.web.spec.js`, page objects in `pages/`
- **API** → `tests/api/*.api.spec.js`, clients in `clients/`
- **Both** → separate specs; do not combine UI and HTTP assertions in one file

## Rules

- Do not propose scenarios already covered by existing specs
- Do not write code until the user approves the scenario table
- Do not automate scenarios that require production data, live credentials, or privileged access
- Data for negative/edge paths goes in `data/web/<name>.json` or `data/api/<name>.json` — note this in the table

## Handoff

Once approved, pass the scenario table to:

- `../api-test-development/SKILL.md` for API scenarios
- The `generate-page-object` prompt and web spec patterns for web scenarios
- `../../prompts/jira-to-feature.md` if working from a Jira ticket with MCP

## Done when

- [ ] All AC items mapped to scenarios or flagged as out of scope
- [ ] Duplicate coverage identified and excluded
- [ ] Scenario table presented and user approval received
- [ ] No code written at this stage
