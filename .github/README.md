# 🤖 Copilot customisation layer

This folder is the **AI customisation layer** for the `my_mcp_automation_framework` — a Playwright + JavaScript test automation framework targeting Herokuapp (web UI) and DummyJSON (HTTP API).

It shapes how GitHub Copilot Chat, Copilot agent mode, and GitHub's cloud agent behave whenever anyone works in this repository: keeping suggestions consistent with the project's conventions, security rules, and architecture — without repeating those standards in every prompt.

---

## 📁 Folder structure

```text
.github/
├── README.md                              ← this file
├── copilot-instructions.md                ← always-on baseline (auto-loaded by Copilot)
├── pull_request_template.md               ← PR form (auto-loaded by GitHub)
│
├── agents/
│   └── ai-test-engineer.agent.md          ← custom Copilot agent definition
│
├── guardrails/
│   ├── security-guardrails.md             ← active behavioural security contract
│   └── security-guardrail-reference.md    ← rationale, green patterns, red flags
│
├── prompts/
│   ├── generate-page-object.prompt.md     ← HTML → page object
│   ├── find-locator.prompt.md             ← element → best locator
│   ├── refactor.prompt.md                 ← structured refactor
│   └── jira-to-feature.md                 ← Jira ticket → test scenarios → specs
│
├── rules/
│   ├── .copilot-commit-message-instructions.md
│   ├── .copilot-issue-title-instructions.md
│   └── .copilot-pull-request-description-instructions.md
│
├── skills/
│   ├── api-test-development/SKILL.md
│   ├── browser-page-objects/SKILL.md
│   ├── end-to-end-test-delivery/SKILL.md
│   ├── feature-authoring/SKILL.md
│   ├── mobile-test-development/SKILL.md
│   ├── security-review-and-audit/SKILL.md
│   └── test-maintenance-and-quality/SKILL.md
│
└── specifications/
    ├── findLocator.spec.md
    ├── jira2Feature.spec.md
    ├── pageObjectFromHtmlSnippet.spec.md
    └── refactor.spec.md
```

---

## Why this folder exists

Without a customisation layer, Copilot has no knowledge of:

- Which files exist (`pages/*Page.js`, `clients/*ApiClient.js`, `fixtures/webTest.js`)
- Which patterns the project enforces (POM, `callApiWithReport`, `getRequiredEnv()`)
- Which imports are correct (`require('../../fixtures/webTest')` — not `@playwright/test` directly)
- Which things are forbidden (Gherkin, TypeScript, Selenium, hardcoded credentials)
- How to keep secrets out of source (`.env.credentials` gitignore pattern, `WebHooks` redaction)

Every file in this folder is an answer to a recurring question the AI would otherwise get wrong, or a pattern it would otherwise have to re-learn from context in every session.

---

## What was built and why

### `copilot-instructions.md` — always-on baseline

**What it is:** A Markdown file that Copilot automatically loads at the start of every Chat session in this repo.

**Why it exists:** Without it, Copilot would fall back to generic Playwright knowledge — generating TypeScript, `import` statements, raw `@playwright/test` imports, and patterns inconsistent with this codebase. This file answers: *who are you, what is this project, what stack, what are the rules*.

**What it covers:**
- The **TestPilot** persona (consistent AI identity for the team)
- Stack declaration: Playwright + JavaScript, CommonJS, ESLint, Allure
- Repository layout table mapping every area to its path and convention
- Architecture rules (POM layering, no low-level calls in specs, no duplicate hooks)
- Playwright locator priority (stable `#id` → semantic → attribute)
- Web test and API test code patterns with full working examples
- Security guardrails summary
- All runnable commands

---

### `agents/ai-test-engineer.agent.md` — specialist AI agent

**What it is:** A Copilot custom agent definition. Extends `copilot-instructions.md` with task-routing logic and a "done when" checklist.

**Why it exists:** The baseline gives Copilot knowledge; the agent gives it a *role*. When invoked with `@ai-test-engineer`, Copilot knows it should: clarify the layer (web vs API), read existing files before inventing, follow a fixed skill-routing table, and report pass/fail evidence.

**How to trigger:**

```
@ai-test-engineer Add positive and negative API tests for the checkout endpoint
@ai-test-engineer Fix the flaky logout test in login.web.spec.js
@ai-test-engineer Use the browser-page-objects skill to add a CheckoutPage
```

