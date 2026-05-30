---
description: Generate a Playwright page object for this repo — provide a page name, URL path, and HTML snippet or element descriptions.
mode: agent
tools:
  - codebase
  - editFiles
---

You are working in a **Playwright Test + JavaScript** project. Generate a page object class that matches the conventions of `pages/LoginPage.js`.

## What to produce

A single TypeScript file saved to `pages/<Name>Page.js`.

## Conventions to follow

Match `pages/LoginPage.js` exactly:

- `import { Page, Locator } from '@playwright/test';`
- Class name: `<Name>Page`
- Fields: `readonly page: Page` + one `readonly <fieldName>: Locator` per interactive or assertable element
- Constructor: `constructor(page: Page)` — assign all locators via `page.locator(...)` or semantic locators
- Include a `getPath(): string` method returning the URL path
- Include an `async goto(): Promise<void>` method calling `this.page.goto(this.getPath())`
- Include user-facing action methods (e.g. `login`, `search`, `submit`) — hide selector details inside them
- Include a `get<Text/Value>(): Promise<string>` helper for any visible feedback element the spec needs to assert on
- No `import { test, expect }` in page objects — assertions stay in specs
- No hardcoded credentials or test data — those belong in `data/web/*.json` and env vars

## Locator priority

1. `page.locator('#id')` — when the app uses stable IDs (as Herokuapp does)
2. `page.getByRole(...)` — for semantic elements (buttons, links, headings)
3. `page.getByLabel(...)` — for labelled form inputs
4. `page.getByText(...)` — for readable text content
5. Stable attribute selectors (`[data-testid="..."]`, `[type="submit"]`) — when above are unavailable
6. Avoid generated class names, layout selectors, and brittle XPath

## Reference — `pages/LoginPage.js`

```ts
import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly flashMessage: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.locator('#username');
    this.passwordInput = page.locator('#password');
    this.loginButton = page.locator('button[type="submit"]');
    this.flashMessage = page.locator('#flash');
    this.logoutButton = page.locator('a.button.secondary.radius');
  }

  getLoginPath(): string {
    return '/login';
  }

  async goto(): Promise<void> {
    await this.page.goto(this.getLoginPath());
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async getFlashMessage(): Promise<string> {
    return (await this.flashMessage.textContent())?.trim() ?? '';
  }
}
```

## Inputs needed from the user

- **Page name** — e.g. `Dashboard`, `Checkout`, `UserProfile`
- **URL path** — e.g. `/dashboard`, `/checkout`
- **Elements** — HTML snippet, screenshot description, or list of interactions and assertions the spec will need

## After generating

1. Confirm the file was written to `pages/<Name>Page.js`
2. Show the full class
3. List the locators chosen and why (especially if stable IDs were not available)
4. Do **not** run tests — the spec author will wire up the page object and run `npm run test:web`
