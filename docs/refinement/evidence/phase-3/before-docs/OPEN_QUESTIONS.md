# Current open decisions — Phase 2

| Item | Current disposition |
| --- | --- |
| Phase 1 logo and appearance | Resolved: explicitly visually approved; Phase 1 closed with technical limits |
| Sage role | Resolved: meaningful educational/support/recommendation role; distinct from success and primary Slate interactions |
| Phase 2 acceptance | Pending owner review of actual components, evidence and qualified report |
| Phase 3 | Not authorized; proposed public/auth presentation scope only after explicit approval |
| Backend/Lerona | Read-only; no change needed or proposed. Any future requirement stops for separate impact analysis |
| Study-return / math: | Existing synchronization defect and recommendation code exposure retained for later scoped phases; original test not repaired or relabeled |
| OAuth/payment/accessibility | Existing real-provider/external-payment/full-WCAG and other safe exclusions remain unverified |
| New UI migration | Native destructive confirms, table semantics, every legacy conditional loading width, page-specific field/feedback/copy migration and reader controls remain contextual work |
| Wordmark source | Approved retained live-text implementation still lacks a recovered outlined vector master |

No new blocking backend change or fabricated product feature is proposed. Real Google OAuth/FedCM/signatures and production CORS remain unverified; external payments, comprehensive WCAG/assistive-technology coverage, original study-return synchronization, exposed math: recommendation codes, destructive operations, exhaustive timeout/reader/private-state coverage and existing lint debt remain. Historical backend results are prebuilt-assembly checks (Cent 108, Lerona 396, 3 skipped), not fresh source-build verification; no backend tests were rerun in Phase 2.

---

## Preserved earlier phase records

# Open questions and dependencies

Updated 2026-11-18. These are review gates, not authorization to begin a later phase. Reporting/approval questions are English; user-facing UI remains Persian.

Frontend repository: `D:\app\itatest`. Shared backend repository: `D:\Lerona\Backend`. Itatest local preview project: `D:\Lerona\Backend\backend\Cent.Preview\Cent.Preview.csproj`. API: `http://127.0.0.1:5108`; frontend: `http://localhost:5173/cent-s`.

Permanent constraint: the backend repository is read-only for this refinement program. Itatest-specific Cent.Module/Cent.Preview, Lerona-specific modules, and shared infrastructure are distinct boundaries. Inspect backend code only as needed for existing frontend behavior. Use only Cent.Preview with verified isolated local data for safe API tests. No production database connections, backend source/configuration/schema/authentication/API-contract edits, Lerona/shared-infrastructure edits, database upgrades or migrations, unrelated services, real payments, destructive operations, deployments, commits, or pushes. Any necessary backend change requires stopping and presenting impact analysis for both Itatest and Lerona before approval. Local fixture records created through the already-running preview's supported APIs are the explicitly authorized exception for runtime data; no direct database edits or cleanup/deletions were performed.

All reports, progress updates, technical explanations, implementation plans, documentation and approval questions are permanently in English, superseding the former Persian reporting rule. The user-facing interface remains conversational, warm, professional Persian.

| ID | Status / needed decision | Why / when |
| --- | --- | --- |
| Q01 | Resolved: Phase 0 conditionally accepted and Phase 1 explicitly authorized | Phase 1 implementation awaits visual review; Phase 2 remains unauthorized |
| Q02 | Resolved: repository paths confirmed; user-started preview reachable and SQLite/mock isolation verified | Frontend localhost:5173/cent-s; backend 127.0.0.1:5108. Do not use 127.0.0.1 as frontend origin for this preview's mock payment return |
| Q03 | Source availability resolved; owner approval of refined SVG/variants pending | Original-logo and brand-board PNGs now supplied and reviewed. Original geometry fit implemented; final approval is not assumed. See LOGO_REVIEW_REPORT.md. |
| Q04 | Pending: review implemented dark/supporting palette and native header controls | Actual tokens and screenshots now provided in Phase 1 report |
| Q05 | Separate approval if protected assessment progress/expiry/submission issues are to be investigated/fixed | Source-observed risks remain; no scoring/timing/session changes in visual work |
| Q06 | Separate decision on authoritative payment status vocabulary before detailed pending/failure/cancel presentation | Current verify response is paid:boolean; real provider states unverified; no API expansion authorized |
| Q07 | Pending: text alternatives for image-only protected educational pages | May involve content/contracts; reader shell can improve independently |
| Q08 | Resolved: official Inter variable WOFF2 locally hosted with SIL license and provenance hashes | No dependency added; Vazirmatn remains Persian interface font |
| Q09 | Pending: separately authorize tracked study-return test synchronization correction, or accept the red suite as recorded baseline | Original fails twice at immediate page 1 vs 3; settled-page audit variant passes complete journey. Test file unchanged |
| Q10 | Review R02 recommendation subject-code presentation in the appropriate later learner/results phase | Internal math prefix appears in real UI; no scoring/API fix implied |
| Q11 | Safe exclusions require acceptance or separately authorized verification if full signoff is required | Real Google/provider/expiry/destructive/admin/complete accessibility cases remain unverified; backend modifications still require dual-application impact analysis |

Primary PDF/palette/UI/logo PNGs and backend paths are available. The two additional images named in the brand README have now been supplied and reviewed; no reference upload is outstanding. Imported curriculum was already present; no migration/import approval is being requested. No backend modification, payment, production access or destructive test is proposed. Review [Phase 1 report](PHASE_1_REPORT.md) for remaining coverage limits and the explicit approval gate before Phase 1 closure or Phase 2.


## Phase 1 implementation record

Resolved: Phase 1 authorization, frontend main strategy, shared backend path, English reporting, local SQLite/mock-payment verification. Pending owner decisions: approve/revise the refined symbol, retained wordmark and variants; approve/revise dark appearance/supporting palette. The newly supplied original-logo raster now controls geometry; the recolored PNG and board inform identity. No missing-source dependency remains. Later phases retain menu/selected/progress accessibility, small type and responsive density work. Real GIS provider verification still requires the configured operator environment; no provider settings were changed. Do not revisit unrelated study-return or math: display bugs in Phase 1.
