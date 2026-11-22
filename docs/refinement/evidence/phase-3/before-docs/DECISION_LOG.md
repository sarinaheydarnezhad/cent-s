# Current decisions — Phase 2

The owner explicitly approved the refined Phase 1 logo/variants and light/dark appearance, accepted its documented technical limits, and authorized Phase 2 shared components on local main. Phase 1 is visually accepted and closed with those limitations carried forward. Phase 2 is delivered for acceptance; Phase 3 remains unauthorized.

| ID | Status | Decision / implemented consequence |
| --- | --- | --- |
| P2-01 | Explicit owner approval | Phase 1 refined symbol/variants and light/dark appearance accepted; technical limits retained. Phase 2 authorized only, directly on frontend main. |
| P2-02 | Explicit owner direction | Slate for action/navigation/ordinary selections; Sage for meaningful learning/progress/recommendation/support. Approximate composition is guidance, not a quota or automatic success mapping. |
| P2-03 | Implemented | Extend existing UI/CentUI and compatibility CSS, with focused Fields/Dialog/disclosure modules. No new framework, package/dependency change, parallel library, business logic in UI or page restructuring. |
| P2-04 | Implemented | Brand, learning, recommendation, success, warning, error, info and interaction are independent semantic roles. Learning/recommendation alias existing approved Sage equivalents; ordinary selected aliases Slate hover/link. |
| P2-05 | Implemented | Native buttons/fields/selects/checkboxes/radios and native dialog; filters use aria-pressed buttons, matching their real behavior. No artificial tabpanel/menu roles. |
| P2-06 | Implemented | Native modal plus explicit Tab boundary guard, safe cancel focus, guarded Escape, focus restoration and scroll lock. Existing business-specific native confirmation prompts stay unchanged. |
| P2-07 | Implemented | Standalone component-reference.html development entry; no App route, public mock asset or production import. Output/runtime isolation verified. |
| P2-08 | Implemented corrections | Required marker moved beside label to preserve exact auth field labels; explicit dialog Tab guard; mobile sidebar focus placed in layout effect. Assertions retained and failures recorded. |
| P2-09 | Scope retained | No invented ring/milestone/achievement/switch/pagination/popover/toast service for absent consumers. Broad page-specific message/validation/workflow migrations deferred. |
| P2-10 | Permanent boundary | Shared backend/Lerona read-only; only existing isolated frontend-local Cent.Preview binary/SQLite and DEVELOPMENT_MOCK APIs. No rebuild/migration, real payments, destructive action, production, commit/push/deploy. |

Real Google OAuth/FedCM/signatures and production CORS remain unverified; external payments, comprehensive WCAG/assistive-technology coverage, original study-return synchronization, exposed math: recommendation codes, destructive operations, exhaustive timeout/reader/private-state coverage and existing lint debt remain. Historical backend results are prebuilt-assembly checks (Cent 108, Lerona 396, 3 skipped), not fresh source-build verification; no backend tests were rerun in Phase 2.

P2-11 — Implemented: legacy sidebar transition: all also animated visibility and prevented immediate safe focus. Restrict transition-property to the existing right-position slide; retain layout-effect focus and closed-panel visibility. Focus investigation and final public/student checks establish the correction.

---

## Preserved earlier phase records

# Decision log

