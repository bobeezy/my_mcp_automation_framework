# Spec: Page object from HTML snippet

**Used by:** `.github/prompts/generate-page-object.prompt.md`

## Goal

Given a page name, URL path, and HTML snippet (or element descriptions), produce a `pages/<Name>Page.js` file that matches the conventions of `pages/LoginPage.js`.

## Inputs

| Input | Description | Example |
|-------|-------------|---------|
| Page name | PascalCase name for the class | `Dashboard` |
| URL path | Relative path the page lives at | `/dashboard` |
| HTML / elements | Snippet, screenshot description, or list of elements to interact with or assert on | `<input id="search">`, `<button type="submit">Save</button>` |

## Output

A single file at `pages/<Name>Page.js` containing:

1. Imports — `Page`, `Locator` from `@playwright/test`
2. Class — `export class <Name>Page`
3. Fields — `readonly page: Page` + one `readonly` `Locator` per interactive or assertable element
4. Constructor — assigns all locators using `page.locator(...)` or semantic locators
5. `getPath(): string` — returns the URL path
6. `async goto(): Promise<void>` — navigates to `getPath()`
7. Action methods — user-facing (e.g. `fillSearch`, `clickSave`); no raw locators exposed to specs
8. Feedback helpers — `get<Text>(): Promise<string>` for visible text the spec needs to assert on

## Locator rules

1. `page.locator('#id')` — stable unique ID first (as Herokuapp uses `#username`, `#password`, `#flash`)
2. `page.getByRole(role, { name })` — ARIA role + accessible name for buttons, links, headings
3. `page.getByLabel(text)` — label-associated form inputs
4. `page.getByPlaceholder(text)` — input placeholder when no label
5. `page.getByText(text)` — non-interactive readable content
6. `page.getByTestId(value)` — `data-testid` attribute
7. Stable attribute selector — `[type="submit"]`, `[data-cy="..."]` — fallback only
8. No generated or hashed class names, layout-only CSS selectors, or XPath

## Constraints

- No `import { test, expect }` — assertions stay in specs, not page objects
- No credentials, passwords, or test data literals
- No `page.waitForTimeout()` calls
- No logic that belongs in a fixture or hook
- New sensitive input fields (password, token) must be added to `credentialSelectors` in `hooks/WebHooks.js`

## Acceptance criteria

- [ ] File saved at `pages/<Name>Page.js`
- [ ] All fields are `readonly page: Page` and `readonly <name>: Locator`
- [ ] Constructor assigns all locators; no `page.locator(...)` calls inside action methods
- [ ] `goto()` calls `this.page.goto(this.getPath())`
- [ ] Action methods hide locator detail from specs
- [ ] No `expect` or `test` imports in the page object
- [ ] Locator choices explained in the generation summary (especially when stable IDs are absent)
- [ ] `npm run lint` passes on the generated file
