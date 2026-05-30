# 🔍 Security guardrail reference

Review and interpretation companion to [`security-guardrails.md`](security-guardrails.md) for this **Playwright + TypeScript** repository.

**This file is not a second enforcement source.** The active behavioural contract is `security-guardrails.md` (detailed) and the Security guardrails section in `../copilot-instructions.md` (summary). This file exists to help contributors and reviewers understand the intent, spot red flags in proposed changes, and apply consistent judgement when edge cases arise.

---

## 🎯 Purpose

Use this file when:

- Reviewing a PR that touches `.github/` control-plane assets
- Deciding whether a new prompt, skill, or spec crosses a guardrail
- Explaining to a contributor *why* a pattern is unsafe even if it looks convenient
- Running a self-scan before opening a PR on Copilot-facing files

---

## 🧭 How the two guardrail files relate

| File | Role |
|------|------|
| `security-guardrails.md` | Behavioural rules — what agents, chat, and skills must and must not do |
| `security-guardrail-reference.md` (this file) | Intent and review guidance — rationale, examples, self-scan |

Changes to the rules go in `security-guardrails.md`. Changes to examples or rationale go here. Do not copy the behavioural rules into this file and then drift them independently.

---

## 💡 Rationale for key rules

**Why `getRequiredEnv()` and gitignored credentials?**
Playwright tests run locally and in CI. Hardcoded credentials leak into `git log`, GitHub diffs, Playwright HTML reports, Allure artefacts, and team chat. `utils/env.js` + `data/credentials/.env.credentials` (gitignored) keeps secrets out of every surface that gets stored or shared.

**Why does `WebHooks` redact fields before screenshots?**
`hooks/WebHooks.js` targets `#username`, `input[type="password"]`, and related selectors before `page.screenshot()`. Without this, failure screenshots attached to `testInfo` (and uploaded to Allure or CI artefacts) would contain cleartext passwords. Extend `credentialSelectors` whenever a new sensitive input is added to the app under test.

**Why are `apiReporter.js` attachments held to the same standard?**
`utils/apiReporter.js` attaches request/response metadata to every API test. Logging the raw `Authorization` header or a JSON body that contains a password would persist in `allure-results/` — which is easy to publish accidentally.

**Why are `.github/` edits treated as security-sensitive?**
`copilot-instructions.md`, `agents/`, `skills/`, `guardrails/`, `prompts/`, and `rules/` govern how Copilot behaves for every contributor. A small wording change that appears editorial can introduce a systematic bypass if the model follows the updated instruction in all subsequent sessions.

**Why avoid `--no-verify` on commits?**
The Husky pre-commit hook runs `npm run lint` and `gitleaks detect --source .`. Skipping it removes the last automated local check before a secret reaches the remote.

---

## 🔎 Self-scan questions before opening a PR

Use these when editing any file under `.github/`:

1. Does this change introduce or normalise a sensitive value, privileged action, production mutation, or real customer data?
2. Does it imply an agent or Copilot can approve, merge, deploy, or bypass review on behalf of a human?
3. Does it weaken language around branch protection, CODEOWNERS, Husky, CI, or secret scanning?
4. Does it move rationale or examples into `security-guardrails.md` or `copilot-instructions.md` in a way that makes those files longer and less stable?
5. If this wording were followed literally by an agent in a future session, would the safest reading still keep the action local, lint-clean, and PR-ready?

If any answer is yes, treat it as an escalation trigger and get explicit human review before merging.

---

## ✅ Green patterns

- Proposing placeholder values (`YOUR_API_KEY`, `<your-token>`) in documentation and `.env.example`
- Loading credentials via `getRequiredEnv()` and `data/credentials/.env.credentials`
- Using Herokuapp / DummyJSON demo accounts in tests and examples (they are intentionally public)
- Attaching test metadata JSON (`api-test-start.json`, `web-last-step.png`) that contains no credentials
- PR-scoped, minimal edits to `.github/` assets followed by human review

## 🚩 Red flags

- A value that looks like a token, key, or password appears in any tracked file
- An instruction implies the agent can `--no-verify`, force-push, or auto-approve a PR
- A skill or prompt says "assume credentials are available" without pointing to `.env.example`
- `playwright-report/`, `allure-results/`, or `.playwright-mcp/` is added to a commit or published with real session data
- A guardrail rule is softened "just for tests" or "just for this task"
- Rationale added directly to `security-guardrails.md` instead of here, making the contract harder to read

---

## 🚫 What this file does not do

- Does not grant permission for any action
- Does not replace PR review, CODEOWNERS, CI checks, or Husky hooks
- Does not authorise production access, secret rotation, or privilege changes
- Does not define platform enforcement or repository permissions