| ID | Status | Decision / source | Consequence |
| --- | --- | --- | --- |
| D01 | Historical Phase 0 approval; superseded for current scope by P1-01/P1-02 below | Initial Phase 0 only; no functional edits during that phase | Phase 1 later explicitly authorized on main; Phase 2 onward remain closed |
| D02 | Approved | Itatest / ایتاتست product; CEnT-S remains exam | Brand-facing copy/assets only; Cent internals/routes retained |
| D03 | Approved | Slate & Sage five core colors; no gradients | Core fixed; supporting colors validated; remove legacy gradients incrementally after approval |
| D04 | Approved override | Light and dark with system default, local preference | Supersedes light-only/no-dark assumptions; no backend persistence |
| D05 | Approved direction; exact vector pending | Ascending sage chevron, smaller slate chevron, charcoal diamond as supplied logo-reference | Preserve geometry/proportions; reconstruct proposal only in Phase 1; visual approval before final logo |
| D06 | Approved | Conversational Persian / singular address | UI writing changes phase by phase; scientific/legal content preserved |
| D07 | Approved | Preserve architecture/security/data/payment/scoring/auth/deployment | Separate approval for any necessary protected change |
| D08 | Rejected by owner constraints | New UI framework, architecture rewrite, renamed internal Cent API/module identifiers | Extend existing CSS/context/UI instead |
| D09 | Resolved by source precedence | PDF early strategy pages say visual palette/fonts pending; later pages 9–26 and latest request approve core direction | Use latest decisions; do not treat old provisional paragraph as veto |
| D10 | Resolved by latest explicit request | UI-reference uses mortarboard wordmark and depicts IMAT/SAT/planner/B1/B2; approved mark is ascending geometry | Reference is composition/mood only; no mortarboard substitution or fake capability |
| D11 | Proposed | Existing :root tokens → semantic mappings + one theme resolver | Files: styles.css, cent.css, main/index startup, shared shell/control; not implemented |
| D12 | Proposed refinement needed | Supporting warning/error pairs fail normal-text contrast on suggested soft surfaces | Darken/refine support colors in Phase 1 and record exact values/evidence; core colors unchanged |
| D13 | Proposed separate protected review | Payment boolean cannot distinguish all financial states | Preserve current API; propose authoritative status expansion only if required and approved |
| D14 | Proposed separate protected review | Assessment expiry/submission/answer-progress issues | Record, reproduce locally; no timing/state/scoring edits in visual work |
| D15 | Audit method | Use installed PDF.js + local @napi-rs/canvas for complete reference extraction/rendering | No dependency manifest/install change; rendering helper's canvas exists at D:/app/node_modules, portability limitation documented |
| D16 | Initial and extended audit method | Preserve initial unmocked public failure baseline and synthetic auth evidence; add isolated backend-connected fixtures | Label real responses, injected failures, mocks and static findings separately; no production data or payments |
| D17 | Deferred | Dark-theme exact shades, final logo clear space/small-size tests, Inter sourcing | Need implemented evidence and visual approval; no decisions silently finalized |

No new design, API or infrastructure proposal in this log has been approved merely by documentation.

## Runtime verification decisions — 2026-11-18

Frontend repository: `D:\app\itatest`. Shared backend repository: `D:\Lerona\Backend`. Itatest local preview project: `D:\Lerona\Backend\backend\Cent.Preview\Cent.Preview.csproj`. API: `http://127.0.0.1:5108`; frontend: `http://localhost:5173/cent-s`.

Permanent constraint: the backend repository is read-only for this refinement program. Itatest-specific Cent.Module/Cent.Preview, Lerona-specific modules, and shared infrastructure are distinct boundaries. Inspect backend code only as needed for existing frontend behavior. Use only Cent.Preview with verified isolated local data for safe API tests. No production database connections, backend source/configuration/schema/authentication/API-contract edits, Lerona/shared-infrastructure edits, database upgrades or migrations, unrelated services, real payments, destructive operations, deployments, commits, or pushes. Any necessary backend change requires stopping and presenting impact analysis for both Itatest and Lerona before approval. Local fixture records created through the already-running preview's supported APIs are the explicitly authorized exception for runtime data; no direct database edits or cleanup/deletions were performed.

All reports, progress updates, technical explanations, implementation plans, documentation and approval questions are permanently in English, superseding the former Persian reporting rule. The user-facing interface remains conversational, warm, professional Persian.

