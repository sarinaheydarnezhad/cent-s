> Closed after explicit owner visual approval of Phase 4.1. All documented limitations below remain accepted and retained. Earlier pending-approval/authorization statements are historical; Phase 5 was subsequently authorized. See [Phase 5 report](PHASE_5_REPORT.md).

# Phase 4 — student dashboard and authenticated experience

Phases 3 and 3.1 are visually approved and closed by the owner, with all documented technical limitations retained. Phase 4 is implemented for explicit visual approval. Phase 5 has not started. Changes remain local, unstaged and uncommitted on main, starting from the owner's 1ed76ee Phase 3/3.1 commit. No push or deployment.

## Dashboard and navigation

The student composition follows the dashboard side of [ui-reference.png](../brand/ui-reference.png), adapted to actual application capabilities: personal welcome and exam context; per-course learning position alongside the latest assessment summary; a prominent Sage recommendation band; saved-study resume alongside quieter resource rows and notes access; and the latest saved study/assessment activity. There is no invented overall progress ring, B1 level, weekly plan, achievement, notification or activity feed.

Desktop progress uses a compact two-column course arrangement where space permits. Tablet and mobile layouts reflow to readable rows and stacked sections. The latest assessment percentage remains separate from mastery: a result score is not presented as overall course completion. Resource rows and recent activity avoid repeating large card containers. Restrained Slate/info and Sage/surface gradients add depth; the small entrance transition respects reduced motion. Dark mode uses the existing dark semantic palette and removes shadows through the established tokens.

The student sidebar now uses a neutral surface, Slate active-route selection, a visible active edge, the approved flat Brand and comfortable navigation targets. The topbar reflects the current navigation context, keeps the single-click appearance control, and provides a named account link. A keyboard skip link targets the main content. Mobile navigation retains the existing disclosure, dismissal, Escape and focus-return behavior; the closed student drawer is removed from layout, and descendant transitions exclude visibility to avoid delaying focus when it opens. The shared navigation hook is unchanged. Administrative routing, items, permissions and presentation remain separate.

Source: [StudentDashboard](../../src/pages/StudentDashboard.tsx), [DashboardLayout](../../src/components/DashboardLayout.tsx), [student.css](../../src/student.css). The existing PracticePages dashboard export delegates to the new page composition; its assessment, result and simulator functions remain unchanged.

## Data, recommendations and progress

The dashboard uses existing library, attempts/outcome, mastery and curriculum endpoints through shared useRemote/LoadState. These streams recover independently. It no longer depends on the silent background AppState refresh to decide whether a student has an assessment; an unavailable outcome is shown as an error with retry, rather than as a new-student result. AppState and its authentication/session behavior are unchanged.

Progress values, assessed-topic counts and unassessed states come directly from the mastery report. No new average, threshold, scoring or evidence calculation is introduced. Named ProgressBar values include an explicit unassessed text equivalent and real assessed-topic counts. Copy explains that reading alone does not change mastery, and that unassessed topics contribute zero to the existing overall calculation. In the connected fixture, the practice score and rounded course-progress value differ legitimately; the interface preserves both.

Sage has specific learning roles: course progress indicators, learning context, recommendation surface/heading/badge, resource icons and resume-book treatment. Slate remains the primary action and ordinary navigation color. There are no fabricated completion markers or achievements.

The exposed `math:` issue is corrected in the **dashboard presentation** for exact curriculum mappings. Actual local recommendations use values such as `math: عبارت‌های جبری`; both spaced legacy course/title values and exact course/topic IDs are supported. Labels come from current course/topic metadata, with original recommendation wording and priority order preserved. A priority links to the existing topic-practice route only when its topic match is unambiguous. Unknown or unavailable mappings retain their original code, show an explanation and offer the existing curriculum retry where applicable. No guessed label or silent filtering. Dedicated assessment/result pages retain their existing codes and remain Phase 5 scope. [Presentation helper and tests](../../src/services/learning-presentation.ts).

Resume uses the existing latest-progress ordering, saved page/date and document title. The route remains `/student/study/:id`, letting the unchanged reader restore its saved page. Library access indicators use existing readable-training IDs; an older inaccessible resource is identified without bypassing reader authorization. Recent activity is limited to the actual latest saved study and latest result, with their dates; it is not a fabricated chronological feed.

## Account and component reuse

The existing account surface is read-only: there is no profile-edit/password-reset form or supported update operation to redesign. Its identity area now has a shared Card, clear name/email labels, an isolated LTR email and an existing library action. No new edit or account-management capability is implied. Account hooks, membership, orders and payment-follow-up markup are preserved for Phase 7; their legacy feedback limitations are not claimed fixed.

Reused components: Brand, AppearanceControl, useNavigationDisclosure, PageHeader, Card (standard/recommendation), Badge, ProgressBar, Notice, EmptyState and LoadState/useRemote. There is no new design system, provider/store, dependency, theme owner or generic primitive abstraction. Persian interface copy uses the approved supporting phrase and exact resume phrase. Scientific/curriculum titles and recommendation meaning remain intact. Technical documentation remains English.

