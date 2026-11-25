# Phase 5 — final release readiness

25 November 2026. **Normal local manual acceptance is available; production release remains BLOCKED.** No deployment or production database operation occurred. Read [LOCAL_ACCESS.md](LOCAL_ACCESS.md) for URLs, existing-account access and startup. Per-requirement statuses are in [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md) and [verification/results.json](verification/results.json).

## Changes and local activation

The Phase 4 report was read and its implementation reused. There was no redesign or educational rewrite. Changes are confined to Itatest and Cent:

- Fixed the normal SQLite preview upgrade to add nullable `cent_notes.AnchorJson` to an existing notes table. Fresh fixtures already had this field; the persistent environment exposed its omission when notes returned 503. The fix runs inside the existing backed-up additive upgrade.
- Added a content-role-only, read-only administrator preview for imported HTML, including drafts. It reuses `CentEducationalContent`, `PilotLesson`, protected assets, opaque trace audits and database protection budgets. It cannot publish, approve offers, grant access or write notes/progress. A scoped selector-width fix prevents mobile overflow. Preview requests respect the full Retry-After cooldown.
- Added an explicit Development-only review grant, scoped to the existing student and the two new documents. Current entitlement is still required. Production and Staging ignore the grant, other identities cannot open drafts, and no publication or academic state changes. Unpublished reading is labeled as local review.
- Added local startup/preservation helpers and an explicit Cent-only SQL maintenance helper for offline migration-script generation, target inspection and guarded transactional import. None runs automatically in production. Unconfigured import is refused before connecting. The backup receipt is an operator attestation; production backup/restore verification must actually be performed by the DBA.
- Made one existing authentication transport test's performance clock deterministic after load exposed its 10 ms wall-clock assumption. Authentication behavior, identity, payment and purchase workflows were unchanged.
- Corrected the Persian local-draft notice after the final browser run detected question-mark text. The additive SQLite upgrade now leaves missing tables for the complete schema-creation script, preserving the existing unknown-constraint rollback behavior. Its legacy regression also removes `AnchorJson` before upgrade to verify that existing notes survive adding the column.

The normal database is `Backend/backend/Cent.Preview/App_Data/preview.db`, not `App_Data/isolated`. A verified online Cent-only backup preceded DDL/import: SQLite integrity and foreign-key checks passed and SHA-256 was recorded. Additional backups preceded the subsequent anchor correction and acceptance cleanup. Backups remain private under ignored local directories. [Backup evidence](verification/local-backup.json) and [preservation evidence](verification/local-preservation.json) contain no bearer tokens or note bodies.

The existing `CentCurriculumImporter.Import()` transaction imported all six reviewed packages into that database. Counts are 53 sources/documents for the curriculum, 538 section records, 1,037 exercises and 1,471 unique questions: mathematics 201, physics 281, chemistry 391, biology 421, logic 94 and Reading 83. Existing unrelated local PDF resources remain additional records. The compiler catalog was not regenerated or edited. Its SHA-256 and structural checks are in [academic-structure.json](verification/academic-structure.json).

Ignored `.env.local` sets `Cent__Reader__Enabled=true` and `Cent__Reader__AllSubjects=true`; the older pilot remains false. The existing subscribed student has all six training scopes. Reading was added through the normal development mock checkout, with an explicitly mock order/entitlement; its expected purchase-cache version increment is documented. No account/role/credential was replaced, no old purchase was rewritten, and no academic offer approval was fabricated. Private 24-hour maintenance sessions for the existing administrator and student permit immediate local review; they do not establish Google/SMS provider-login success.

All original note bodies, IDs, revisions, orders, entitlements, accounts and attempt snapshots were preserved. After browser tests, original reading positions touched by acceptance were restored from the pre-activation baseline; a verified current backup preceded each cleanup. Incomplete probe notes created by this run were removed. Original notes/attempts were not deleted. New acceptance attempts and new reading positions remain ordinary local activity. See [acceptance-cleanup.json](verification/acceptance-cleanup.json) and the post-cleanup [preservation comparison](verification/local-preservation.json). Existing per-account daily assessment limits remain enabled; acceptance attempts count toward them.

The chemistry publication document (50 lessons) and logic supplement remain **unpublished drafts**. Both are accessible in protected administrator preview and to the explicitly allowlisted existing student in Development through the normal reader. Other identities are denied. The canonical chemistry lessons and logic supplement can therefore be accepted locally with notes/progress while remaining unpublished; Production/Staging ignore the local review grant. Cross-document movement of ambiguous historical notes still requires an explicit owner/editor decision. Final local URLs include these distinctions.

