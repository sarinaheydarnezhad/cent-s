> Visually approved and closed by the owner at Phase 4 authorization. All documented technical limitations below remain retained. Phase 4 alone is authorized; see [Phase 4 report](PHASE_4_REPORT.md). Historical delivery and pending-approval wording below records the earlier state.

> Historical delivery record. The current Phase 3.1 revision and verification are documented in [PHASE_3_1_REPORT.md](PHASE_3_1_REPORT.md).

# Phase 3 — public website and authentication experience

Verification completed 2026-11-19 (Asia/Tehran); work began with the owner authorization on 2026-11-18.

## 1. Implementation summary

Delivered a calm, organized public website and auth presentation in the existing React/TypeScript/CSS architecture. The homepage explains actual subject-level preparation, current exam availability and the next step. Existing pages, shared components, theme ownership and protected behavior are preserved. Ready for explicit visual review; Phase 4 has not begun.

## 2. Phase 2 closure and Git

The owner visually approved Phase 2 and authorized Phase 3 public/auth presentation only. Phase 2 is closed with all documented technical limitations retained. Phase 3 is implemented and delivered for explicit visual approval. Phase 4 has not begun and requires separate authorization.

Work stays on local main at **8e87191a471ebe585ebb58f7db7fbbff688da5e8**, the user-created Phase 2 commit. Initial working tree clean; current Phase 3 changes are uncommitted and unstaged. No branch creation/switch/reset, commit, push or deployment. No backend repository access, source/configuration edit, migration, production connection or real payment. Existing frontend at 5173 / local preview at 5108 services reused; only the temporary root preview at 5180 was task-owned. [Authorization](evidence/phase-3/authorization.md), [delivery boundaries](evidence/phase-3/delivery-verification.json).

## 3. Public pages and routes

| Route | Implemented presentation |
| --- | --- |
| / | Split hero/tagline, benefits, current/future exam availability, learning flow, live resources and final assessment CTA |
| /exam | CEnT-S preparation explanation, actual courses/chapters/topics and organizer disclaimer |
| /courses/:code | Public outline spacing/type/touch readability; original content, access, catalog/prices and destinations retained |
| /diagnostic/intro | Subject-level evaluation purpose, real result types, timing and login prerequisite; test destination retained |
| /login | Both existing login and registration modes, form hierarchy/spacing/contextual feedback |
| /auth/google/callback | Named standalone loading/error state with existing login recovery and appearance |
| unknown routes | Standalone branded404, simple explanation and real home recovery |
| /package, /checkout, /checkout/success | Header/footer changes only; commerce workflows unchanged |
| /diagnostic/test, /diagnostic/results | Existing test/protected-result redirect untouched; no assessment redesign |

No About/Help/Contact/Legal page or password-recovery flow exists. None was fabricated. No new route or unsupported examination registration was introduced.

## 4. Layout and UX decisions

Adapted the approved reference's spacious split hero, academic visual, exam cards and simple preparation flow. The approved tagline is the main headline; one Slate primary action opens the existing assessment introduction. A quieter secondary link explains preparation. IMAT/SAT have explicit unavailable wording and no interactive descendant. No testimonials, institution logos, invented learner counts, success rates, automatic study planner, guaranteed outcomes or free-offer claim.

The hero uses original flat code-native academic portico/open-book artwork, avoiding copied reference photography or an extra dependency. Decorative SVG has no simulated product data. A concise Sage learning band explains the supported assess/study/practise/review path. Home course cards omit long source excerpts through a presentation option; full outlines and educational text remain available. Public navigation is simple and responsive; footer links only to real routes. Authentication uses a quiet supporting panel on desktop and a focused form on mobile. No private/assessment/reader/transactional/admin layout redesign.

## 5. Shared component reuse

Card, Badge, PageHeader, InputField, FilterGroup, Button, Notice, LoadingState, LoadState, Brand, AppearanceControl and JourneyNav are reused. Link actions keep native Link semantics and shared button classes. Existing shared token/radius/type/spacing contracts are untouched. CourseCatalog gains optional secondary-action/compact-excerpt presentation props; commerce keeps its original defaults. A small disclosure correction supports initial link focus when the panel has no button; existing safe dashboard close-button priority is preserved and regression-tested. No parallel component library or dependency changes.

## 6. Slate and Sage

Slate controls primary actions, current navigation and ordinary interaction. Sage identifies learning context, the supportive preparation flow/outcomes, resource icons and selected academic illustration elements. Success/error/info remain distinct semantic roles. Neutral auth surfaces avoid unnecessary green. Existing light/dark semantic aliases supply every composition color; no literal color/gradient is added in public.css. Approximate10–15% Sage presence is visual guidance, not a pixel quota.