---

### `skills/**/SKILL.md` — reusable procedure playbooks

**What they are:** Seven self-contained Markdown procedures. Each defines a `name`, `description`, step-by-step workflow, rules, and a done checklist. The agent loads them on demand.

**Why they exist:** Breaking work into skills keeps each procedure small and focused. The agent doesn't have to hold the entire project methodology in a single instruction set — it loads the relevant skill when the task type matches. Skills are also independently updatable without touching the always-on baseline.

| Skill | What it governs |
|-------|----------------|
| `feature-authoring` | Breaking requirements into scenario tables *before* any code is written — prevents over-engineering and duplicate coverage |
| `api-test-development` | Creating and maintaining `tests/api/*.api.spec.js` specs and `clients/*ApiClient.js` — enforces `callApiWithReport`, correct fixture imports, and data file patterns |
| `browser-page-objects` | Creating and updating `pages/*Page.js` — enforces constructor-assigned locators, `module.exports`, no assertions inside page objects |
| `mobile-test-development` | Adding Playwright device emulation projects to `playwright.config.js` — guards against Appium or native driver suggestions |
| `end-to-end-test-delivery` | Orchestrating web + API coverage for a single requirement in the right order — ensures scenario approval before code, layer separation, and full validation |
| `test-maintenance-and-quality` | Fixing flakes, brittle locators, and code smell — provides a root-cause checklist and locator repair priority order |
| `security-review-and-audit` | Self-scan checklist before editing any `.github/` control-plane file — prevents systematic AI guardrail bypasses |

---

### `prompts/*.prompt.md` — on-demand slash commands

**What they are:** Four agent-mode prompts you invoke manually in Copilot Chat. Each has `mode: agent` frontmatter and references a formal specification file for acceptance criteria.

**Why they exist:** Some tasks are too specific for automatic routing — the user needs to supply an HTML snippet, a file path, or a Jira ticket. Prompts provide a structured input/output contract for those tasks.

| Prompt | You provide | You get |
|--------|-------------|---------|
| `generate-page-object` | Page name + URL path + HTML snippet | A complete `pages/<Name>Page.js` matching `LoginPage.js` conventions |
| `find-locator` | HTML snippet or element description | Best Playwright locator + constructor field declaration + red flags |
| `refactor` | File path(s) + optional focus area | Refactored file, change summary, lint notes |
| `jira-to-feature` | Jira ticket URL or key (+ MCP server running) | Scenario table → implementation of approved scenarios only |

**How to trigger:**

```
#file:.github/prompts/generate-page-object.prompt.md
Page name: Checkout
URL path: /checkout
HTML: <input id="email" type="email"> <button type="submit">Pay now</button>
```

```
#file:.github/prompts/find-locator.prompt.md
<a class="button secondary radius" href="/logout">Logout</a>
```

```
#file:.github/prompts/refactor.prompt.md
tests/web/login.web.spec.js — steps are missing test.step wrappers
```

```bash
npm run mcp:playwright   # start MCP server first
```

```
#file:.github/prompts/jira-to-feature.md
https://your-workspace.atlassian.net/browse/TE-456
```

---

### `rules/` — auto-injected formatting standards

**What they are:** Three Markdown files Copilot loads automatically when generating the named artefact. You never call them directly.

**Why they exist:** Without them, Copilot generates generic commit messages (`"Update tests"`), vague issue titles, and PR descriptions that don't follow the team template. These files make formatting consistent across all contributors, with or without any manual prompt.

| File | Auto-applied when Copilot generates |
|------|-------------------------------------|
| `.copilot-commit-message-instructions.md` | A commit message — enforces `feat(web):`, `fix(api):`, `chore(config):` conventional format |
| `.copilot-issue-title-instructions.md` | A GitHub issue title — enforces `Bug:`, `Feature:`, `Refactor:` prefixes with Jira key |
| `.copilot-pull-request-description-instructions.md` | A PR description — maps the diff to each section of `pull_request_template.md` |

---

### `guardrails/` — security contract and review aid

**What they are:** Two files forming a two-tier security system.

**Why they exist:** The codebase handles credentials (`WEB_LOGIN_USERNAME`, `API_LOGIN_PASSWORD`, `JIRA_API_TOKEN`), attaches screenshots and API traces to test reports, and has Husky pre-commit hooks. Without explicit rules, Copilot could suggest hardcoding credentials, logging sensitive response bodies, or bypassing Husky with `--no-verify`. These files make the AI's security behaviour explicit and reviewable.

