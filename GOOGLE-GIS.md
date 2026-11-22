# ItaTest Google sign-in: frontend integration

The authoritative API specification is `docs/CENT-GOOGLE-GIS.md` in the backend repository. It was read before implementation. This frontend implements its discovery, challenge and completion endpoints; it does not change the backend or its verification/account-linking rules.

## Audit

Initial `git status --short` and `git diff --stat` on 2026-11-16 were empty: the frontend working tree was clean. No pre-existing frontend edits were overwritten. The backend checkout was read only. No deployment, live configuration edit, commit or push was performed.

Login and registration share `LoginPage.tsx`. Password and Google success use the same `AppState.authenticated`, tab-scoped Cent session, expiration, `/me` restore, logout and safe intended destination. Protected-route and checkout redirects remain intact. Persian messages are colocated with these components/services; there is no separate translation framework. The existing code/PKCE helper, callback route, early callback URL cleanup, origin validation, state/verifier validation, expiration and one-time completion remain in place.

## Modes and exact requests

All paths below are appended to `VITE_CENT_API_URL`, with no `/cent-s` API prefix:

| Method | Path | Body |
| --- | --- | --- |
| GET | `/auth/google/config` | none |
| POST | `/auth/google/gis/challenge` | exactly `{}` |
| POST | `/auth/google/gis/complete` | `{ challengeId, browserBinding, idToken }` |

Discovery supplies `enabled`, `mode` and the existing public `clientId`. `AuthorizationCode` retains the existing `/auth/google/start` and `/auth/google/complete` behavior. `GisIdToken` loads the official SDK and renders Google's button. Disabled discovery keeps password authentication available. Unknown modes, unavailable discovery and missing endpoints fail closed with a Persian message; there is no fallback that guesses the server's mode. Deploy the backend version that includes discovery even when retaining code mode.

Discovery has no body or custom/bearer headers. GIS POSTs use `Content-Type: application/json` and `X-Cent-GIS: 1`. Every request uses `credentials: 'omit'` and `cache: 'no-store'`; the browser supplies Origin. The dedicated transport avoids attaching an existing Cent bearer token and never retries a POST automatically. No cookies, `login_uri`, `g_csrf_token` or form submission are used.

Discovery runs once per mounted login view and once on an explicit retry. React StrictMode does not double-send it. There is no discovery polling or persisted discovery cache. A fresh SDK/challenge is prepared before the official button becomes usable. Both login/register tabs use Google's localized `continue_with` button, without changing its branding or iframe contents.

## Local environment and testing

Use Node 24. In frontend `.env.local`:

```dotenv
VITE_BASE_PATH=/cent-s/
VITE_CENT_API_URL=/api/cent/v1
CENT_BACKEND_URL=http://127.0.0.1:5108
```

There is **no new frontend environment variable**. The Google client ID and mode come from discovery. Vite variables are public; never add a client secret, database credentials or signing keys to them. `CENT_BACKEND_URL` controls Vite's development proxy and is not a browser variable.

```powershell
npm.cmd ci
npm.cmd run dev
```

Open `http://localhost:5173/cent-s/login`. For a real test, the operator must first start the GIS-capable backend in Development at `http://127.0.0.1:5108`, with Google enabled, `Cent__Google__Mode=GisIdToken`, its existing Web Client ID, and `Cent__AllowedOrigins__0=http://localhost:5173`. Follow the backend contract for its process environment and existing database/schema; do not change Lerona settings or run migrations as part of this frontend task.

Verification commands in the frontend checkout:

```powershell
node_modules/.bin/tsc.cmd -b
npm.cmd run lint
npm.cmd test
npm.cmd run build
git diff --check
```

The separate browser package uses installed Chrome by default (or `CENT_TEST_BROWSER_CHANNEL=msedge`). With the Vite frontend running, no backend is needed for these **mocked** tests:

```powershell
npm.cmd --prefix tests/browser ci
npm.cmd --prefix tests/browser run test:google-gis
npm.cmd --prefix tests/browser run test:google-auth
```

All Google and API requests are intercepted locally. GIS browser tests cover existing/new backend users, backend-only session creation, password login/registration, protected/purchase destinations, ADMIN navigation, reload/logout, duplicate completion, stale callback/state, explicit cancellation recovery, expiry/retry, SDK/challenge/discovery/verification failure, conflicts, throttling, disabled mode, mobile RTL and absence of persisted/logged/URL credentials. Unit tests cover exact transport fields/headers, server-time lifetime, SDK failure/timeout/deduplication, malformed responses, body limits, rate limits and lifecycle races. The older suite covers the retained code/PKCE flow. These do not validate Google's real signatures, actual Google UI, FedCM delivery, Google Cloud settings, production CORS or Liara connectivity.

To exercise the compiled root-path production build locally, build with the production environment below, run `npm.cmd run preview -- --host 127.0.0.1 --port 5180`, then in another terminal:

```powershell
$env:CENT_TEST_WEB_URL = 'http://localhost:5180'
npm.cmd --prefix tests/browser run test:google-gis
npm.cmd --prefix tests/browser run test:google-auth
```

