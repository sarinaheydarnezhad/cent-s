# Post-GIS checkpoint — Phase 1

The owner authorized Phase 1 directly on frontend `main`, without a branch, commit, push or deployment. Frontend `c8df574` and backend `87525a7` are ancestors of their respective HEADs. Initial frontend status was `?? docs/`; backend status was clean. Existing documents and assets are preserved.

Paths: frontend `D:\app\itatest`; shared read-only backend `D:\Lerona\Backend`; preview `backend\Cent.Preview\Cent.Preview.csproj`; expected API `http://127.0.0.1:5108`.

Pre-implementation frontend checks: 114 unit tests across six files passed, including GIS, password/session helpers and existing scoring. Production build including TypeScript passed. Both isolated browser suites passed: 16 GIS and nine retained code/password scenarios. These use synthetic Google/API responses and do not verify real Google signatures, consent, FedCM, provider settings or production connectivity.

Existing compiled backend assemblies: `dotnet vstest` passed 108 Cent tests; Lerona passed 396 with three existing skipped mobile cloud tests. TRX evidence is under `evidence/phase-1/backend-cent` and `backend-lerona`. These results apply to pre-existing binaries, not a newly compiled backend; source was not edited. No production database or external payment was used.

The first existing preview executable was stale: `/auth/google/config` returned 404 despite current source containing discovery. The first smoke run performed local mock-payment/resource/password steps, then failed its console-error assertion (including discovery 404 and rate-limit observations). Its exception handler repeatedly tried to inspect an already closed page; the owned run was interrupted. This is an environment/binary baseline failure before visual edits, not an implemented theme regression. Current source was successfully built with `--artifacts-path D:/app/itatest/.preview-artifacts`, keeping build output outside the backend repository. No migrations/upgrades were used. Restore reached cached dependencies but vulnerability-feed lookup reported NU1900; this is not a clean package vulnerability audit.

Global lint now completes (vendor exclusion from GIS commit) and reports 154 existing errors including untracked Phase 0 evidence helpers. The authored application/scripts/browser scope is measured separately; do not compare that global count directly with the historical 93 scoped errors.

Known accepted limitations remain: study-return synchronization, exposed recommendation `math:` codes, external payment states, real OAuth, expiry/timeout breadth, destructive operations and incomplete accessibility. No unrelated repairs are included in Phase 1.

The brand README names `logo-original-reference.png` and `brand-board-reference.png`, but neither file is present. The supplied `logo-reference.png`, palette, UI reference and complete PDF remain available. SVG reconstruction will be explicitly provisional, with review against the supplied PNG; missing originals must be supplied before any claim of comparison against them.

## Completed checkpoint and implementation follow-up

The current-source preview runs against a frontend-local copy of the existing preview SQLite data; status reports DEVELOPMENT_MOCK and GIS discovery returns an authoritative disabled configuration. Password and session tests work. Current-source pre-implementation courses, curriculum and progress suites passed. Concurrent initial smoke traffic produced HTTP429 console assertions; sequential execution is required. After Phase 1's added appearance select, the smoke's positional first-select assumption failed; its training combobox selector was made semantic without weakening assertions. The final full smoke then passed. Final courses/curriculum/progress and qualified nondestructive notes/recovery passed separately. Original study-return remains deferred. No critical authentication or shared-backend regression was established.

Final frontend unit count is124 including10 new appearance tests. Existing authored lint errors remain93. Full lint completes with154 existing errors including Phase0 evidence helpers; all new Phase1 helpers/application code are separately clean. Real Google provider verification is unavailable in this disabled local environment; mocked GIS/code flows pass in both development themes and in the compiled root-path build. See PHASE_1_REPORT.md for evidence and exact boundaries.
