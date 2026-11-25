# Cent educational reader deployment runbook

**Production rollout is disabled. This is preparation only. Do not execute production writes without explicit deployment approval and the academic decisions below.** SQL Server execution and online vulnerability clearance are still blockers; see REPORT.md. No production connection was used in Phase 5.

## 1. Release decision and target

Assign a release operator, DBA, security reviewer and academic owners. Record the exact frontend/backend revisions, compiled catalog SHA-256, six package checksums, deployment window and rollback owner. Resolve all BLOCKED/FAIL entries in RELEASE_CHECKLIST.md, including SQL Server locking/cleanup/load checks and successful online dependency audits. Complete specialist sign-off per ACADEMIC_REVIEW.md.

Use a **dedicated Cent-only SQL Server database**. Confirm the server and exact database independently; never rely on `FlashcardsDb` fallback. Do not run shared backend/Lerona migration commands. The release helper rejects system databases, names containing Lerona and databases containing non-`cent_` user tables. That guard supplements DBA verification; a database name alone cannot prove isolation. If the existing target is shared with Lerona, stop and plan a separately approved Cent extraction/restore; this runbook does not authorize modifying it.

## 2. Required configuration

| Server environment variable | Required value / handling |
|---|---|
| `Cent__Enabled` | `true` only on the approved existing Cent host |
| `ConnectionStrings__CentDb` | Explicit dedicated Cent SQL Server connection, encryption and certificate validation per hosting policy; secret store only |
| `Cent__ClientBaseUrl` | Exact approved frontend URL including `/cent-s` if deployed at that base |
| `Cent__PublicApiBaseUrl` | Existing public API origin; preserve callback contracts |
| `Cent__AllowedOrigins__0` (and numbered entries) | Exact approved origins, no wildcard |
| `Cent__Reader__Enabled` | `false` throughout migration/import/staging; explicit later activation |
| `Cent__Reader__AllSubjects` | `false` initially; use `Cent__Reader__Subjects` for an approved pilot scope |
| `Cent__Reader__LocalReview__Enabled` | `false`; leave LocalReview UserId unset. Production/Staging ignore this development-only review grant |
| `Cent__ReaderPilot__Enabled` | `false`; do not accidentally reactivate the old independent pilot |
| `Cent__Reader__Protection__CleanupEnabled` | `true` when reader activation is approved |
| `Cent__Reader__Protection__CleanupBatchSize` | Start at default 200; bounded maximum 1,000 per 15-minute worker cycle |
| `Cent__Reader__AuditRetentionDays` | Unset retains audits. Only set an approved 30–3,650-day value after evidence/export policy approval |
| `Cent__Exams__Enabled` | Preserve the existing approved exam setting; this reader release does not certify new versioned high-stakes exams |
| `Cent__Payments__AllowDevelopmentMock` | `false` in production; preserve existing real gateway and identity secrets |
| `ASPNETCORE_ENVIRONMENT` | `Production` on the existing deployed host; never deploy `Cent.Preview` |

Frontend: `VITE_CENT_API_URL=/api/cent/v1` for the existing same-origin API/proxy, and the existing `VITE_BASE_PATH` (`/cent-s/` here). If hosted separately, use the approved HTTPS API endpoint and exact CORS origin. `CENT_BACKEND_URL` is a local Vite proxy setting, not a browser credential. Never copy `.env.local`, maintenance sessions, fixtures or development payment settings to production. Preserve existing Google/SMS/payment configuration; no workflow change is part of this release.

Reader defaults remain: body account/IP 60/600 per minute; asset account/IP 360/2,400 per minute; account/IP concurrency 8/64; body account burst 12 per ten seconds; body account long budget 600 requests and 120 unique sections per 1,800 seconds; asset account/IP long budgets 6,000/40,000; IP body long budget 12,000; 120-second lease; ten-second minimum cooldown. Confirm the actual host overrides and proxy IP handling before activation. Raising budgets requires measured evidence; do not disable protection to hide latency or deadlocks.

## 3. Verified Cent-only backup

Quiesce Cent writes in the approved maintenance window. Verify database identity, expected Cent table counts, current migration history and content receipts. In the **selected dedicated Cent database**, the DBA must verify:

```sql
SELECT DB_NAME() AS SelectedDatabase;
SELECT name FROM sys.tables
WHERE is_ms_shipped = 0 AND name NOT LIKE 'cent[_]%'; -- must return zero rows
SELECT MigrationId FROM cent_migrations_history ORDER BY MigrationId;
```

