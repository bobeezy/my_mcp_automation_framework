---
Name: api-test-development
Description: Implement or maintain HTTP API tests in this Playwright + TypeScript repo. Use when adding or changing tests/api/ specs, clients/ API clients, or data/api/ fixtures.
---

# 🔌 Skill: API test development

## Use when

- A requirement needs new or updated `tests/api/` coverage
- An existing API client method needs to be added or changed
- A failing or flaky API test needs investigation and repair

## Workflow

1. **Read existing files first** — `tests/api/`, `clients/`, `data/api/`, `fixtures/apiTest.js`, `hooks/ApiHooks.js`
2. **Check for duplicate coverage** — do not add a scenario already present in another spec
3. **Add or extend the client** — new endpoint → new method on the relevant `clients/*ApiClient.js`
4. **Write the spec** — follows `tests/api/login.api.spec.js` and `tests/api/user.crud.api.spec.js` patterns
5. **Add test data** — negative and edge payloads go in `data/api/<name>.json`; no literals in specs
6. **Validate** — run `npm run test:api` or a targeted `npx playwright test tests/api/<file>.api.spec.js`; report pass/fail

## Client rules (`clients/*ApiClient.js`)

- Every HTTP call must go through `callApiWithReport` from `utils/apiReporter.js`
- Constructor accepts `{ request: APIRequestContext, testInfo: TestInfo }`
- Each method returns `Promise<ApiCallResult>` (`{ response, body, metrics }`)
- Provide a descriptive `name` string per call (e.g. `'api-login'`, `'api-user-create'`) — this names the attached `<name>-request.json` and `<name>-response.json` artefacts
- Do not inline `request.post` / `request.get` in specs

```ts
// Pattern — matches AuthApiClient and UserApiClient
export class MyApiClient {
  private readonly request: APIRequestContext;
  private readonly testInfo: TestInfo;

  constructor({ request, testInfo }: { request: APIRequestContext; testInfo: TestInfo }) {
    this.request = request;
    this.testInfo = testInfo;
  }

  async myAction(data: Record<string, unknown>): Promise<ApiCallResult> {
    return callApiWithReport({
      requestContext: this.request,
      method: 'POST',
      url: '/my-endpoint',
      headers: { 'Content-Type': 'application/json' },
      data,
      testInfo: this.testInfo,
      name: 'api-my-action'
    });
  }
}
```

## Spec rules (`tests/api/*.api.spec.js`)

- Import `test`, `expect` from `fixtures/apiTest.js` — not from `@playwright/test`
- Instantiate the client per test: `new MyApiClient({ request, testInfo })`
- Load credentials with `getRequiredEnv()` from `utils/env.js`
- Load negative/edge payloads from `data/api/<name>.json`
- Standard assertions: `response.ok()`, `response.status()`, body fields as `body as Record<string, unknown>`
- Optional performance assertion: `metrics.finalAttemptDurationMs` vs `Number(process.env.API_MAX_RESPONSE_TIME_MS ?? 4000)`
- Use `test.describe.serial` only when tests have an explicit ordering dependency (e.g. CRUD create → read → update → delete)

```ts
// Pattern — matches login.api.spec.js
import { test, expect } from '../../fixtures/apiTest';
import { MyApiClient } from '../../clients/MyApiClient';
import { getRequiredEnv } from '../../utils/env';
import apiData from '../../data/api/my-feature.json';

const maxResponseTimeMs = Number(process.env.API_MAX_RESPONSE_TIME_MS ?? 4000);

test.describe('API My Feature - positive and negative scenarios', () => {
  test('Positive: action succeeds', async ({ request }, testInfo) => {
    const client = new MyApiClient({ request, testInfo });
    const { response, body, metrics } = await client.myAction({ key: getRequiredEnv('MY_VALUE') });

    const responseBody = body as Record<string, unknown>;
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    expect(responseBody.id).toBeTruthy();
    expect(metrics.finalAttemptDurationMs).toBeLessThan(maxResponseTimeMs);
  });

  test('Negative: action fails with invalid input', async ({ request }, testInfo) => {
    const client = new MyApiClient({ request, testInfo });
    const { response, body, metrics } = await client.myAction({ key: apiData.negative.invalidValue });

    const responseBody = body as Record<string, unknown>;
    expect(response.ok()).toBeFalsy();
    expect(response.status()).toBe(apiData.negative.expectedStatus);
    expect(metrics.finalAttemptDurationMs).toBeLessThan(maxResponseTimeMs);
  });
});
```

## Reporting

`ApiHooks` (registered via `fixtures/apiTest.js`) automatically attaches `api-test-start.json` and `api-test-end.json` to every test. `callApiWithReport` attaches `<name>-request.json` and `<name>-response.json`. Do not duplicate this in specs.

`utils/apiReporter.js` redacts passwords, tokens, `Authorization` headers, and Bearer strings before attaching — do not log raw sensitive values anywhere else.

## Security

- Credentials via `getRequiredEnv()` only — never literals
- No real tokens, passwords, or PII in `data/api/*.json` — use labelled placeholders
- Retry policy (`API_RETRY_ENABLED`, `API_RETRY_MAX_ATTEMPTS`, `API_RETRY_BACKOFF_MS`) is disabled on `TEST_ENV=prod` — do not override this for production targets
- Route `.github/` control-plane changes through `../security-review-and-audit/SKILL.md`

## Done when

- [ ] New or changed client method uses `callApiWithReport`
- [ ] Spec imports from `fixtures/apiTest.js`
- [ ] Negative/edge data in `data/api/*.json`, not inline in specs
- [ ] `npm run lint` passes
- [ ] `npm run test:api` (or targeted file) passes and results are reported