These checks still intercept the production API URL. Do not perform a real login from this preview origin unless the operator separately authorizes it in Google and the backend.

## Security and browser behavior

- ID tokens are held only for the single completion request; never stored, decoded, logged, put in URLs or used as Cent bearer tokens. The challenge, nonce and origin-bound browser proof are attempt-local memory and are discarded on expiry, cancellation, completion, error or unmount. Only the nonce is sent to Google.
- A backend-confirmed Cent session is passed through existing application authentication. Existing Google profiles, roles, purchases and accounts are supplied by the backend. No frontend linking by email is implemented.
- Each attempt initializes GIS once with its exact nonce, popup UX, `auto_select: false`, `button_auto_select: false` and `use_fedcm_for_button: true`. No `prompt()`/One Tap call occurs. A separate random Google button `state` and the attempt lifecycle prevent stale popup callbacks from submitting under a newer nonce; the backend remains authoritative for all security checks.
- The five-minute lifetime is measured conservatively from the beginning of the challenge request using `performance.now()`, less five seconds. A readable server Date can shorten this bound. This follows the server's guaranteed fresh five-minute lifetime without trusting a potentially skewed workstation clock. The backend always enforces the actual stored expiry, including if a suspended browser or transport delay makes a local estimate stale. There is no relaxation of signed token/nonce verification or the existing code-flow expiration guards.
- Expiry removes the button and offers an explicit fresh challenge. Verification errors/lost responses never replay a completion. Retry obtains discovery and a fresh challenge; no automatic Google prompt/request loop occurs. The shared 10-auth-requests/minute budget includes discovery. HTTP 429 and empty local-preview 503 wait at least 60 seconds without Retry-After; other 503s wait five seconds by default. Retry-After is honored when supplied. SDK and API operations time out after 15 seconds.
- GIS button/popup does not provide the One Tap moment-notification cancellation API. We do not infer cancellation from window focus or install an unsupported popup callback. After a click the UI explains how to continue and offers **لغو و تلاش دوباره**. This invalidates the old attempt and releases the password form. `cancel()` discards any SDK prompt; it cannot guarantee closing a Google popup that has already selected a credential. Old/late callbacks are ignored.
- Browser security restrictions, Google consent, FedCM preferences and Google network access remain enforced. No third-party-cookie workaround is attempted. Password login remains usable while the SDK/challenge loads or fails.

## Google Cloud and hosting preparation

Reuse the existing Google **Web application** client and consent screen. Authorized JavaScript origins must include `https://itatest.ir`, `http://localhost` and `http://localhost:5173` for local development, following Google's setup guidance. If users actually sign in on `https://www.itatest.ir`, that exact origin must also be authorized in Google and Cent; otherwise use the existing canonical domain. Origins have no paths. GIS JavaScript callback mode uses **no redirect URI**. Preserve these for code-flow rollback:

- Production: `https://itatest.ir/auth/google/callback`
- Development: `http://localhost:5173/cent-s/auth/google/callback`

The repository had no CSP or COOP configuration. Do not add a permissive global CSP or disable existing Cloudflare security rules. If an external CSP is configured, allow only the necessary GIS additions while retaining its other directives:

| Directive | GIS source |
| --- | --- |
| `script-src` | `https://accounts.google.com/gsi/client` |
| `frame-src` | `https://accounts.google.com/gsi/` |
| `connect-src` | `https://accounts.google.com/gsi/` (also preserve the API origin) |
| `style-src` | `https://accounts.google.com/gsi/style` |

Review a `default-src` fallback too. No `unsafe-inline`, `unsafe-eval` or wildcard source is introduced. FedCM works without weakening COOP. For browsers using Google's popup fallback, `public/_headers` sets `Cross-Origin-Opener-Policy: same-origin-allow-popups` on login URLs only. It also sets login `Cache-Control: no-store` and retains code callback `no-store`/`no-referrer` on production and `/cent-s` paths. Vite copies this file into `dist`; Cloudflare Pages applies it on deployment. These rules are prepared locally, not applied to live hosting. Review conflicting external header rules before publishing.

Google's SDK needs the relying-party origin as a referrer. Only while a GIS login view is mounted, its existing referrer meta uses Google's recommended `strict-origin-when-cross-origin` (or `no-referrer-when-downgrade` for HTTP localhost). The SDK script uses the same policy. Cleanup restores `no-referrer`; code callback pages keep their existing policy. No token/proof is in any URL. Vite's existing callback/security response headers are preserved. Cloudflare-injected analytics/error capture must not record authentication bodies or credentials; continue excluding the code callback from third-party analytics and URL logging.