Create a fresh full `COPY_ONLY` backup with checksum, using the actual approved database and server-side backup path:

```sql
BACKUP DATABASE [APPROVED_CENT_DATABASE]
TO DISK = N'APPROVED_PRIVATE_BACKUP_PATH'
WITH COPY_ONLY, CHECKSUM, COMPRESSION, STATS = 10;
RESTORE VERIFYONLY FROM DISK = N'APPROVED_PRIVATE_BACKUP_PATH' WITH CHECKSUM;
```

Use a unique destination; do not overwrite a backup. Hash the closed backup file with SHA-256 on the backup host. Rehearse restoration into a new isolated Cent review database, run `DBCC CHECKDB`, and compare migrations, content counts/receipts and user-data counts. Verify session/account, purchase/entitlement, note/anchor/revision, progress/bookmark and historical result preservation. A successful VERIFYONLY alone is not a restore rehearsal.

Keep backup bytes, personal records and receipts private. Record real results, not assumed success, in a receipt for the maintenance helper:

```json
{
  "database": "APPROVED_CENT_DATABASE",
  "centOnly": true,
  "backupFile": "ACTUAL_PRIVATE_BACKUP_PATH",
  "sha256": "ACTUAL_64_CHARACTER_SHA256",
  "verifyOnlyPassed": true,
  "restoreRehearsalPassed": true,
  "completedUtc": "ACTUAL_UTC_TIMESTAMP"
}
```

The receipt is an operator attestation backed by retained DBA evidence. The importer checks its fields and age (24 hours), not the remote backup bytes. Never fill `true` values before performing the checks. The local SQLite backup is not this SQL Server production backup.

## 4. Migration order

Build the Itatest maintenance helper and generate SQL without opening a database:

```powershell
dotnet run --project itatest/tools/Cent.Release/Cent.Release.csproj -- script PRIVATE_PATH/cent-migrations.sql
```

The generated idempotent script and model check were verified locally. Review/execute it with the DBA's approved SQL Server tooling against only the checked target. It uses `cent_migrations_history`, in this order:

1. `20261107101801_InitialCent`
2. `20261107130614_Curriculum`
3. `20261109184203_AddCentGoogleAuthentication`
4. `20261120134304_VersionedMockExams`
5. `20261122081723_VersionedCurriculum`
6. `20261122102343_SubjectCommerce`
7. `20261123135254_AddCentSmsAuthentication`
8. `20261124155704_ReaderPilotAnchors`
9. `20261124174931_ReaderProtectionBudgets`

For an existing target, idempotent guards skip recorded migrations. Do not use `EnsureCreated`, SQLite's preview upgrade, or shared `Flashcards.Infrastructure` migrations. Verify all nine IDs are present, `cent_notes.AnchorJson` is nullable with its bound, and budget table/index exist. SQL script generation passing does not prove SQL Server execution compatibility.

## 5. Reviewed import

Reconcile the compiler/package hashes with the release artifacts before building. The canonical overlay is private and embedded in Cent.Module; do not publish its JSON or ZIP sources. Inspect the target without writing:

```powershell
$env:CENT_RELEASE_CONNECTION = 'SECRET_FROM_APPROVED_STORE'
$env:CENT_RELEASE_DATABASE = 'APPROVED_CENT_DATABASE'
dotnet run --project itatest/tools/Cent.Release/Cent.Release.csproj -- inspect
```

Only after backup, migration and deployment approvals:

```powershell
dotnet run --project itatest/tools/Cent.Release/Cent.Release.csproj -- import PRIVATE_PATH/verified-backup-receipt.json --apply
```

This calls the existing transactional `CentCurriculumImporter.Import()`; it does not change document publication, offers, accounts or feature flags. The helper refuses pending migrations. Imports compare expected original/reviewed fields and take the existing transaction-owned SQL application lock. A conflict requires reviewing the private field evidence and editorial ownership; do not replace the fail-closed comparison with unconditional updates.

Check both base and reviewed receipts, 53 sources, 538 sections, 1,037 exercise records and 1,471 questions for this corpus (plus any separately approved local content). Replay once to verify idempotence and publication preservation. Compare original user rows/IDs, notes, anchor JSON, revisions, orders, entitlements, progress and attempt snapshots. New chemistry and logic documents must still be drafts. Preserve compatibility documents and ambiguous note mappings.

