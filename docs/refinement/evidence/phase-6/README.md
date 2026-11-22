# Phase 6 evidence

AFTER-only local review evidence for library, notes and reading. [Gallery](index.html). No BEFORE images or matched comparison pairs.

Seven viewport captures use disposable DEVELOPMENT_MOCK preview learners and a synthetic educational PDF uploaded through the existing administrator PDF.js workflow. Payments are local mocks; document authorization, canvas rendering, progress and note operations use the connected preview API. Synthetic session fixtures and PDF input remain in ignored `.preview-artifacts`, outside this evidence folder.

| Image | State |
| --- | --- |
| `after-library-light-1440.png` | Real library: title-based fallback covers, permanent access, unstarted and saved positions |
| `after-notes-dark-1440.png` | Two actually persisted personal notes with resource, page and date |
| `after-reader-light-1440.png` | Authorized PDF canvas, existing watermark and in-reader notes |
| `after-reader-dark-390.png` | Mobile document with notes closed; PDF colors unchanged |
| `after-editor-light-390.png` | Mobile editor and saved notes; panel reached by the existing notes action |
| `after-empty-library-dark-390.png` | Real empty library for a separate unentitled preview account |
| `after-recovery-light-390.png` | **Injected page503**: concealed document, original error detail and existing retry |

Assertion-only injections cover note-save/collection503, expired page403, pending document initialization, and additional presentation states documented in result JSON. They never become fabricated student history or working product features.

Reproduction uses `tests/browser/check-reading-refinement.mjs` followed by `check-reading-accessibility.mjs`. Set `CENT_TEST_WEB_URL`, `ITATEST_TEST_EVIDENCE=docs/refinement/evidence/phase-6`, and `ITATEST_PHASE6_LABEL=development` or `root`. Set `ITATEST_TEST_CAPTURE=0` for regression-only runs. These scripts require a loopback DEVELOPMENT_MOCK preview. Existing notes and study-return regressions also honor the no-capture option. Do not print or copy ignored session fixtures into evidence.

Local Chromium observations supplement manual image inspection; they do not establish full WCAG, screen-reader, production storage or cross-browser acceptance. See [Phase 6 report](../../PHASE_6_REPORT.md).
