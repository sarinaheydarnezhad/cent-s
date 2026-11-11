# Cent

Persian / RTL learning storefront, personal library, protected page reader and private notes. The React application calls `backend/Cent.Module` in the Lerona backend repository. It no longer runs the Express demo server.

## Development

Use Node 24 (PDF.js requires Node 22.13 or newer) and the .NET 10 backend. Copy `.env.example` to `.env.local` and configure the API URL or local proxy.

```powershell
npm.cmd ci
npm.cmd run dev
```

The default URL is `http://localhost:5173/cent-s/`. Start and configure the shared backend following `CENT.md` in the backend repository. A missing backend produces a retryable error; browser-controlled login and paid access have been removed.

For a local preview without SQL Server, run this from the **backend repository root**:

```powershell
dotnet run --project backend/Cent.Preview/Cent.Preview.csproj
```

Then run this from the **frontend repository root**:

```powershell
$env:CENT_BACKEND_URL = "http://127.0.0.1:5108"
npm.cmd run dev
```

Preview Swagger is at `http://127.0.0.1:5108/swagger/index.html`. The local administrator is `admin@cent.local` / `cent-local-preview-only`. The preview uses simulated payments and an ignored SQLite database inside the backend checkout; source files are included in Git. No application dependency points to a workspace tools directory.

## Google sign-in

Both tabs on `/login` support Google sign-in alongside password login and registration. No Google SDK or frontend Google credentials are needed. The existing `VITE_CENT_API_URL` / `CENT_BACKEND_URL` configuration also serves Google authentication. The backend creates the authorization URL, OAuth state and S256 PKCE verifier; the frontend stores the five-minute attempt in `sessionStorage`, redirects to that exact URL, validates the callback, and submits the code (or cancellation) and saved proof once. Authentication uses the returned Cent bearer session and expiration, with the same logout and `/me` restoration as password sign-in. Existing sessions without a stored expiration remain supported.

The local callback is **`http://localhost:5173/cent-s/auth/google/callback`**. Use `localhost` consistently: a flow started at `127.0.0.1` cannot read a `localhost` tab's storage. Changing `VITE_BASE_PATH` changes the callback path, so update the backend and Google registration together.

Operator configuration, if not already set:

1. Configure a Google **Web application** OAuth client and consent screen (including test users while in Testing). Register `http://localhost:5173` as the local JavaScript origin and the exact local callback above as an authorized redirect URI.
2. On the backend set `Cent__Google__Enabled=true`, `Cent__Google__ClientId`, **`Cent__Google__ClientSecret` (backend secret environment only)**, `Cent__Google__RedirectUri` to the callback, and `Cent__AllowedOrigins__0=http://localhost:5173`. HTTP loopback callbacks require the backend Development environment. The verified SQLite upgrade needs no further frontend migration.
3. For production use the actual HTTPS frontend origin and callback in Google and the backend, and configure the existing public API URL as usual. Serve direct callback requests/reloads with the application HTML. Set **`Cache-Control: no-store`** and **`Referrer-Policy: no-referrer`** on callback HTML responses (including SPA fallbacks); exclude the callback from analytics, third-party scripts, service-worker caching and URL logging. Vite development and preview already set these headers; the HTML also contains a `no-referrer` policy. The current GitHub Pages workflow cannot set custom response headers, so use hosting or a proxy that can enforce them for production Google authentication.
4. Verify one real Google round trip with your configured test account: new/returning user, cancellation, existing-password-email conflict, session restoration and logout. Automated tests use synthetic codes and mocked API/Google navigation; they do not authenticate a real Google account.

The callback removes its query before React mounts and consumes the saved attempt before completion. Failures and reloads require a new start. Google email conflicts direct users to their existing sign-in method; accounts are never linked by the frontend. The exact server contracts and setup are documented in the backend repository's `docs/CENT-GOOGLE-AUTHENTICATION.md`.

Run `npm.cmd test` for callback/API/session tests. The optional `npm.cmd --prefix tests/browser run test:google-auth` check exercises the rendered login/register UI, callback, session reload, logout and failure paths using isolated browser mocks without modifying the backend database.

