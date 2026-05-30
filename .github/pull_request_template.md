# 📗 Pull request

Please complete the sections below before requesting review.

## 1️⃣ Pre-submit checklist

- [ ] No secrets, tokens, or real credentials in committed files (use `data/credentials/.env.credentials`, gitignored)
- [ ] Web specs import `test` / `expect` from `fixtures/webTest.js`; API specs from `fixtures/apiTest.js`
- [ ] UI logic in page objects; HTTP calls in API clients (not duplicated in specs)
- [ ] `npm run lint` passes
- [ ] `gitleaks detect --source .` passes (also run on pre-commit via Husky)
- [ ] `npm run test:web` passes (if web changes)
- [ ] `npm run test:api` passes (if API changes)
- [ ] `npm run test:verify` run before merge when in doubt
- [ ] Test commands and results recorded in section 6️⃣
- [ ] **Completed checklist above**

## 2️⃣ Describe your change(s)

📌 **Summary:**

<!-- What changed and why (1–3 sentences) -->

📌 **Motivation and context:**

<!-- Bug, ticket, or improvement driving this PR -->

📌 **Dependencies:**

<!-- Other PRs, branches, or packages — or N/A -->

## 3️⃣ Related work

🎫 **Ticket / issue:**

<!-- Jira, GitHub issue, or requirement link. Use N/A if none. -->

- 

## 4️⃣ Type of change

📌 Tick all that apply:

- [ ] 🧪 Test coverage (new or updated `tests/web` or `tests/api` specs)
- [ ] 🏗️ Framework / helpers (`pages/`, `clients/`, `fixtures/`, `hooks/`, `utils/`)
- [ ] 📄 Test data (`data/web/`, `data/api/`) — no real credentials
- [ ] ⚙️ Configuration (`playwright.config.js`, `.env.example`, ESLint)
- [ ] 📚 Documentation (`README.md`, `.github/copilot-instructions.md`)
- [ ] 🐛 Bug fix
- [ ] ♻️ Refactor (no intended behaviour change)
- [ ] 📎 Other

## 5️⃣ Areas touched

- [ ] 🌐 Web UI (`tests/web/`, `pages/`)
- [ ] 🔌 API (`tests/api/`, `clients/`)
- [ ] 🔧 Shared (fixtures, hooks, config, utils)
- [ ] 📝 Docs / tooling only

## 6️⃣ Test evidence

📌 Commands run and result (pass / fail):

```text
# Examples:
# npm run test:web
# npm run test:api
# npm run test:verify

```

## 7️⃣ Screenshots / reports (optional)

📸 Playwright HTML or Allure — attach paths or notes if useful for reviewers.

## 8️⃣ Notes for reviewers

💬 Breaking changes, flaky areas, follow-ups, or local env vars needed.
