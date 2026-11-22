# Phase 7 evidence

[Report](../../PHASE_7_REPORT.md) · [seven-image gallery](index.html) · [API handoff](../../PHASE_7_COMMERCE_API_HANDOFF.md).

## Results

- `unit-tests.json`: 213 passing tests.
- `build-subpath.log`, `build-root.log`: saved successful builds, including TypeScript.
- `commerce-{development,root}-result.json`: six groups and 60 responsive observations in each environment. Connected mock payment/entitlement checks are distinguished from injected pending/expiry/gateway states.
- `commerce-states-{development,root}-result.json`: seven recovery groups each. Includes a connected mock payment with its browser response deliberately dropped; other fault states are injected.
- `commerce-accessibility-{development,root}-result.json`: twelve route/theme checks and 810 measured text/gradient pairs each. Sampling is not full accessibility certification.
- `google-auth-result.json`, `google-gis-result.json`: final development synthetic authentication regression results. `regressions-root/` holds root equivalents. Initial failure logs and final passing logs are both retained. The two saved development authentication images are ancillary regression artifacts, outside the commerce gallery.
- `consecutive-notes-result.json`, `study-return-result.json`: existing development connected regressions. The npm-prefix-relative copies were moved here without altering their contents.
- `focused-lint.json`: changed commerce presentation/helpers/harnesses are clean. `src-lint.json`: six existing errors in unchanged CentUI, PracticePages and StudyReader sources.
- `delivery-verification.json`: 92 protected tracked files match Phase 6 HEAD; request implementation and both build output boundaries checked. Response type additions are documented explicitly.
- `review-capture-verification.json`: order and recovery viewport captures were refreshed to show the relevant controls, with the same connected/injected classifications.
- `final-review-verification.json`: twenty account layouts after the final mobile title/badge adjustment, plus saved-result, focused-lint and local-link verification. Both build logs were refreshed after that CSS change.

Only the seven `after-*.png` images belong to the commerce review. They are viewport captures, not full-page composites or BEFORE/AFTER pairs. The catalog/detail retain earlier technical fixture titles present in the isolated database. Prices are disposable rial examples, never production pricing.

## Reproduction

Run from `D:\app\itatest` with dependencies installed and the **existing isolated** Phase 7 preview listening at `http://127.0.0.1:5117/api/cent/v1`. Confirm `/status` reports DEVELOPMENT_MOCK and the preview's data is isolated before creating fixtures. Do not point these checks at shared or production services.

```powershell
$env:CENT_TEST_WEB_URL='http://127.0.0.1:5173/cent-s'
$env:CENT_TEST_API_URL='http://127.0.0.1:5117/api/cent/v1'
$env:ITATEST_TEST_EVIDENCE='D:/app/itatest/docs/refinement/evidence/phase-7'
$env:ITATEST_PHASE7_LABEL='development'
$env:ITATEST_TEST_CAPTURE='0'
node tests/browser/check-commerce-refinement.mjs
node tests/browser/check-commerce-states.mjs
node tests/browser/check-commerce-accessibility.mjs
```

The first script creates its disposable fixtures and `.preview-artifacts/phase7-development-fixture.json`; the other two depend on it. Omit capture suppression only when intentionally replacing the seven review images. The harness retires its earlier named commerce fixture offers through local admin APIs and creates fresh fixture offers. Fixture JSON contains local session tokens and stays in ignored `.preview-artifacts`; it is not review evidence.

For compiled-root checks, use the separately built root output served at `http://127.0.0.1:5187`, set `CENT_TEST_WEB_URL` to that origin and `ITATEST_PHASE7_LABEL` to `root`, and run the same sequence with capture suppression. The same isolated preview is used. Tests adapt only the preview checkout redirect's loopback frontend origin.

Synthetic authentication regressions can be rerun with `npm.cmd --prefix tests/browser run test:google-auth` and `test:google-gis`. Use an **absolute** evidence path because npm changes the process working directory. Set `ITATEST_TEST_CAPTURE='0'` to avoid additional regression screenshots.

The continuation reused the saved successful unit run, rebuilt both frontend bases and added the compiled-root commerce/authentication runs, broader lint, boundary verification and final capture/layout review. It made no backend source changes or backend source build/test claims. Live Zarinpal, staging SQL Server, real expiry and production acceptance remain unverified.