## SQL Server blocker and safe recovery

[LocalDB diagnostics](verification/localdb-diagnostics.json) confirm SQL Server 2022 LocalDB 16.0.1000.6 is installed. `SqlLocalDB versions` and `info` work. Creating isolated `ItatestPhase5` and starting the verifier's `ItatestPhase4` both report:

> Unexpected error occurred while trying to access the LocalDB instance registry configuration.

The SQL client reports **SQL Network Interfaces error 50, Local Database Runtime error**, before any target database migration executes. [Exact connection error](verification/sqlserver-results.json) and [verifier log](verification/sqlserver.log) are retained. The LocalDB CLI returned exit code zero even while writing its failure message; the message/connection result, not that exit code, determines BLOCKED.

The effective execution identity is `codexsandboxoffline`, with no LocalDB instance registry under its HKCU. Instance directories observed in the desktop user's profile are not evidence that this sandbox identity owns a working instance. These observations point to the execution/profile/registry boundary; they do not prove that another application's instance is corrupt. Windows process-management queries were also denied. No registry/ACL repair, instance deletion, SQL service change, unrelated instance operation or global SQL configuration change was made. No running SQL Server database engine service or Docker alternative was available through the inspected environment.

An initial verifier build had stale restore assets and lacked its already-declared SQLite reference; a cached restore repaired those assets. The verifier then built, checked for pending Cent model changes, generated the complete nine-migration idempotent SQL and reproduced the connection failure. Offline/cached restore with auditing disabled was used only to build the verifier, not to claim vulnerability clearance.

Actionable resolution:

