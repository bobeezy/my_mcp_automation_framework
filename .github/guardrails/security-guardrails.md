# 🔒 Security guardrails

Behavioural security contract for Copilot chat, custom agents, skills, and prompts in this **Playwright + JavaScript** repository.

**Summary** lives in [`../copilot-instructions.md`](../copilot-instructions.md) (Security guardrails section). This document adds repo-specific detail. Do not weaken either file; update both together when rules change.

Applies to everyone generating or editing: `tests/`, `pages/`, `clients/`, `fixtures/`, `hooks/`, `utils/`, `data/`, `playwright.config.js`, and `.github/` assets.

---

## 🚫 Secrets and sensitive data

Never generate, reveal, persist, copy, or log:

- Passwords, API keys, bearer tokens, refresh tokens, session cookies
- Private keys, certificates, connection strings
- Real values from `data/credentials/.env.credentials` or `ENV_FILE` overrides
- Playwright `storageState` files that contain live sessions
- Jira or third-party tokens (`JIRA_API_TOKEN`, etc.) outside gitignored env files

**Never place secrets in:**

| Area | Examples |
|------|----------|
| Source | `*.spec.js`, `pages/`, `clients/`, `fixtures/`, `hooks/`, `utils/` |
| Config | `playwright.config.js`, committed `.env` files |
| Data | `data/web/*.json`, `data/api/*.json` (use placeholders only) |
| Docs / AI assets | `README.md`, `.github/**`, chat replies |
| Test output | HTML report, `allure-results/`, traces, videos, screenshots, `testInfo` attachments |

**Do instead:**

- Read credentials with `getRequiredEnv()` from `utils/env.js`
- Document variable names in `.env.example`; keep real values in `data/credentials/.env.credentials` (gitignored)
- Use dummy or documented public demo accounts (e.g. Herokuapp / DummyJSON samples) in examples
- Run `gitleaks detect --source .` before commit (Husky pre-commit runs this with `npm run lint`)

---

## 🌐 Playwright test artefacts

This project retains traces, video, and screenshots on failure (`playwright.config.js`). Web tests attach screenshots in `WebHooks`.

- **Before screenshots:** `WebHooks.redactCredentialFields()` clears username/password fields in the DOM — extend `credentialSelectors` in `hooks/WebHooks.js` when adding new sensitive inputs
- **API tests:** `utils/apiReporter.js` attaches request/response metadata — must not include real tokens or passwords in logged bodies; redact or omit sensitive headers and payloads in attachments
- Do not commit `playwright-report/`, `test-results/`, `allure-results/`, or `.playwright-mcp/` session exports with real credentials

---

## 🏗️ Safe automation scope

- Target **non-production** demo endpoints unless the user explicitly confirms otherwise (`WEB_BASE_URL`, `API_BASE_URL` from env)
- Do not script destructive actions (mass delete, privilege escalation, production data mutation)
- Do not disable or advise bypassing: branch protection, PR review, CODEOWNERS, Husky hooks (`--no-verify`), or secret scanning
- Prefer JSON fixtures under `data/web/` and `data/api/` for negative paths — not live customer data

---

## 📁 Repository control plane

Treat edits under `.github/` as security-sensitive:

- `copilot-instructions.md`, `agents/*.agent.md`, `skills/**/SKILL.md`, `guardrails/`, `prompts/`, `rules/`
- Changes should be small, PR-scoped, and reviewed by a human
- Use [`../skills/security-review-and-audit/SKILL.md`](../skills/security-review-and-audit/SKILL.md) before broad changes to these paths

Do not merge, deploy, rotate production secrets, or approve PRs on behalf of a human.

---

## 🔄 Allowed workflow

- Local edits, `npm run lint`, targeted `npx playwright test`, and PR-ready summaries
- Mocks, stubs, and fixture data for examples
- Explaining how to copy `.env.example` → `data/credentials/.env.credentials` without filling in real secrets in chat

If a request conflicts with these guardrails, refuse the unsafe part, offer the safest alternative (e.g. placeholder env vars), and ask for explicit human confirmation.

---

## ⬆️ Escalate to a human when

- Production or shared staging systems would be touched
- Real customer, employee, or regulated data would be used in tests or attachments
- Authentication flows, IAM, or secret rotation are involved
- Compliance evidence, audit logs, or org-wide governance would change
- The task needs credentials or access not already documented in `.env.example`

Do not invent, fetch, or “work around” missing secrets.