| ID | Status / source | Decision | Consequence |
| --- | --- | --- | --- |
| D18 | Latest explicit owner instruction | English reporting permanently supersedes Persian reporting | Persian remains the user-facing UI language |
| D19 | Confirmed by owner and runtime | Frontend D:/app/itatest; shared backend D:/Lerona/Backend; only Cent.Preview for tests | No backend startup by audit; verified SQLite isolation and mock payments before writes |
| D20 | Permanent owner constraint | Preserve Itatest/Lerona/shared-infrastructure boundaries; backend read-only | Stop for dual-application impact analysis before any necessary backend modification |
| D21 | Runtime environment decision | Use localhost:5173 frontend to match existing mock payment redirect; backend 127.0.0.1:5108 | Environment override only; no tracked configuration change; failed first attempt retained |
| D22 | Safe test scope | Omit notes deletion; recovery targets only this run's smoke learner | Original tests unchanged; qualified audit variants are not full original-suite passes |
| D23 | Baseline finding, fix deferred | Original study-return failed twice; wait-for-loaded-page diagnostic passed | Record test synchronization defect, require separate authorization for tracked test repair |
| D24 | Scope gate | Phase 0 verification/docs only; no Phase 1 or source fixes | Conditional readiness review and explicit approval required before foundations |

No proposal or defect fix is approved merely by being recorded here.


## Phase 1 implementation record

| ID | Status | Decision and consequence |
| --- | --- | --- |
| P1-01 | Explicitly approved | Entire refinement program stays on local frontend main; no branch switching or automatic commits/push/deploy. |
| P1-02 | Explicitly approved | Phase 1 only; Phase 0 acceptance is conditional, not a clean regression signoff. |
| P1-03 | Protected baseline | Preserve both GIS commits, provider SDK/button, challenge/proof/session/protocol/security headers and retained code flow. |
| P1-04 | Implemented | One early classic public appearance script owns startup/runtime state; React uses useSyncExternalStore. Native labeled select in existing shells; standalone reader/diagnostic/callback coverage. No backend preference. |
| P1-05 | Implemented support adjustments | Light secondary/muted #5E6D77 replaces narrow #65737D candidate; success #486644; warning #79551C; error #A33E3E improve text contrast on supporting surfaces. Five approved brand constants stay exact. |
| P1-06 | Provisional visual decision | Dark base/accent candidates implemented; extra hover/selected/status surfaces defined and measured. Owner visual approval is pending. |
| P1-07 | Historical initial proposal; geometry superseded by P1-12 | SVG traced from supplied logo-reference.png. Missing original/brand-board images are not claimed reviewed. No new symbol. Dark symbol changes lower charcoal to off-white and middle slate to light slate for visibility; needs owner approval. |
| P1-08 | Implemented | Local Vazirmatn 400/500/600/700/800; old 900 declarations mapped to 800. Locally hosted official Inter variable WOFF2 + SIL license for Latin brand/fields. No dependency additions or font CDN. |
| P1-09 | Implemented | CSS color declarations migrated to semantic roles, preserving educational document/figure pixels and Google branding. Existing selector/layout architecture and content-driven breakpoints retained. |
| P1-10 | Focused regression correction | Smoke test positional first-select assumed no appearance control; use the training combobox's accessible name. All existing assertions retained; unrelated study-return remains unchanged. |
| P1-11 | Environment limitation | Existing preview binary lacked GIS discovery. Current source built outside backend; preview uses a frontend-local copy of local test data. No upgrade/migration flags. Existing backend test assemblies tested separately and explicitly labeled. |


## Original-reference logo review

| ID | Status | Decision and consequence |
| --- | --- | --- |
| P1-12 | Latest explicit user direction; implemented for review | Both missing references supplied. Original raster is geometry authority; recolored reference/board are identity sources. Approved hex palette and flat-fill decision override shading/gradients. Refined upper/middle band thickness and diamond placement with symmetric 45-degree geometry; no new concept. |
| P1-13 | Implemented consistency | Same paths in primary/dark wordmarks, light/dark symbols, monochrome/inverted and favicon; PNG favicons regenerated. Existing colors, wordmark casing, placement and auth code retained. Exact vector master remains unavailable; reconstruction is proposed until owner approval. |
| P1-14 | Approval gate retained | Reference availability resolved; geometry/variant and dark-appearance visual approval still pending.20 new actual local preview captures and matched-width comparison delivered. No Phase 1 closure or Phase 2 without explicit approval. |

[Review evidence and verification](LOGO_REVIEW_REPORT.md). Earlier P1-07 records the initial missing-reference condition; it is not the current availability status.
