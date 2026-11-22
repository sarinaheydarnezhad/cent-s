# Phase 0 architecture audit

## Repository and execution

Single frontend checkout at `D:\app\itatest`. No applicable AGENTS.md found in this checkout or ancestor locations checked. No backend project is included. Existing untracked input is `docs/brand/`; no initial tracked modifications. No source/config/dependency file edited by this audit.

`package.json`: React + React DOM, TypeScript, React Router, Vite React plugin, Lucide, PDF.js, locally packaged Vazirmatn. No UI framework, CSS-in-JS, i18n package or external state manager. Node installed: `v24.20.0`; npm `11.19.0`. Build reports Vite `8.3.6`, Vitest `5.1.0`. Several manifest versions use `latest`, but lockfile pins actual installation; no upgrade is proposed.

Scripts: predev/predev:web/prebuild copy PDF.js assets; `dev` and `dev:web` run Vite; `build` runs `tsc -b && vite build`; postbuild creates hosting-specific fallback; `lint` runs `eslint .`; `test` runs `vitest run`; `preview` runs Vite preview. Browser tests use a separate installed Playwright package in `tests/browser`, with eight scripts. Main TypeScript is strict, ES2022, bundler resolution, JSX transform, noEmit; referenced node config checks vite.config.ts. No standalone integration-test or architecture-test script.

## Rendering and routing

`main.tsx`: callback query capture before React mounts; StrictMode → AppStateProvider → App. CSS order: styles.css → Vazirmatn 400/500/700 → cent.css. HTML already has `lang="fa" dir="rtl"` and no-referrer policy.

`App.tsx`: BrowserRouter basename derives from `BASE_URL`. PublicLayout has header/footer; DashboardLayout shares student/admin shell; protected StudyReader is outside dashboard shell; diagnostic test has its own page; Google callback bypasses public layout; global 404 is standalone. All route imports are eager. Preserve `/cent-s/` local default and root deployment support; brand name does not justify renaming URLs. Full route list: [AUDIT_COVERAGE](AUDIT_COVERAGE.md).

## State and service boundaries

`AppState.tsx` owns restored session user, loading/error/retry, library, orders and latest result/analysis. Page-local hooks own remote data, forms and UI. `useRemote` supplies data/error/busy/reload with disposal guards; reuse it rather than adding a duplicate fetching layer. Several calls intentionally overlap (AppState refresh and page-specific library/catalog requests); evaluate before proposing optimizations.

`services/cent.ts` owns typed contracts, bearer request handling, no-store requests, omitted cookies, GET retry for 429/503, session expiry signaling and date/currency formatters. API default `/api/cent/v1`, public API override via `VITE_CENT_API_URL`, local Vite proxy via `CENT_BACKEND_URL`. Rials are authoritative; display is tomans. `ApiError` forwards `payload.message` to many UI surfaces: safe server error contracts must be checked before broad writing changes; no observed secret leak is asserted.

Session token/expiry live in sessionStorage under existing `cent:*` keys. AppState restores `/me`, handles expiry, focus recheck and logout. Google flow is backend-issued state + S256 PKCE; frontend validates exact Google origin/path, stores short-lived attempt, removes callback query before mount, consumes proof once, shares completion under StrictMode and restricts return paths. These are protected boundaries, not rebranding targets.

## Learning, assessments and commerce

Public curriculum/catalog are server data, with error/empty states and no production sample fallback. Student result comparison/filtering in PersonalResults uses real attempt outcomes; backend mastery data distinguishes evidence, coverage and confirmed progress. Recommendations in active pages come from server outcomes. Legacy `data/questions.ts` and `services/scoring.ts` exist; search found no production page import of their scoring/sample data. Do not confuse their unit tests with backend scoring verification or delete them during branding.

Assessment page supports diagnostic/practice/simulator modes, course/topic configuration, sessionStorage attempt/answer restoration, server expiry countdown and server submission. Clearing an answer sets its key to null, while answered progress uses Object.keys; potential pre-existing display mismatch. No submission confirmation is present; timer expiry disables final submit and offers a new attempt. Any behavior change needs separate owner approval under protected assessment state/submission rules.

Reader supports image-page canvas plus watermark and a separate source-section text branch, zoom, outline, saved page, page-local localStorage drafts, revisioned server notes and native confirmations. It hides content on document visibility change and suppresses reader printing. Admin dynamically imports PDF.js, converts PDFs to WebP and resumes uploads; student does not receive source PDF through this frontend. Canvas content is an image, not accessible educational text. Preserve resource authorization/watermark/notes and do not invert page colors.

Checkout uses server products, payment configuration and idempotency request ID. Result calls existing verification endpoint and displays success only when `paid` is true. The current result contract exposes a boolean, not all failed/cancelled/pending/unknown states. Account maps every non-PAID status to pending. Expanding authoritative state vocabulary may require a separately approved API change. No payment or order verification was initiated against a real backend.

Admin has six screen components shared by several aliases: overview, users, training/documents, products, orders and questions. No separate financial configuration UI, user editing, permission editor or deployment console is implemented in these routes. Some CSS names describe obsolete integration/demo designs; CSS alone is not an implemented feature.

## Styling, localization and reuse

Two global CSS files totaling ~80 KB source. Semantic-ish variables in :root are a useful starting point, but hundreds of literal colors, repeated selector overrides, independent cent-paper/cent-line and mixed spacing/radii require gradual consolidation. No theme provider, dark selector, color-scheme media query or appearance persistence/control exists. Reduced-motion CSS exists. Lucide already supplies icons; preserve this dependency.

Persian UI strings are inline JSX/service literals. No message catalog. Source AST inventory records 738 Persian text occurrences including templates, repeated strings and educational sample content; not 738 unique messages. Shared feedback exists (LoadState, EmptyState), but forms, banners, buttons, tabs and tables repeat markup. Extend existing UI files in later phases; no new framework/store/router needed.

## Deployment and security review limits

Read README, CLOUDFLARE.md, .env.example, vite.config.ts, prepare/finish-build scripts and .github/workflows/deploy.yml. Cloudflare direct upload and separate GitHub Pages CI coexist. Root vs subpath builds and callback security headers need both-host review later. Dev and preview set no-store/no-referrer; production headers cannot be established from local HTML alone. No production system was queried or modified.

No dangerouslySetInnerHTML found in source; React renders source text and notes as text. Question SVG is passed as an encoded image URL, not injected HTML. These static observations do not establish server authorization or sanitization correctness. No backend checkout/preview on localhost:5108 was available, so live roles, entitlements, resource isolation, scoring and payment behavior remain unverified. Existing mocked auth checks cover only the frontend protocol interaction.

## Performance baseline

Build passes. Approximate emitted sizes: CSS 81.68 KB / gzip 17.02 KB; app JS 118.80 / 32.16 KB; React DOM 206.99 / 64.48 KB; router 39.08 / 14.00 KB; React 11.75 / 4.47 KB; PDF lazy chunk 444.23 / 133.64 KB; PDF worker 1271.91 KB. Font assets include WOFF/WOFF2 and language subsets; network transfer is not the sum of emitted assets. No Lighthouse, field metrics, LCP/CLS or throttled device measurement performed. Preserve admin-only dynamic PDF import; route splitting is a future optimization proposal, not required for initial theming.
