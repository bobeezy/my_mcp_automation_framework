---
description: Given an HTML snippet or element description, recommend the best Playwright locator to use in a page object for this repo.
mode: agent
tools:
  - codebase
---

You are working in a **Playwright Test + JavaScript** project. Given an HTML snippet or a description of an element, recommend the best locator to use inside a `pages/*Page.js` file.

## Locator priority

Evaluate candidates in this order and stop at the first that applies:

1. **`page.locator('#id')`** — use when the element has a stable, unique `id` (as Herokuapp login uses `#username`, `#password`, `#flash`)
2. **`page.getByRole(role, { name })`** — use for buttons, links, headings, inputs, checkboxes, and other ARIA roles; prefer over text matching for interactive elements
3. **`page.getByLabel(text)`** — use for form inputs associated with a `<label>`
4. **`page.getByPlaceholder(text)`** — use for inputs with a `placeholder` attribute when no label exists
5. **`page.getByText(text)`** — use for non-interactive readable content (messages, headings, status)
6. **`page.getByTestId(value)`** — use when a `data-testid` attribute is present
7. **Stable attribute selector** — `page.locator('[type="submit"]')`, `page.locator('[data-cy="..."]')` — only when options 1–6 do not apply
8. **Scoped selector** — `page.locator('.parent').locator(...)` — only when the element is not uniquely identifiable at root level

**Avoid:**
- Generated or hashed class names (`.css-a1b2c3`, `.sc-xyz`)
- Layout-only CSS selectors (`.container > div:nth-child(2)`)
- XPath
- `page.waitForTimeout()` in any locator pattern

## What to return

For the given element, provide:

1. **Recommended locator** — the single best choice with a short reason
2. **Alternatives** — up to two fallback options ranked by stability, with reasons
3. **Page object field** — how the locator would be declared as a `readonly Locator` in a `pages/*Page.js` class, following `pages/LoginPage.js` style
4. **Red flags** — note any attribute that looks generated or fragile so the user can raise a `data-testid` request with the dev team

## Reference — `pages/LoginPage.js` locator style

```ts
readonly usernameInput: Locator;   // page.locator('#username')
readonly loginButton:   Locator;   // page.locator('button[type="submit"]')
readonly flashMessage:  Locator;   // page.locator('#flash')
```

## Inputs needed from the user

- HTML snippet **or** a plain-English description of the element (e.g. "a Save button inside a form on /settings")
- URL path or page name if it helps scope the selector