| File | Role |
|------|------|
| `security-guardrails.md` | Active behavioural contract — what agents must and must not do. Referenced by the agent and the security-review-and-audit skill at runtime |
| `security-guardrail-reference.md` | Rationale, green patterns, red flags, and self-scan questions — used during PR review of `.github/` files, not at runtime |

---

### `specifications/` — formal acceptance criteria for prompts

**What they are:** Four Markdown spec files. Each one is referenced via `#file:` in a prompt's frontmatter and defines the exact inputs, outputs, rules, and acceptance criteria for that prompt.

**Why they exist:** Without them, prompts are ambiguous — the AI might satisfy a "generate a page object" request in many different ways. Spec files make the acceptance criteria machine-readable: the agent checks its output against the criteria before finishing.

| Spec | Backs prompt |
|------|--------------|
| `pageObjectFromHtmlSnippet.spec.md` | `generate-page-object.prompt.md` |
| `findLocator.spec.md` | `find-locator.prompt.md` |
| `refactor.spec.md` | `refactor.prompt.md` |
| `jira2Feature.spec.md` | `jira-to-feature.md` |

---

### `pull_request_template.md` — PR form

**What it is:** A Markdown template GitHub loads automatically when anyone opens a new pull request.

**Why it exists:** Enforces a consistent PR checklist (secrets scan, fixture imports, lint, Gitleaks, test evidence) and section structure across all contributors — so reviewers always get the same information in the same place.

---

## How everything connects

```
Every Copilot Chat session
         │
         ▼
 copilot-instructions.md  ◄── auto-loaded; sets stack, layout, security, persona
         │
         ├── Copilot Chat (Ask / Edit mode)
         │       Suggestions follow POM conventions, locator priority,
         │       CommonJS require() patterns, and security guardrails silently.
         │
         ├── Agent mode  (@ai-test-engineer)
         │       Loads agents/ai-test-engineer.agent.md
         │       │
         │       ├── Reads task type → routes to the matching skill
         │       ├── Skill loaded on demand → executes the workflow
         │       └── Reports done checklist before finishing
         │
         ├── Prompt commands  (#file:.github/prompts/*)
         │       Prompt loaded + specification #file: included as context
         │       User provides required inputs → agent produces defined output
         │       Output checked against acceptance criteria in spec file
         │
         └── Commit / PR / Issue generation
                 rules/ files auto-injected by Copilot
                 Output follows conventional commit format and PR template
```

---

## Quick reference

| Goal | File to use | How it activates |
|------|-------------|-----------------|
| AI always follows JS/POM rules | `copilot-instructions.md` | Automatic every session |
| Consistent commit messages | `rules/.copilot-commit-message-instructions.md` | Automatic on commit generation |
| Pre-filled PR description | `pull_request_template.md` + PR rules | Automatic on PR open |
| Generate a new page object | `prompts/generate-page-object.prompt.md` | `#file:` or prompt picker |
| Find the best locator | `prompts/find-locator.prompt.md` | `#file:` or prompt picker |
| Refactor a spec or page object | `prompts/refactor.prompt.md` | `#file:` or prompt picker |
| Turn a Jira ticket into specs | `prompts/jira-to-feature.md` | `#file:` + MCP server running |
| Add web or API test coverage | `@ai-test-engineer` | Copilot agent mode |
| Fix a failing or flaky test | `@ai-test-engineer` + `test-maintenance-and-quality` skill | Agent mode |
| Review `.github/` changes safely | `skills/security-review-and-audit/SKILL.md` | Explicit skill invoke |

---

## Keeping this layer healthy

- **`copilot-instructions.md`** is the single source of truth for project conventions — update it whenever patterns, paths, or commands change
- **`security-guardrails.md`** and the security section of `copilot-instructions.md` must stay in sync — update both together
- **Before editing any `.github/` file** — invoke the `security-review-and-audit` skill and answer every self-scan question
- **Skills and prompts** are independent of the baseline — update them when a specific workflow changes without touching `copilot-instructions.md`
- **Specifications** back prompts — update both together when acceptance criteria change
- **Never commit secrets, tokens, or real credentials** — Husky runs `npm run lint` and `gitleaks detect --source .` on every commit