## 7. UX writing

Conversational professional Persian explains what the learner can do: شروع ارزیابی سطح, آشنایی با مسیر آمادگی, بخون و تمرین کن and قدم بعدی رو پیدا کن. The promise is framed around clearer subject-level next steps. Future exams explicitly say they are unavailable. The404 no longer exposes MVP implementation wording. The existing organizer disclaimer is retained. Scientific titles/excerpts/questions, actual validation constraints, server error meaning and legal meaning are preserved. Browser-native validation language depends on the browser environment; no alternate validation engine was introduced. [Writing record](UX_WRITING.md).

## 8. Authentication protection

Login/callback pre-render state/effect/submission code matches the committed baseline exactly. Thirty-eight protected raw hashes cover GoogleSignIn, all services/tests, AppState, App routes, theme owner, shared primitives/tokens, brand assets, packages/Vite and security headers. Early callback capture remains unchanged; main adds one CSS import. Password min10/max128, email/name limits, native submit validation, submission ref guard, Google/password coordination, safe return, role navigation, expiration, restore/logout and recovery behavior remain. CourseDetails data/access logic matches baseline exactly aside from the public wrapper class.

The official Google SDK/button component and iframe styling are untouched. No protocol, API, token, session, provider or security-header change. **75 mocked auth executions passed**; these do not verify real OAuth/signatures/FedCM/consent or production configuration. Google evidence uses explicitly synthetic SDK/code flow and cannot establish actual Google branding rendering.

## 9. Responsive and appearance verification

Eight states ×seven widths(320/375/390/768/1024/1280/1440) ×two themes =**112 development observations**, repeated successfully on the compiled root build. No document horizontal overflow. Four extra catalog-shell samples also fit. A768 CSS-pixel/200% root-text sample and reduced-motion behavior pass; 320 CSS pixels supplies representative reflow. Mobile header/navigation, single-column hero/exams/resources and auth form work in RTL. Nine existing appearance groups pass in development and root, preserving System startup, live OS changes, persistence/reload and blocked-storage fallback. Representative Chrome checks are not exhaustive cross-browser/device/zoom acceptance.

## 10. Accessibility findings

**44 measured public text/control contrast pairs** pass their recorded4.5:1 text/3:1 control thresholds across both themes; repeated on root. Each of the eight sampled states has one h1 and one main. Email/password retain LTR direction, exact visible labels, native required constraints and associated hints. Invalid native email and missing registration name focus the affected control. Persistent injected401 retains fields;503 resources show real retry, never fake empty data. Mobile menu moves focus to its first link, excludes closed links from keyboard focus, closes on route/Escape and restores trigger; skip-to-main works. Existing dashboard safe-close focus is independently checked using a synthetic session. Most controls inherit44/48/56 px shared targets; scientific mixed-language content is unchanged.

This is representative automated/rendered evidence, **not comprehensive WCAG2.2AA or actual screen-reader certification**. Native browser validation localization, all focus/zoom/device/assistive-technology combinations and legacy private/reader/table density remain outside a full acceptance claim.

## 11. Baseline, tests and builds

| Check | Current result / evidence |
| --- | --- |
| Focused pre-edit baseline |144 unit tests/8 files, default build,25 mock auth,9 appearance groups pass;32 before screenshots. No count difference against Phase 2functional baseline in repeated scope |
| Final unit |144pass/8 files; [log](evidence/phase-3/final-unit.log) |
| TypeScript |Explicit tsc-b pass; [log](evidence/phase-3/final-types.log) |
| Production builds |/cent-s/ and / pass; [default](evidence/phase-3/build-default.log), [root](evidence/phase-3/build-root.log) |
| Mock GIS/code/password |75 final executions: dev light 25,dev dark 25,compiled root 25; [lightGIS](evidence/phase-3/gis-light.log), [lightcode](evidence/phase-3/auth-light.log), [darkGIS](evidence/phase-3/gis-dark.log), [darkcode](evidence/phase-3/auth-dark.log), [rootGIS](evidence/phase-3/root-gis.log), [rootcode](evidence/phase-3/root-auth.log) |
| Appearance |9 groups development and9root; [dev](evidence/phase-3/appearance-final.log), [root](evidence/phase-3/root-appearance.log) |
| New public browser |6 groups/112 observations/44 contrast pairs development, repeated root; [dev](evidence/phase-3/public-development-result.json), [root](evidence/phase-3/public-root-result.json) |
| Connected public courses |Unchanged existing suite passes five course listings/outlines, access protection, mobile and error/no-demo-fallback; [log](evidence/phase-3/connected-courses.log) |
| Existing sidebar focus |Synthetic regression passes safe close priority/Escape/restore; [result](evidence/phase-3/disclosure-result.json) |
| Focused lint |0 errors/0 warnings current public source/new test/helpers; [JSON](evidence/phase-3/focused-lint-verified.json) |
| Authored lint |**FAIL: 90 existing errors**, 6src; Phase 2same 90/6 baseline; [JSON](evidence/phase-3/authored-lint-verified.json). No rules disabled or broad cleanup |
| Protected boundaries/diff |38 hashes unchanged, auth/access logic unchanged, original headers in both outputs, no references/evidence copied, main/HEAD/staging/diff-check pass; [result](evidence/phase-3/delivery-verification.json) |
| Backend tests/build / wider connected suites |Not rerun; no backend repository access. Historical binary counts remain qualified, original study-return remains unresolved |