## Commerce

- A `TRAINING` product grants permanent online access to one training after verified payment.
- A `SUBSCRIPTION` product grants a configured number of days of access to trainings marked as included, plus simulator practice. Renewals extend the current end date. There is no automatic bank debit.
- Access is checked by the backend on every page request. Saved notes remain readable after a subscription expires; editing a lesson's notes requires access to that lesson.
- Prices are stored and sent to Zarinpal in **rials**; the storefront displays **tomans**.
- Real checkout requires server-side Zarinpal configuration. Development mock payments require both the Development environment and an explicit server flag. Sandbox and mock revenue are excluded from live revenue.

## Uploading and reading PDFs

1. Create a Cent administrator using the server's one-time bootstrap procedure.
2. Create a training in **آموزش‌ها و PDF**. Choose whether it is included in subscriptions.
3. Upload a PDF as a lesson. The administrator's browser renders it with PDF.js and uploads compressed WebP pages. PDFs are limited to 40 MB / 200 pages per lesson; each image is limited to 1.5 MB and the rendered lesson to 60 MB.
4. Create a one-time product for the training, or a subscription product, then publish the training and activate sales.

Interrupted uploads resume when the same file is selected again in the same browser tab. Published pages are immutable, so annotations cannot silently shift when a source file changes. Upload an edited PDF as a new lesson.

Readers have page navigation, zoom, a PDF outline when present, saved position, personal watermarks and private notes pinned to a position on each page. Notes save to the server; unfinished text is kept as a device-local draft. Study pages have no PDF download/print controls, and printing the reader is suppressed. **Websites cannot guarantee screenshot prevention or prevent an authorized reader from extracting displayed images.** The original PDF is never uploaded to or served by this backend. Keep your source PDF archive separately.

## Practice

Questions and answer keys live on the backend. The administrator can enter questions or import the existing sample set. Each attempt snapshots its questions; scoring uses that snapshot on the server. Results, answers and topic recommendations persist in the account. Current recommendations use deterministic educational rules; no OpenRouter or n8n connection is claimed or configured through browser forms.

## Deployment

For Cloudflare Pages and `itatest.ir`, follow [CLOUDFLARE.md](CLOUDFLARE.md).

```powershell
npm.cmd run build
npm.cmd test
```

`VITE_BASE_PATH` sets the routing and asset base. `VITE_CENT_API_URL` is public and contains only an API URL, never credentials. The build bundles the Persian font and PDF.js fonts/CMaps/WASM locally. A `404.html` fallback is included for GitHub Pages. Other hosts should rewrite application paths to `index.html`.

For the existing Pages workflow, set repository variable `CENT_API_URL` to the existing backend's HTTPS Cent API endpoint, and optionally `CENT_BASE_PATH` (default `/cent-s/`). The backend needs the frontend's origin in its separate Cent CORS policy. No deployment occurs from editing these files; the workflow runs on a push to `main` or manual dispatch.

The admin interface never accepts database passwords or gateway secrets. Server setup, migration, backup and later extraction instructions are in the backend repository's `CENT.md`.

Optional browser checks, including their own `package.json` and lockfile, are in `tests/browser/` inside this repository. See `tests/browser/README.md`. They are separate from the application's main package and are not required to run or build the frontend.

## Curriculum progress

The backend's bundled five-subject curriculum powers subject/topic selection, targeted practice, source-based study lessons and the **تحلیل شخصی** learning map. Import it as described in the backend's `CENT.md`. The map shows topic accuracy, evidence coverage and provisional subject progress across the complete imported syllabus. Submitted practice and assessment results both update progress; a repeated question replaces its previous evidence rather than increasing the distinct-question count. Reading alone does not change question mastery. The backend persists attempts and computes the estimates from immutable snapshots. **نتایج من** combines the account's real recent results, subject progress, comparable score changes and correctly labeled practice/test history.

The homepage, course introduction and course selection use public curriculum metadata from the backend. `/courses/:code` shows the actual source lessons, chapters and skills. There are no hardcoded course cards, fictional progress percentages or sample-course fallbacks. Source text still requires purchased access, and course prices come from configured backend products.
