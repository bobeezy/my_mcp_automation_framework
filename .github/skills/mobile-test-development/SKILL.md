---
name: mobile-test-development
description: Add responsive or mobile-browser coverage using Playwright device emulation. Use when a requirement needs testing on a specific viewport or device configuration.
---

# 📱 Skill: Mobile test development

## Use when

- A requirement needs coverage on a specific device viewport or mobile browser
- An existing spec needs to run against a mobile device configuration
- A new Playwright project for device emulation needs to be added to `playwright.config.js`

## Approach

This repository uses **Playwright device emulation** via `devices[...]` from `@playwright/test`. There is no native mobile driver, Appium, or separate mobile framework.

Device emulation sets viewport dimensions, user-agent, `hasTouch`, `isMobile`, and `deviceScaleFactor` to match a real device — suitable for responsive web and mobile-browser testing.

## Workflow

1. **Check `playwright.config.js`** — confirm whether a mobile project already exists for the target device
2. **Add a project if needed** — add a new entry under `projects` using a `devices[...]` entry
3. **Decide on spec location** — mobile-specific specs go in `tests/mobile/` (create the folder); shared flows that run on all devices stay in `tests/web/` with the mobile project picking them up
4. **Reuse page objects** — `pages/*Page.js` classes work for mobile the same as desktop; add device-conditional logic only if the layout genuinely differs
5. **Validate** — run `npx playwright test --project=<mobile-project-name>`; report pass/fail

## Adding a Playwright mobile project

```ts
// playwright.config.js
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  projects: [
    // existing projects …

    {
      name: 'mobile-chrome',
      testDir: './tests/web',        // or './tests/mobile' if device-specific specs exist
      use: {
        ...devices['Pixel 5'],
        baseURL: process.env.WEB_BASE_URL ?? 'https://the-internet.herokuapp.com'
      }
    },
    {
      name: 'mobile-safari',
      testDir: './tests/web',
      use: {
        ...devices['iPhone 14'],
        baseURL: process.env.WEB_BASE_URL ?? 'https://the-internet.herokuapp.com'
      }
    }
  ]
});
```

Common device names: `'Pixel 5'`, `'iPhone 14'`, `'iPhone 14 Pro'`, `'Galaxy S9+'`, `'iPad Pro 11'`.
Run `npx playwright devices` to list all available device descriptors.

## Spec rules

- Import `test`, `expect` from `fixtures/webTest.js` (same as desktop web specs)
- Page objects from `pages/` work unchanged — locators are device-agnostic
- Use `test.skip(isMobile, 'reason')` only when a genuine desktop-only interaction makes a test inapplicable on mobile
- Do not duplicate a desktop spec to create a mobile variant — add the device project and let it run the shared spec

## Security

- Credentials via `getRequiredEnv()` — same rules as desktop web tests
- `WebHooks.redactCredentialFields()` covers common selectors on mobile too — extend `credentialSelectors` if a mobile layout uses different input IDs

## Done when

- [ ] Mobile project defined in `playwright.config.js` with the correct `devices[...]` entry
- [ ] Target spec file(s) confirmed in the right `testDir`
- [ ] Page objects reused without duplication
- [ ] `npx playwright test --project=<mobile-project-name>` passes and results reported
- [ ] `npm run lint` passes