No test was weakened, skipped result called passing or newly established unresolved critical regression left in verified scope. Initial helper lint missed host imports/globals; corrected without rule suppression and failure JSON retained. Root builds were served with the correct root base and local API proxy; no live service was tested. Build timing warnings are informational, with exit0.

## 12. Evidence and local review

[Visual comparison index](evidence/phase-3/index.html): **87 selected actual rendered images**, 32 matched before/after pairs. Homepage, hero, current/future exams, footer, mobile menu, exam/course/introduction, login/registration, callback/404, validation/error/retry, both themes and390/1440layouts. 53 current public captures, 32 before and two synthetic Google images. Data classifications are explicit: real isolated local public GETs; actual native validation/missing-proof callback; injectedHTTP 401/503; synthetic SDK/code-flow. No generated mockup or real learner data.

Run `npm.cmd run dev -- --host 127.0.0.1`; open [homepage](http://localhost:5173/cent-s/) or [login](http://localhost:5173/cent-s/login). Open index.html directly or through the dev server under /cent-s/docs/refinement/evidence/phase-3/index.html. Existing [component reference](http://localhost:5173/cent-s/component-reference.html) remains development-only. Production graphs exclude both references/evidence. For public checks, node tests/browser/check-public.mjs requires the existing isolated local preview and verifies DEVELOPMENT_MOCK. [Evidence README](evidence/phase-3/README.md).

Files: new public.css, page-local LearningIllustration, check-public browser suite; modified PublicLayout/disclosure, main CSS import, CourseCatalog, six existing public page modules. Required program/design/writing/acceptance/coverage/regression/visual/open-decision/plan docs, component guides/inventory and Phase 2closure updated with preserved histories. [Complete file list](evidence/phase-3/changed-files.txt). No package/lock/configuration/brand asset/backend change.

## 13. Remaining limitations and deferred work

Real Google OAuth/signatures/FedCM and production CORS/configuration remain unverified. Comprehensive WCAG/actual assistive-technology and cross-browser acceptance remain unverified. Existing study-return synchronization, exposed math: recommendation codes, external payment verification, destructive/timeout/reader/private-state coverage, outlined wordmark source and authored lint debt remain carried forward. Historical Cent 108 / Lerona 396 passing binary tests with three skips are prebuilt-assembly evidence, not fresh source-build checks; they were not rerun in Phase 3.

No password-reset feature or new informational/legal page is available. Existing public course source text and commerce/private-page microcopy/density remain outside comprehensive rewriting. Real Google rendering needs its configured authorized environment; synthetic button evidence is not official-provider acceptance. New public contrast/reflow/focus checks cover representative states only. No backend source-build or production validation is implied by this presentation work.

## 14. Decisions requiring approval

Explicit **Phase 3visual approval** of the delivered public/auth pages and original academic illustration remains pending. No additional backend, feature or deployment decision is required to review the local result. Approval does not authorize commit/push/deploy unless explicitly stated. Stop here; no Phase 4implementation.

## 15. Proposed Phase 4 scope

After separate authorization: student dashboard, preparation/library, notes, account/profile, PersonalResults and LearningProgress presentation. Reuse the approved components with real saved progress, results, library and recommendations; preserve evidence/scoring/session/authorization/draft rules. No fabricated weekly planner or learner achievements. Assessment, reader, commerce and admin stay with their later scoped phases. This proposal is not started.
