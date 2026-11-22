# Phase 6 — Library, notes and reading

Phase **5 is visually approved and closed**, with its documented limitations retained. Phase 6 is implemented locally for **explicit visual approval**. No commit, push or deployment. Phase 7 has not started.

## Implemented

- **Library:** compact resource cards, actual titles and optional exact curriculum subject names, permanent/subscription/restricted access labels, page/note counts, unstarted states and existing start/resume links. The contract has no cover image: decorative title-based covers request no document pages. Sage native meters repeat supplied furthest-page/page-count values, with a separate last-position label. Reaching the last page is not presented as completion or mastery. No library search, sort or filter capability was invented.
- **Notes:** readable Persian notes with preserved line breaks, real resource titles, subject metadata where exactly mapped, page references and dates. Existing case-sensitive body/title search and server ordering remain unchanged. Empty notes, search no-match and recoverable fetch failure are distinct. Original page links retain their parameters; editing and deletion remain in the reader.
- **Reader:** quieter compact header, grouped page/zoom controls, actual PDF bookmark navigation, visible page/count, accessible tooltips and 44px controls. Mobile zoom/panning stays inside the document viewport; the application shell does not overflow. The existing notes action scrolls/focuses the panel, and closing returns focus to its trigger. Long titles wrap within two lines; portrait/landscape and reduced motion are supported. Dark surroundings do not invert PDF pixels or alter source-page content.
- **In-reader notes:** Sage editor with clear page/selected-note context, readable textarea and saved notes. Draft/saving feedback remains neutral; successful persistence/deletion is acknowledged only after the existing operation; actual errors appear beside the editor with draft text retained. Native draft-replacement/deletion confirmations, note revisions, IDs, retry identity and validation remain intact.

`ReadingUI`, `ReaderExperience`, `ReadingLibrary` and scoped `reading.css` reuse existing tokens, Badge, EmptyState, Skeleton, LoadState/Notice and AppearanceControl. Commerce/account functions and all routes remain unchanged. The approved dashboard resume phrase and supplied position meter remain consistent with the library/reader. All API, progress/draft/note persistence, access and rendering handlers remain owned by their existing implementation; the only controller adjustment respects reduced motion when scrolling to a page.

## Study-return synchronization

**Resolved in the test, without a product persistence or backend change.** The previous check read the page selector immediately after client navigation, before the document request and reader initialization finished. A controlled pending document response reproduces that state: the route has changed while the selector does not yet exist. Releasing the response restores the exact requested page.

The original regression now waits for the actual requested selector value, and for the restored draft after assessment/result return. All original exact-page/draft assertions remain. No arbitrary delay, weaker assertion or hidden failure. Cancel, reauthentication, active-assessment reload, result reload, exact reader return and draft recovery pass in development and compiled root.

## Verification

| Check | Result |
| --- | --- |
| Unit tests | **183 passed / 12 files**; Phase 5 baseline 170 plus 13 presentation/feedback cases |
| TypeScript/builds | `tsc -b` and `/cent-s/` production build passed; compiled root build passed |
| Connected reading | **6 groups / 5 zoom-width observations each** in development and compiled root: real PDF.js upload/bookmarks, authorized canvas, page/select/bookmark/zoom/pan, last/furthest position and reload/resume, note create/edit/retry/revision/delete, search/navigation, study-return readiness and account isolation |
| Additional states | Real revision409/draft preservation and native draft-confirmation checks; gated library skeleton, injected unavailable metadata/fetch errors, long RTL/LTR text/title, visibility concealment and print suppression |
| Existing regressions | Notes: five distinct notes persisted after consecutive creation/edit/retry/delete/reload, in development and root. Study return passed in both. Existing five-group appearance regression passed |
| Accessibility/responsive | Eight route/theme checks, 40 portrait/landscape observations and 262 rendered text pairs each in development/root, including contrast, RTL, 320–1440px representative widths, keyboard/notes focus, touch targets, zoom bounds, reduced motion and single-click persisted themes |
| Lint/boundaries | New presentation and focused harness files clean. Broader frontend retains **six baseline hook errors**: CentUI 1, PracticePages 1, StudyReader 4. Full protected sources, reader controller, commerce/account functions, build/security assets and delivery boundaries verified |

Primary records: [development reading](evidence/phase-6/reading-development-result.json), [compiled root reading](evidence/phase-6/reading-root-result.json), [additional states](evidence/phase-6/reading-states-development-result.json), [development accessibility](evidence/phase-6/reading-accessibility-development-result.json), [root accessibility](evidence/phase-6/reading-accessibility-root-result.json), [study return](evidence/phase-6/study-return-result.json), [notes](evidence/phase-6/consecutive-notes-result.json), [delivery boundaries](evidence/phase-6/delivery-verification.json). Build, lint, appearance and root-regression records accompany them.

## Document security and evidence

Students still receive authorized image pages or existing source sections, with the original canvas watermark, hidden-state concealment, context-menu prevention, print restrictions, abort handling and object-URL cleanup. The rendering engine, administrator PDF.js conversion and protected request contracts are unchanged. No original PDF URL, download, thumbnail request or new document access mechanism is exposed. Actual unentitled document/page/source reads and foreign note updates are denied; the existing foreign DELETE returns generic revision409 and leaves the owner's body/revision intact.

[Review gallery](evidence/phase-6/index.html): exactly **seven AFTER viewport screenshots**, covering library, notes, PDF reader, mobile editor, real empty library and an explicitly injected page503 recovery state across desktop/mobile and Light/Dark. Other fault/long-content/availability fixtures are assertion-only. Connected data uses disposable local DEVELOPMENT_MOCK learners and an administrator-uploaded synthetic educational PDF; no production/student data or real payment. No BEFORE images or matched pairs.

## Remaining limitations

- Other [Phase 5 limitations](PHASE_5_REPORT.md#unresolved-issues-and-limitations) remain: baseline lint debt, real OAuth/payment/hosting/CORS/storage acceptance, technical topic mappings and broader accessibility/cross-browser coverage. Study-return test readiness is the explicitly resolved exception.
- Local Chromium and existing preview binaries were used. No backend source build/test, full WCAG, assistive-technology or cross-browser claim. Real expired-entitlement lifecycle and production document infrastructure remain **unverified**; page403/503 and unavailable library metadata are **injected** presentation cases. Actual unentitled access and ownership preservation are **verified**.
- Saved furthest page records an opened position; it does not establish that all preceding pages were read or mastered. The reader's expandable saved-position detail reflects the server snapshot received on opening, not a new live progress calculation. The existing delayed save and draft-storage semantics remain unchanged.
- Notes-list mutation, automatic selection from the existing `note` query parameter, library filters/sorting and covers are not added beyond existing support. Overlapping same-anchor note pins retain the existing behavior; individual notes remain available in the panel. Actual revision conflicts preserve local text and require the existing reload/reselection flow to obtain the current revision.
- No study goals, streaks, active time, activity logging, new progress calculations, persistence, annotations/highlighting/drawing, document downloads, offline reading/synchronization or API contracts. Commerce and administration were not redesigned.

**Stop for explicit Phase 6 visual approval. Do not begin Phase 7.**
