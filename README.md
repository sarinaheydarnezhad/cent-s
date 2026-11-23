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

## Authentication

The login page supports Iranian mobile SMS OTP and the official Google Identity Services button. Both issue the existing Cent session. Email/password login and Google authorization-code/PKCE routes have been removed; existing account and purchase records remain intact.

See [AUTHENTICATION.md](AUTHENTICATION.md) for configuration, API contracts, security, migration and verification details. No Google client secret belongs in this frontend.

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

The backend's bundled six-subject curriculum powers subject/topic selection, targeted practice, source-based study lessons and the **تحلیل شخصی** learning map. Import it as described in the backend's `CENT.md`. The map shows topic accuracy, evidence coverage and provisional subject progress across the imported syllabus. A repeated question replaces its previous evidence rather than increasing the distinct-question count. Reading alone does not change question mastery. Historical assessment behavior remains compatible; versioned Mock Exam scores remain separate from educational mastery.

The homepage, course introduction and course selection use public curriculum metadata from the backend. `/courses/:code` shows the actual source lessons, chapters and skills. There are no hardcoded course cards, fictional progress percentages or sample-course fallbacks. Source text still requires purchased access, and course prices come from configured backend products.

## Subject commerce and local verification

`/package` shows the six canonical subjects and database-derived published, initially reviewed and unpublished counts. New purchases use server quotes: 4,900,000 IRR (490,000 Toman) per subject, with distinct-count discounts of 0/5/10/15/20/25%. Quotes last 15 minutes. Checkout retains the same quote/request/order on retry. New subject orders extend the existing payment and entitlement services; legacy financial records remain compatible.

Verified settlement creates one finite item per subject. Each UTC interval ends exclusively after 12 calendar months; leap days clamp to the last day of the target month. Explicit renewals queue after contiguous paid coverage without changing previous items. Account history exposes active, upcoming, expired and revoked access. Protected sources resolve the purchased immutable release and exclude unreviewed legacy lessons. New passage-aware Practice requires subject access; legacy diagnostic/Practice contracts remain readable. `Cent:Commerce:MockAdmissionPolicy=all-subjects-v1` conservatively requires every subject in the selected full-mock blueprint at start; default subject-based admission is closed. Started attempts keep their snapshots and deadlines after entitlement expiry.

The additive `SubjectCommerce` SQL Server migration has an offline idempotent script; it was not applied to SQL Server here. Disposable local commerce checks use SQLite schema creation from the current model. SQL Server LocalDB could not start, so full-mock SQL locking/activation remains unverified locally. No production migration, deployment or real charge is included.

To reproduce the fake-payment browser flow, build `backend/Cent.Preview/Cent.Preview.csproj` from the Backend checkout into `.dotnet/phase5-preview`, then launch that DLL with these arguments (choose a new disposable filename each launch):

```powershell
dotnet .dotnet/phase5-preview/Cent.Preview.dll --urls http://127.0.0.1:5115 --isolated-database D:/Lerona/Backend/.dotnet/phase5-preview/App_Data/isolated/commerce-unique.db --import-curriculum true --prepare-subject-offers true --sandbox-subject-offers true --Cent:ClientBaseUrl http://localhost:5185/cent-s --Cent:PublicApiBaseUrl http://127.0.0.1:5115 --Cent:Commerce:MockAdmissionPolicy all-subjects-v1
```

`--sandbox-subject-offers` is limited to a new disposable database and the Development fake gateway. Its test approval is not independent academic acceptance. Normal offers are inactive and require an explicit admin review confirmation. Admin preparation/approval uses `/admin/subject-offers/prepare` and `/admin/subject-offers/{subjectId}`; recommendations use `/admin/recommended-bundles/{id}` and the same pricing rules. Only the defensible complete-six recommendation is seeded. Live merchant credentials and content acceptance remain external release requirements.

From this frontend checkout:

```powershell
$env:CENT_BACKEND_URL='http://127.0.0.1:5115'
npm.cmd run dev -- --host 127.0.0.1 --port 5185 --strictPort
```

Open `http://localhost:5185/cent-s/package`. Run `npm.cmd --prefix tests/browser run test:commerce-real` for real local HTTP/browser tests; no request interception or real payments are used. Its sanitized results, exact content counts and screenshots are written to `.preview-artifacts/phase5-commerce/`. Run backend checks with the CEnT-only `backend/Cent.Exam.Tests/Cent.Exam.Tests.csproj`; it does not build or run Lerona projects.
