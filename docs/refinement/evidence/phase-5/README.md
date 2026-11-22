# Phase 5 evidence

[Eight AFTER review images](index.html) accompany the [English report](../../PHASE_5_REPORT.md). All captures use actual connected local DEVELOPMENT_MOCK responses with isolated synthetic learners. No production/student data, real payment, BEFORE screenshot or comparison pair was used. Session fixtures stay ignored under `.preview-artifacts`, outside evidence.

`check-assessment-refinement.mjs` captures exactly eight viewport images only when `ITATEST_PHASE5_CAPTURE` is not `0`. Compiled-root verification disables capture. The same suite asserts loading, retry, missing mappings, long scientific text/diagram and accelerated expiry without capturing those injected states. The simulator check uses an existing mock-paid subscription and actual server scoring. Authentication and appearance suites retain synthetic protocol fixtures and disable capture.

Reproduce from the checkout with an existing local preview:

```powershell
$env:CENT_TEST_WEB_URL='http://127.0.0.1:5175/cent-s'
node tests/browser/check-assessment-refinement.mjs
node tests/browser/check-assessment-accessibility.mjs
node tests/browser/check-assessment-simulator.mjs
```

For the compiled root use its actual port, set `ITATEST_PHASE5_LABEL=root` and `ITATEST_PHASE5_CAPTURE=0`, then run the refinement suite before accessibility so its ignored fixture exists. Existing auth/progress harnesses accept `ITATEST_TEST_EVIDENCE` and `ITATEST_TEST_CAPTURE=0` without changing their default behavior.

Evidence limitations: local Chromium, representative widths 320/390/768/1024/1440; representative text/gradient contrast sampling excludes disabled controls; no full WCAG, screen-reader, cross-browser, real OAuth or external payment acceptance. Original Phase 4/4.1 evidence and limitations remain retained.