1. In the intended desktop SQL owner's normal session, inspect its LocalDB configuration and SQL LocalDB Application events. Do not delete or repair `MSSQLLocalDB`, `LeronaLocal` or unrelated registrations as a shortcut. Microsoft's [LocalDB documentation](https://learn.microsoft.com/en-us/sql/database-engine/configure-windows/sql-server-express-localdb) explains its per-user context; the [error reference](https://learn.microsoft.com/en-us/sql/relational-databases/express-localdb-error-messages/sql-server-express-localdb-reference-error-messages) identifies instance-registry access failure.
2. Create/start **only** the dedicated `ItatestPhase4` verification instance under an authorized SQL owner, or provision a separate SQL Server 2022 developer instance/container on a connected acceptance host. If installation repair is needed, the Windows/SQL owner must scope it without changing other applications' registrations or databases. This sandbox cannot grant itself that access.
3. Run `Cent.ReaderVerification` against its hard-coded local disposable instance and a new generated Itatest database, then retain results. The current verifier covers migration execution/import/replay/concurrency basics. Extend or independently execute the still-missing SQL Server historical upgrade/conflict rollback, controlled deadlock/timeout, lease-expiry, stale-cleanup and representative multi-process contention tests before signing off.
4. Measure SQL Server p50/p95/p99 request/lock latency, data/log growth, audit allocation/retention and legitimate shared-NAT navigation under representative load. Review actual deadlock reports and wait statistics. Do not extrapolate from SQLite.

**No SQL Server migration execution, distributed locking/deadlock recovery, rollback, expiry cleanup, throughput or storage compatibility is claimed.** SQL Server verification remains a release blocker, not a passed SQLite equivalent.

## Security, dependencies and operational limits

Full npm audit, production-only npm audit, browser-package npm audit and NuGet transitive auditing were retried. Registry advisory calls failed; NuGet reports forbidden socket access to `api.nuget.org:443`. Valid machine-readable wrappers preserve raw failure logs. Successful offline restore/build is not a clean audit.

The Phase 4 snapshot reported 13 moderate development-tool advisories, no high/critical advisories, rooted in ESLint's minimatch dependency. The installed tree still includes minimatch 10.2.6. The [current advisory](https://github.com/advisories/GHSA-g3hv-75wg-m249) lists 11.0.1 as the fixed version; blindly forcing that transitive major would violate the compatibility requirement. No verified compatible update was available through the restricted package network, so dependencies/lockfiles were preserved. This tooling is absent from the deployed static frontend; exposure classification is separate from unresolved build/CI risk. A connected audit and compatible update or explicit accepted mitigation remain required. Current production dependency cleanliness is **not certified**.

Cent regressions verify entitlement expiry/revocation, authorization, strict HTML/SVG handling, note ownership/revisions, immutable issued attempts and bounded cleanup/audit scope. Normal HTTP checks verify six-subject authorized delivery, anonymous/unentitled denial, private/no-store, opaque traces and protected media. Eight representative reviewed assessment definitions cover chapter reviews and all five supplied subject mocks. Pre-submission payloads omit keys/explanations, result routes deny access before submission, passage relationships and calculated results match the server review keys, and repeated submissions retain their result. Mathematics has no supplied new chapter-review/mock definition; its existing exercise/practice content is retained.

[Public artifact evidence](verification/public-artifact-scan.json) records the postbuild guard and a scan for private archive/database paths, private question IDs and substantial question stems in textual assets. None was found. Only `itatest/dist` is publishable. Canonical content, archives, answer keys, backups, maintenance sessions and private AFTER evidence must remain outside hosting.

Cleanup uses existing bounded SQL-aware locking and fresh lease checks; regression evidence is SQLite, with SQL Server execution still blocked. The normal cleanup worker is enabled; audit deletion remains unset. Audit TTL deletion is opt-in, bounded and restricted to eligible reader actions, preserving administrator/note/payment/import evidence. Production retention and capacity decisions remain unapproved.

Authorized users can extract content delivered to them, take screenshots, apply OCR or scrape slowly. Opaque trace watermarks, private assets and rate budgets do not provide complete copy protection.

## Acceptance and final verification

Final successful evidence is identified in [verification/results.json](verification/results.json); intermediate failed harness/build attempts are not hidden or added to final test totals.

- Frontend: 221 tests across 22 files, including two added preview cooldown cases; TypeScript production build, ESLint and private-artifact postbuild guard.
- Backend: 171 Cent tests and 90 exam/commerce tests passed. A separate final preview test passed; it overlaps the Cent suite and must not be summed. Cent.Module Release build, the corrected preview build and the offline release/import helper build passed. The normal preview's corrected schema was exercised with actual note saves.
- Chromium: all six subjects in the persistent environment; desktop and 390×844 mobile viewport; light/dark; note draft/save/reload/restore/reattachment retaining ID/body; keyboard image zoom/Escape where sampled diagrams exist; navigation/reading-position writes; no recorded page errors or viewport overflow in the final run.
- Administrator: both drafts rendered through content-only preview and through the scoped local student grant; other identities denied; wrong-role and wrong-section/asset tests; rich lesson tables/formulas, keyboard self-check reveal and responsive preview across six subject samples. Preview does not approve or publish.
- Reading browser journey: passage visible, answer selected, final submission, result page and blank-answer behavior. API probes separately validate scoring, secrecy and supplied review/mock categories.
- Existing PDF: a published PDF already in the normal database used the protected page-to-canvas path; draft reload, note save and mobile viewport passed. No new synthetic PDF fixture substituted for it.
- Firefox/WebKit: missing Playwright executables; **BLOCKED**. Real iOS/Android/Safari devices and screen-reader/full WCAG conformance are **NOT TESTED**. Focus, labels, Enter/Escape and native details/summary checks are limited accessibility evidence, not a comprehensive certification.
- Provider login: **BLOCKED** by external connectivity. Existing-account local maintenance sessions verify session restoration and application authorization, not provider authentication.

The local paced probe delivered eight sections at two-second intervals without throttling. A separate 18-request concurrent burst produced only successful deliveries and positive-Retry-After 429s, without 500s. [Latency/storage evidence](verification/local-storage-latency.json) records the exact sample and capture time; its small-sample p95 is the nearest-rank maximum. File growth and audit UTF-8 payload estimates include local acceptance activity and exclude SQL Server allocation; WAL is recorded separately. These are local observations, not production capacity targets.

New AFTER screenshots are limited to the added draft preview and its mobile containment fix, in `after/`; they contain protected content and remain private. Earlier reader visuals are reused from Phase 4.

## Release decision

The application is running locally for authorized manual review. The remaining gates are working SQL Server verification, successful current dependency audits/remediation, independent specialist approval and approved publication, provider/browser/device/accessibility acceptance, and representative staging load/restore rehearsal. See [ACADEMIC_REVIEW.md](ACADEMIC_REVIEW.md) and [DEPLOYMENT_RUNBOOK.md](DEPLOYMENT_RUNBOOK.md).

Production configuration, hosting, databases, reader flags and academic approvals were not changed. Lerona frontend, Lerona-specific backend code, migrations and configuration were not modified. Production release must remain disabled until explicit approval supported by the missing evidence.
