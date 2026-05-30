# Spec: Find Playwright locator

**Used by:** `.github/prompts/find-locator.prompt.md`

## Goal

Given an HTML snippet or element description, recommend the best Playwright locator for use in a `pages/*Page.js` file, following this repo's locator priority and `LoginPage.js` conventions.

## Inputs

| Input | Description | Example |
|-------|-------------|---------|
| HTML snippet | One or more elements from the page source | `<input id="search" type="text" placeholder="Search...">` |
| Element description | Plain-English description when HTML is unavailable | `"a blue Submit button at the bottom of the checkout form"` |
| Page / path (optional) | Helps scope ambiguous selectors | `/checkout`, `CheckoutPage` |

## Output

For each element:

1. **Recommended locator** — single best choice with a one-line reason
2. **Alternatives** — up to two fallbacks, ranked by stability, with reasons
3. **Page object field** — `readonly` `Locator` declaration as it would appear in `pages/<Name>Page.js`
4. **Red flags** — any attribute that looks generated, hashed, or fragile; suggest raising a `data-testid` with the dev team if no stable selector exists

## Locator priority (in order)

1. `page.locator('#id')` — stable unique ID
2. `page.getByRole(role, { name })` — ARIA role + accessible name
3. `page.getByLabel(text)` — label-associated form input
4. `page.getByPlaceholder(text)` — input placeholder when no label
5. `page.getByText(text)` — non-interactive readable content
6. `page.getByTestId(value)` — `data-testid` attribute
7. Stable attribute selector — `[type="submit"]`, `[data-cy="..."]`
8. Scoped selector — parent → child, only when element is not uniquely addressable at root

## Constraints

- No generated or hashed class names
- No layout-only CSS selectors
- No XPath
- No `waitForTimeout` patterns
- Output is advice only — do not write or edit files unless the user explicitly asks

## Acceptance criteria

- [ ] A recommended locator is given for every element in the input
- [ ] Each recommendation includes a reason
- [ ] The page object field declaration matches `pages/LoginPage.js` style (`readonly <name>: Locator`)
- [ ] Any fragile attributes are flagged clearly
- [ ] No Appium, no mobile driver, no native selector syntax