## Verification and AFTER evidence

| Check | Final result |
| --- | --- |
| Frontend unit tests | 156 passed / 9 files; Phase 3.1 baseline 148, plus 8 focused metadata-presentation tests |
| TypeScript and production | `tsc -b` and both `/cent-s/` and root builds pass |
| Mocked authentication | 75 executions: 16 GIS + 9 code/password scenarios in development Light, development Dark and compiled root |
| Appearance | Existing 5 groups pass in development and compiled root; startup, migration, persistence, keyboard, storage/cross-tab behavior retained |
| Dashboard | 13 groups and 26 responsive observations per environment; development and compiled root |
| Connected progress regression | Real 0%/100% practice outcomes, 50% recent accuracy, +100 comparable change, mastery evidence and account isolation pass |
| Shared/public regression | Existing 6 public groups, 112 observations and 44 contrast pairs pass; capture disabled |
| Accessibility | 158 rendered text/gradient endpoint pairs per environment pass 4.5:1; representative RTL/LTR, named progress, keyboard account/skip/drawer, visible focus, primary touch targets and reduced motion checks pass |
| Focused lint | New/changed presentation and new helpers are clean; the unchanged assessment effect in PracticePages retains one error, identical to its HEAD baseline |
| Protected boundaries | 26 complete protected files match HEAD; assessment/result/simulator functions, commerce/library/notes functions, account business hooks and membership/order markup match after newline normalization |
| Visual evidence | 13 new AFTER images only; no new BEFORE captures or matched pairs |

Connected dashboard checks use synthetic students on the existing isolated local DEVELOPMENT_MOCK preview, with a saved page, a submitted practice outcome and a mock-paid existing resource. These are real local API responses, not production/student data. New-student evidence uses a separate account without history or results. Injected states cover delayed mastery, library failure and recovery, unknown mapping, unavailable curriculum, unavailable assessment/mastery, incomplete guidance and owned resources without study history. Only four representative injected states are captured; the rest are assertion-only. No real transaction or provider credential is used.

The existing authentication mocks now explicitly return the mastery endpoint's empty `{ courses: [] }` contract, which the new dashboard consumes. Their generic array fallback was not a valid mastery response and caused an intermediate synthetic dashboard render error. Authentication assertions and protocol fixtures remain intact; the 75 executions were repeated after this fixture correction.

All AFTER paths and state classifications are in the [review gallery](evidence/phase-4/index.html) and [dashboard result](evidence/phase-4/dashboard-development-result.json). Representative originals: [returning desktop Light](evidence/phase-4/after-dashboard-connected-light-1440.png), [returning desktop Dark](evidence/phase-4/after-dashboard-connected-dark-1440.png), [returning mobile](evidence/phase-4/after-dashboard-connected-light-390.png), [new learner](evidence/phase-4/after-dashboard-new-connected-light-1440.png), [mobile navigation](evidence/phase-4/after-navigation-dark-390.png), [account](evidence/phase-4/after-account-connected-dark-390.png), [loading](evidence/phase-4/after-dashboard-loading-injected-light-390.png), [recovery](evidence/phase-4/after-dashboard-recovery-injected-dark-390.png) and [unmapped code](evidence/phase-4/after-dashboard-unmapped-injected-light-390.png).

Machine-readable [validation summary](evidence/phase-4/validation-summary.json), [root dashboard](evidence/phase-4/dashboard-root-result.json), [accessibility](evidence/phase-4/accessibility-development-result.json), [root accessibility](evidence/phase-4/accessibility-root-result.json), [delivery boundaries](evidence/phase-4/delivery-verification.json) and [lint](evidence/phase-4/focused-lint.json) accompany saved unit, build, auth, appearance and connected-progress logs. The evidence README records corrected intermediate implementation/helper failures. Existing assertions were retained.

## Limitations and approval

The documented study-return synchronization issue remains Phase 6. The focused resume check confirms a dashboard link can restore an already saved page; it does not close the asynchronous reader/exam return limitation. Reader source/persistence and assessment business logic are unchanged. Dedicated results, full library/notes workflows, commerce and admin redesign remain outside this phase.

Real Google OAuth/signatures/FedCM, production configuration/CORS, external payments, full WCAG and assistive-technology/cross-browser coverage remain unverified. Checks use local Chromium and representative viewports, not physical-device acceptance. Broader legacy lint debt, reader/private/timeout/destructive coverage and prior backend-test qualifications remain retained; no fresh backend source-build/test claim is made. No backend repository source/configuration/schema change, migration or production connection occurred. Test records were created only through supported isolated-preview APIs. Task-owned preview processes are stopped at handoff; existing user-owned preview services are left running.

Pending decision: explicit visual approval of Phase 4 dashboard hierarchy, Sage learning surfaces, student navigation, account identity and responsive evidence. No new business/security/backend decision is required. Stop here; do not begin Phase 5.