## 6. Compatible application deployment and publication

Keep delivery switches off. Deploy the compatible backend containing Cent.Module first, with additive schema and the same existing identity/payment integration. Smoke-test old routes before deploying the compatible frontend. Build the client with `npm.cmd ci`, `npm.cmd test`, `npm.cmd run lint`, `npm.cmd run build`; run Cent.Tests and Cent.Exam.Tests. Publish **only `itatest/dist`**, using the existing hosting process after separate approval. Never publish the repository root, `tools`, backend binaries/content, docs/evidence, source ZIPs, backups, `.preview-artifacts` or `.env.local`.

Obtain specialist approval for the exact content hashes. Author and verify the new immutable syllabus/content release through the established review process; the older subject-commerce release does not automatically approve the new hierarchy or supplement. Use the content administrator's protected preview, review every section, and explicitly publish approved documents using the existing publication endpoint/UI. HTML publication checks completeness/sanitization; PDF publication retains its page checks. Publication and academic approval are distinct decisions. Do not use fixture publication flags or direct database updates.

Only after the applicable academic release is approved may the authorized administrator confirm a subject offer for sale. Leave any unapproved offer/document closed. Preserve identity/payment/purchase workflows and existing entitlements.

## 7. Activation, smoke checks and monitoring

With explicit release approval, set `Cent__Reader__Enabled=true`, keep `Cent__ReaderPilot__Enabled=false`, and start with the approved comma-separated `Cent__Reader__Subjects` scope and `AllSubjects=false`. Activate all six only when approved. Restart/reload the Cent host using its existing operation procedure. Do not alter Lerona settings or infrastructure.

Smoke-test normal provider login, library/entitlements (including expiry), all approved subjects, lesson/page navigation, formulas/tables/diagrams/zoom, light/dark and mobile layouts, private notes/draft restoration/reattachment, progress/bookmarks, exercises/answer reveal, chapter reviews and mocks, Reading passages, submission/results and existing PDFs. Confirm a draft remains invisible to students; anonymous/unentitled and wrong-document asset requests are denied. Results must not reveal keys before submission. Check private/no-store responses, opaque watermarks and missing private files at public URLs. Test Chromium, Firefox, WebKit and actual supported devices/assistive technologies; emulation is separate evidence.

Monitor p50/p95/p99 section and asset latency, 401/403/404/429/503/500 counts, positive Retry-After, SQL lock waits/deadlocks, active/expired leases, timeouts, budget backlog, cleanup duration/deletions, audit events/bytes/day and database/data-log growth. Establish SQL Server thresholds from a representative staging load before approving capacity. Investigate repeated 429s from legitimate sessions and shared NATs before adjusting limits. Keep audit/log access restricted; do not log bearer tokens, source HTML or answer keys.

Cleanup runs every 15 minutes with a bounded batch, the same SQL application lock and a fresh state/lease check. Its expiry horizon is the maximum of long-window/lease/cooldown (at least 60 seconds) plus five minutes. Audit deletion is independent and opt-in; only eligible reader document/section delivery actions are removed. Administrative preview, note, payment and import audits are retained. Approve retention, export required trace evidence, and alert on failures/backlog. Never manually truncate active budget rows.

Authorized users can extract delivered content, take screenshots, run OCR or scrape slowly. Watermarks, limits and private asset delivery reduce misuse; they do not provide complete copy protection.

## 8. Rollback

First disable `Cent__Reader__Enabled` and `Cent__ReaderPilot__Enabled` and stop new subject sales where appropriate; retain content and user data. This is a delivery rollback. Keep additive anchor/budget schema and immutable assessment snapshots. Roll back the compatible frontend/backend binaries only after checking their schema compatibility; do not run destructive down-migrations.

Do not restore an old backup over new notes, purchases, attempts or progress. A backup restore is a separately approved recovery operation after quiescence, with reconciliation/export of all post-backup user data. Content reversal requires a reviewed reverse field patch against matching current hashes, retaining original and new identities/notes/publication choices; a base import cannot silently restore old answers. Rehearse recovery on the dedicated restore database before approving production.

Record the reason, flag changes, artifact hashes, backup/reconciliation evidence and post-rollback smoke results. Never apply this procedure to Lerona's database, migrations, configuration or deployment.
