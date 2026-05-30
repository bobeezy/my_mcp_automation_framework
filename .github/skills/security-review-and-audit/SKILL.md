---
name: security-review-and-audit
description: Review security-sensitive changes to .github/ control-plane assets — agents, skills, guardrails, prompts, rules — before they are merged. Use when any of these files are modified.
---

# 🔒 Skill: Security review and audit

## Use when

- Any file under `.github/` is being added or changed: `agents/`, `skills/`, `guardrails/`, `prompts/`, `rules/`, `copilot-instructions.md`
- A prompt, skill, or agent instruction could affect how Copilot behaves for all contributors
- A change touches Husky hooks (`.husky/`), `playwright.config.js` secrets handling, or `utils/apiReporter.js` redaction logic

## Why this matters

Files under `.github/` govern Copilot behaviour across every chat, agent, and skill session. A small wording change can systematically introduce a bypass if the model follows the updated instruction in all future sessions. Changes here are higher-risk than changes to test code.

## Workflow

1. **Read the diff** — understand what changed and why
2. **Apply the self-scan** (see below) — one question per item
3. **Flag any red flags** — do not proceed with a change that fails the scan; ask the user to confirm intent
4. **Confirm the change is PR-scoped** — no force-push, no direct merge to `main`
5. **Verify the security chain is intact** — `copilot-instructions.md` guardrails section, `guardrails/security-guardrails.md`, and this skill remain consistent

## Self-scan questions

Answer each for the proposed change before approving:

1. Does this introduce or normalise a sensitive value, credential, production target, or privileged action?
2. Does it imply an agent or Copilot can approve, merge, deploy, or bypass review on behalf of a human?
3. Does it weaken language around branch protection, CODEOWNERS, Husky (`--no-verify`), CI, or secret scanning?
4. Does it move rationale or examples into a runtime instruction file where they will inflate or destabilise the contract?
5. If this wording were followed literally in a future session, would the safest reading still keep the action local, lint-clean, and PR-ready?

If any answer is **yes**, flag it and ask the user for explicit confirmation before making broader changes.

## Scope of this skill

| In scope | Out of scope |
|----------|-------------|
| `.github/agents/*.agent.md` | `tests/`, `pages/`, `clients/` test code |
| `.github/skills/**/SKILL.md` | `data/` test fixtures |
| `.github/guardrails/*.md` | `playwright.config.js` (unless secrets handling changes) |
| `.github/prompts/*.md` | `README.md` general docs |
| `.github/rules/*.md` | Normal refactors and spec additions |
| `.github/copilot-instructions.md` | |
| `.husky/pre-commit` | |
| `utils/apiReporter.js` redaction logic | |

## Green patterns

- Removing legacy aliases or BDD/Selenium references and replacing with Playwright-specific guidance
- Adding project-specific examples (repo paths, real command names)
- Updating skill `description` frontmatter to improve agent discovery
- Adding a "done when" checklist that mirrors existing completion criteria

## Red flags

- A guardrail rule softened "just for this task" or "just for tests"
- An instruction that says "assume credentials are available" without a pointer to `.env.example`
- Rationale or examples moved into `copilot-instructions.md` or `security-guardrails.md` directly
- A skill or agent that claims authority to merge, deploy, or approve on behalf of a human
- Removal of `gitleaks` or `npm run lint` from the pre-commit chain

## Security baseline

The active behavioural contract is in:
- `../../copilot-instructions.md` — summary guardrails
- `../guardrails/security-guardrails.md` — detailed rules
- `../guardrails/security-guardrail-reference.md` — rationale and review aid

Do not weaken any of these files; update all consistently when a rule genuinely needs to change.

## Done when

- [ ] Self-scan completed; no unanswered red flags
- [ ] Change is PR-scoped and does not weaken the security baseline
- [ ] `copilot-instructions.md`, `security-guardrails.md`, and affected skill/agent are consistent
- [ ] `npm run lint` passes on touched files