Official guidance: [GIS JavaScript API](https://developers.google.com/identity/gsi/web/reference/js-reference), [render the button](https://developers.google.com/identity/gsi/web/guides/display-button), [client/origin, CSP, COOP and referrer setup](https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid), [FedCM migration](https://developers.google.com/identity/gsi/web/guides/fedcm-migration).

## Production preparation and operator deployment

Required Cloudflare Pages build environment (or set in the PowerShell build process for this direct-upload project):

```dotenv
VITE_BASE_PATH=/
VITE_CENT_API_URL=https://lerona-app.com/api/cent/v1
CENT_HOSTING=cloudflare
```

`CLOUDFLARE_PAGES=1` is an existing alternative to `CENT_HOSTING=cloudflare`. Neither is a frontend mode switch. No Google frontend environment variables are required.

```powershell
$env:VITE_BASE_PATH = '/'
$env:VITE_CENT_API_URL = 'https://lerona-app.com/api/cent/v1'
$env:CENT_HOSTING = 'cloudflare'
npm.cmd run build
```

Review `dist/index.html` for root asset URLs, `dist/_headers`, and absence of top-level `404.html`. Preserve native Cloudflare SPA fallback; do not introduce wildcard redirects that intercept real assets. The separate GitHub Pages workflow continues to use its own base path.

Operator sequence, **not executed by this task**:

1. Deploy the GIS-capable Cent backend with discovery first, retaining code mode while preparing the frontend. The existing Google schema must already be present. Confirm Liara can retrieve valid Google v1 certificate JSON over normal TLS; GIS still depends on `https://www.googleapis.com/oauth2/v1/certs`.
2. Review exact Google JavaScript origins and Cent allowed origins. Review Cloudflare CSP, COOP, `_headers`, caching and analytics settings. Google settings and backend environment remain operator-managed.
3. Build, review and run local root-path browser mocks. Publish the reviewed `dist` using the existing [Cloudflare procedure](CLOUDFLARE.md). The operator command is `npx.cmd wrangler@4.160.0 pages deploy dist --project-name itatest --branch main`; it was not run here.
4. Once both deployments are ready, the operator selects backend `Cent__Google__Mode=GisIdToken` with Google enabled and the existing Web Client ID. Keep the old client secret/redirect settings for rollback. Do not put them in Vite or Cloudflare frontend variables.
5. From `https://itatest.ir/login`, verify discovery, real CORS preflight and Origin/header checks, real Google consent/credential delivery, existing/new Google users, password sign-in, account conflict, intended purchase destination, `/me`, session restore and logout. Verify direct callback security headers for rollback. Inspect status counts without tokens or request bodies.

## Rollback and remaining checks

The updated frontend follows discovery; selecting backend `AuthorizationCode` (or removing Mode) restores the retained code flow on the next login view load without a frontend rebuild. Preserve the backend secret and exact callback registration. No frontend storage/data migration is required. Alternatively disable Google on the backend and keep password login/current sessions. If reverting the frontend artifact as well, select code mode before using the previous frontend. Rollback does not fix Liara's reported inability to reach the token exchange endpoint.

Real GIS delivery, actual Google client/origins, Cloudflare response headers/CSP/COOP, production CORS, the production Google schema and Liara certificate reachability remain operator checks. Automated frontend tests use synthetic credentials and mocked backend confirmation; they do not prove production sign-in or JWT verification. The public API must include discovery before this frontend is rolled out; missing discovery intentionally does not fall back to an invented mode.

## Files changed

```text
.env.example
CLOUDFLARE.md
GOOGLE-GIS.md
README.md
eslint.config.js
public/_headers
src/cent.css
src/components/GoogleSignIn.tsx
src/pages/public/LoginPage.tsx
src/services/cent.ts
src/services/google-identity-api.ts
src/services/google-identity-api.test.ts
src/services/google-identity-sdk.ts
src/services/google-identity-sdk.test.ts
src/services/google-identity.ts
src/services/google-identity.test.ts
tests/browser/README.md
tests/browser/check-google-auth.mjs
tests/browser/check-google-gis.mjs
tests/browser/package.json
```

The lint configuration additionally excludes generated, Git-ignored PDF.js vendor files under `public/pdfjs`; no source lint rule was disabled. The existing code-flow browser test now mocks discovery and waits for its loading assertions before returning the mocked start response, removing a navigation race. No dependencies were added. `google-auth.ts`, the callback page, App/main routing, AppState and Vite configuration are byte-for-byte unchanged.

## Verification results (2026-11-16)

- TypeScript `tsc -b`: passed.
- Unit tests: **114 passed across six files**, including 53 new GIS tests.
- Mocked browser checks: **16 GIS + 9 code-flow/password scenarios passed** on local `/cent-s/`, and the same **16 + 9 passed** on the compiled root-path production build (**50 scenario executions**). The two purchase return routes are exercised explicitly. Real Google UI/signature/FedCM and live CORS checks remain external.
- Production `npm.cmd run build` with `/`, the production API base and `CENT_HOSTING=cloudflare`: passed. Root asset URLs, copied `_headers` SHA-256 equality and absence of top-level `404.html` were checked.
- Lint for all modified/new TypeScript and JavaScript files: passed, zero errors/warnings.
- Full `npm.cmd run lint`: **93 pre-existing errors in 14 untouched files**, zero warnings. All reported files are unchanged; existing errors include unused imports, React effect/state rules and missing script/browser globals. They were left outside this authentication change. The full machine-readable report is in ignored `tests/browser/artifacts/google-gis-lint.json`.
- `git diff --check`: passed. Git's CRLF-conversion notices are informational.
- No real Google sign-in, live backend verification, backend write, deployment, commit or push was performed.
