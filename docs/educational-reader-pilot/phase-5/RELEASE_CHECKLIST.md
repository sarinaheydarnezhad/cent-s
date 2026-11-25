# Release checklist

25 November 2026. **Overall production release: BLOCKED.** Local manual acceptance is available. PASS is limited to the evidence/provider stated; it is not academic certification or production capacity approval.

| Requirement | Status | Evidence / limitation |
|---|---|---|
| Read/reuse Phase 4 implementation; no redesign | PASS | Existing Slate & Sage renderer, importer, accounts and workflows retained |
| Normal local development environment | PASS | Persistent `Cent.Preview/App_Data/preview.db`, API 5108, Vite 5173; no isolated/fixture flags |
| Enable all six reader subjects locally | PASS | Ignored `.env.local`; Enabled/AllSubjects true; old pilot false |
| Create and verify backup before DDL/import | PASS | `verification/local-backup.json`, integrity/FK checks, SHA-256; additional pre-DDL/import backups in logs |
| Add current schema to normal SQLite preview | PASS | Explicit backed-up upgrade, including corrected nullable notes AnchorJson and budget storage |
| Import all six reviewed packages transactionally | PASS | Normal importer; 53 sources, 538 sections, 1,037 exercises, 1,471 questions |
| Existing student access to all six subjects | PASS | Existing subscription plus Reading development mock checkout; no account replacement or academic offer approval |
| Student publication of new chemistry/logic drafts | BLOCKED | Deliberately unpublished pending approval; local student review is explicitly scoped to Development; publication approval is still pending |
| Authorized draft review and administrator management | PASS | Protected preview, resource inventory, role denial, private assets, preview audits; new documents remain drafts; the allowlisted local student can review them |
| Preserve historical users/notes/purchases/progress/results | PASS | `local-preservation.json`; historical positions restored after acceptance, original notes/attempts untouched |
| Exact local links and startup instructions | PASS | LOCAL_ACCESS.md and `verification/local-links.json` |
| LocalDB diagnosis and isolated create/start retry | PASS | `localdb-diagnostics.json`, installed 16.0 engine; effective sandbox identity lacks instance registry |
| Repair LocalDB safely within available permissions | BLOCKED | Registry access fails; no machine-wide ACL/registry change or unrelated instance modification |
| Execute all nine migrations on isolated SQL Server | BLOCKED | SQL Network Interfaces error 50 / LocalDB registry configuration; generated SQL alone is not execution |
| SQL Server historical upgrade, conflict rollback and import replay | BLOCKED | SQLite regression passes are separate evidence |
| SQL Server distributed locking, contention/deadlocks | BLOCKED | No working SQL Server connection; not established by HTTP/SQLite probes |
| SQL Server lease expiry and cleanup races | BLOCKED | Component coverage passes on SQLite only |
| SQL Server response latency, capacity, growth and audit storage | BLOCKED | No production-compatible measurements available |
| Local paced reading / deliberate burst | PASS | Eight deliveries two seconds apart, no 429; separate 18-request burst returns 200/429, positive Retry-After, no 500 |
| Local latency/storage measurements | PASS | `local-storage-latency.json`; explicitly SQLite and local load only |
| npm full / production-only / browser audit retry | BLOCKED | Registry advisory endpoint unreachable in sandbox; no clean audit claim |
| NuGet vulnerability audit retry | BLOCKED | Forbidden socket access to `api.nuget.org:443`; cached restore/build is not vulnerability clearance |
| Development advisory exposure classification | PASS | Prior 13 moderate reports trace to development ESLint/minimatch; current minimatch 10.2.6; no verified compatible fix applied |
| Resolve all applicable dependency advisories | BLOCKED | Successful online audit and compatible fix/accepted mitigation still required; no speculative major updates |
| Authorization and entitlement expiry | PASS | Cent regressions plus normal HTTP denial probes; provider sign-in listed separately |
| Protected assets and anti-scraping | PASS | Private media, ownership, anonymous/unentitled denial, watermark, burst limits; SQL replica behavior still blocked |
| HTML/SVG sanitization and private caching | PASS | All imported sections/assets regression; normal HTTP private/no-store and safe media contracts |
| Note ownership / revisions / historical notes | PASS | Regression tests, normal note round trips, owner denial, original-row comparison |
| Protected content/ZIPs/keys/backups/evidence absent from public build | PASS | Postbuild guard and `public-artifact-scan.json`; deploy only dist |
| Assessment keys withheld until submission | PASS | Normal HTTP probes; result route before submission denied; eight representative reviewed definitions including all five supplied subject mocks |
| Cleanup and audit retention behavior | PASS | Bounded cleanup/active lease/non-reader audit regression; worker enabled locally, audit deletion unset; SQL execution still blocked |
| Authorized extraction/screenshot/OCR/slow scraping risks documented | PASS | REPORT.md and runbook; no complete copy-protection claim |
| Live Google/SMS login on normal environment | BLOCKED | Offline/provider connectivity; local existing-account maintenance sessions do not establish provider authentication |
| Session restoration, library, subject/lesson navigation | PASS | Normal persistent environment Chromium checks |
| Educational content, formulas, tables, diagrams and zoom | PASS | Six-subject render checks and selected rich-lesson administrator previews; chemistry draft stays unpublished and review-only |
| Notes, anchors, drafts and reattachment | PASS | All six: save/reload/draft restore/same ID and body after anchor revision; no guessed cross-document migration |
| Reading positions/bookmarks | PASS | Current LastPage/FurthestPage contract; tests restore original positions afterward |
| Exercises and answer reveal | PASS | Existing renderer details/summary keyboard reveal in subjects with supplied self-check markup; no fabricated exercise in Reading/Logic samples |
| Chapter reviews and subject mocks | PASS | Representative available definitions via normal API; no new mathematics mock supplied; eight selected definitions cover available categories |
| Passage-dependent Reading and assessment UI submission/results | PASS | `normal-interactions.json` and `normal-http-security.json`; passage visible, option selected, submission/result rendered and server scoring checked |
| Desktop/mobile viewport; light/dark | PASS | Chromium 1440×1000 and 390×844 emulation, not real-device verification |
| Chromium | PASS | Installed Chrome 158.0.8127.38 |
| Firefox | BLOCKED | Playwright Firefox executable missing; install on a connected acceptance machine |
| WebKit | BLOCKED | Playwright WebKit executable missing; install on a connected acceptance machine |
| Real iOS/Android/Safari devices | NOT TESTED | No physical device acceptance performed |
| Limited keyboard/accessibility checks | PASS | Focusable controls, keyboard image dialog/Escape, details/summary reveal, labeled section selector; no comprehensive WCAG claim |
| Screen-reader/full WCAG audit | NOT TESTED | Requires assistive-technology and specialist acceptance |
| Existing PDF reader compatibility | PASS | Existing published normal-local PDF, protected canvas, draft restore/save, mobile viewport; `normal-pdf.json` |
| Administrator publication/academic gate regressions | PASS | Existing publication completeness/immutability and content-approval tests; no normal draft published |
| Actually approve/publish supplied new documents | BLOCKED | Requires independent academic decision; intentionally not performed |
| Academic structure/mapping checks | PASS | 1,471 IDs, options/keys, explanations, 42 memberships, 15 passages, mapping limits recorded |
| Specialist scientific/answer/difficulty certification | BLOCKED | Independent sign-offs absent for every subject; ACADEMIC_REVIEW.md |
| Production runbook and guarded import preparation | PASS | DEPLOYMENT_RUNBOOK.md; Cent-only SQL/import helper builds and refuses unconfigured import; target import/restore rehearsal not executed |
| Production backup/restore rehearsal and smoke/load acceptance | NOT TESTED | No production target or approved deployment was used |
| Keep production rollout disabled / no deployment | PASS | No production mutation, publication, hosting upload or activation |
| Scope: Itatest/Cent only | PASS | No Lerona frontend/backend source, configuration, database or migration changes |
| Final frontend tests, type check, lint and build | PASS | 221 tests; final build includes TypeScript; lint logs and artifact guard |
| Final Cent tests and release build | PASS | 171 Cent + 90 exam/commerce tests; separate 1-test preview confirmation overlaps Cent; Cent.Module Release build |
| Leave normal environment running | PASS | Final loopback health evidence in `verification/final-health.json`; startup instructions provided |

Machine-readable statuses and supporting paths are in `verification/results.json`. Failed exploratory runs remain in logs where useful; final successful evidence is explicitly identified and overlapping test runs are not summed.
