# Itatest Phase 4 — content integration and reader refinement

25 November 2026. Implementation and local verification only. No production database, deployment, authentication or payment workflow was changed. General reader rollout remains disabled in checked-in configuration. **Production release is blocked by SQL Server verification and academic release approval.**

## Import strategy and package results

The [Phase 3 report](../phase-3/REPORT.md) was read before implementation. `scripts/compile-reviewed-content.py` reads every entry in all six ZIPs without extracting them into a web directory. It validates JSON, standalone SVG XML, paths, identifiers, keys, answer bounds, distinct options, answer-text agreement, curriculum links, exercise links, assessment membership and exact duplicate question stems/options. [Package evidence](package-validation.json) records every entry's size and SHA-256, package checksums, README, manifest, original-to-canonical mappings and record counts. Markdown/HTML alternate views, source snapshots, document exports and frontend examples are not additional records.

| Package | Applied strategy | Outcome |
|---|---|---|
| Mathematics minimal corrections v1 | Authoritative 49-record exact before/after patch | No questions, exercises, chapters or lessons added. Existing four-option practice retained. Question-specific explanations and documented textual corrections applied. Rich original HTML and all 121 SVG placements preserved; equal SVG bytes may share one protected asset. Historical source snapshots were not imported as replacements. |
| Physics publication v1 | Canonical six chapters and 68 teaching lessons | 220 existing question IDs retained and revised, 36 new practice and 25 separate mock questions. 97 linked exercise aliases retained; 30 independent exercises added. The 51 original figures remain inline in canonical lessons. Superseded sections retain compatibility identities. |
| Chemistry publication v3 | New ten-chapter, 50-lesson canonical hierarchy | All 81 question IDs found in the target corpus retained; 391 total questions, including 50 separate mock questions. The package's ten earlier-addition IDs absent from this checkout are created, rather than counted as preserved database rows. 66 linked exercise aliases retained; 150 independent exercises added. Eleven standalone figures are alternate representations of inline visuals. Old sections become relocation notices, never additional active lessons. |
| Biology publication v1 | Canonical five chapters and 41 full teaching lessons | All 371 existing practice question IDs retained and revised; 50 separate mock questions added. 356 linked exercises retained and 25 independent exercises added. Thirty original figures retained. Seven supplemental sections are incorporated using package mappings; archival records remain private. |
| Logic reviewed v1 | Authoritative 27-record targeted patch plus additive supplement | Original order and IDs retained. The quarantined exercise stays quarantined. Fifteen new mock questions and the complete supplementary lesson added. The mock schema provides broad logic/data areas, so these questions use the new combined supplement topic; no unsupported precise legacy skill assignment is asserted. |
| Reading reviewed v1 | Eight exact field patches plus passage-aware mock content | Original ten lessons, 33 questions and 33 linked exercises retained. Five existing passages canonicalized; repeated historical R1 snapshots are not new passages. Ten new passages and 50 distinct mock questions added. Five fixed mocks retain their two-passage/ten-question relationships. |

New independent open-response exercises are included in teaching HTML with collapsed self-check solutions. They are not automatically graded. Existing linked MCQ exercise rows remain aliases, not duplicate bank questions. Chapter reviews deliberately reference existing practice questions. The 42 assessment definitions comprise 21 chapter reviews and 21 mocks; mathematics adds no mock.

## Counts and identity reconciliation

These are physical imported-corpus record counts measured before adding disposable browser fixtures. Compatibility sections are included and are separately identified below.

| Subject | Sections before → after | Exercise records before → after | Unique questions before → after |
|---|---:|---:|---:|
| Mathematics | 89 → 89 | 204 → 204 | 201 → 201 |
| Physics | 99 → 99 | 97 → 127 | 220 → 281 |
| Chemistry | 26 → 76 | 66 → 216 | 81 → 391 |
| Biology | 85 → 85 | 356 → 381 | 371 → 421 |
| Logic | 178 → 179 | 76 → 76 | 79 → 94 |
| Reading | 10 → 10 | 33 → 33 | 33 → 83 |
| **Total** | **487 → 538** | **832 → 1,037** | **985 → 1,471** |

The final bank has 1,281 practice questions and 190 separate mock questions. Sources/documents increase from 51 to 53; chapters from 55 to 66; topics from 247 to 298. All original row IDs remain. The overlay updates 51 sources, 487 section HTML representations, 539 exercises and 706 questions, and creates two sources/documents, eleven chapters, 51 topics, 51 sections, 205 exercises and 486 questions. Unchanged original fields remain unchanged; rich-markup reconciliation does not imply a scientific rewrite of every section.

Of the retained records, 101 superseded sections are compatibility notices, not duplicate teaching content. Eleven chapters, 39 topics and seven sources are excluded from the active curriculum after the reviewed receipt exists. Thus the canonical curriculum has 55 active chapters and 259 active topics. Old documents remain addressable under their existing authorization, and visited archive documents remain in the owner's library. The two new documents enter as **drafts**. Only explicitly isolated preview fixtures publish them during testing.

The compiler rejects duplicate IDs/import keys/positions and exact duplicate stems with the same options. It preserves documented near-duplicate variants and excludes multiple members of a variant group from one selected assessment. No authored assessment currently violates these group constraints. Standalone figure copies and alternate lesson formats are not imported twice.

Changed section IDs are explicitly recorded in `sectionMappings` in the private catalog and package evidence. Existing document IDs, section IDs, ordinal positions, note IDs, note bodies, revisions, anchor JSON, progress and historical assessment snapshots are preserved. A one-to-many chemistry mapping is **not** an instruction to guess a new note anchor. Its old section becomes a notice listing related lessons; the existing quote/revision and page/Y fallback remain available for manual reattachment. Stable anchors are generated before display-only typography corrections. Historical mastery scopes keep their original denominators; the old syllabus revision is not silently expanded to include newly authored topics.

The existing reattachment interaction operates within the retained document/page. It does not silently move an old chemistry note into the new canonical document. Cross-document reconciliation of an ambiguous historical anchor requires an explicit owner/editor migration choice; until then the original private note remains accessible in its compatibility document. Of 210 mapping entries, 34 are one-to-many and 62 have no equivalent teaching section. Unknown replacement targets are rejected; there are none in these packages.

## Canonical pipeline and transaction behavior

`Backend/backend/Cent.Module/Content/reviewed-v4.json` is the private compiled canonical overlay and immutable reviewed question bank. The previous embedded corpus remains rollback provenance. The normal `CentCurriculumImporter.Import()` imports the base and overlay in one transaction, or applies the overlay transactionally to an existing base import. Repeated deployments therefore cannot silently restore base-era answers or lesson bodies.

Each changed field must match its expected original value or exact reviewed value. JSON option arrays compare semantically, avoiding false conflicts caused by JSON formatting. Missing targets, divergent local edits, duplicate keys or incomplete relationships fail closed and roll back. Failed imports clear tracked partial patches. SQL Server imports take a transaction-owned application lock; receipt checks occur inside the serializable transaction. New document publication choices are preserved on replay. Historical release tests explicitly use `includeReviewed:false`; this is not exposed as a deployment setting, and normal imports include reviewed content.

No existing user content database was overwritten. Disposable upgrade verification first creates the historical corpus, makes an online SQLite backup, checks `PRAGMA integrity_check`, hashes the backup, and then upgrades. Cent.Preview now performs the same verified backup before importing into an existing physical content database. Backup destinations disable connection pooling so the verification hash can be read after closing the backup connection. Backups and databases remain under ignored private preview artifacts.

## Reader presentation and preserved features

The approved Slate & Sage reader is reused. There is no reader redesign. Exact reviewed section HTML is sanitized directly; nested educational headings no longer cause a second global heading split. The rich legacy adapter assigns heading containers to the correct section, keeping the next section's badge/title out of the current section.

Display adapters add Persian/English boundary spacing, isolate English and mathematical runs, retain Western mathematical digits, separate numeric/letter heading markers, align custom list numbers with their text, keep formulas near their explanations, and contain wide tables within horizontal scrolling. Decorative educational emoji are removed with a bounded list that retains scientific arrows and operators. Obsolete blue/green/red/gold card instructions become functional educational labels. Author/editor/source-review/production blocks are excluded from student HTML; private originals and package provenance remain available.

Protected diagrams have a keyboard-accessible native dialog, focus restoration, Escape dismissal, 100–500% zoom controls, scroll/pan, and native mobile pinch zoom. The dialog reuses the already authorized object URL, retains the opaque trace, and does not create a public asset URL or another content-fetch bypass. Reattachment mode can still select an image anchor. Reader/dialog secondary buttons use the existing dark-mode tokens. Browser evidence waits for theme transitions to finish.

Notes and margin markers, account/document/page draft persistence, manual reattachment, bookmarks/progress, expandable solutions, responsive layouts and PDF canvas behavior remain. Reattachment appears for a selected saved note, disappears while choosing its replacement anchor, and is unavailable while saving. PDF implementation was not rewritten; existing compatibility tests remain part of the regression suite. Native-device PDF and assistive-technology acceptance are not established by these desktop browser tests.

## Security and assessment delivery

Section and asset routes retain entitlement and document/section ownership validation, private/no-store responses, account/IP database budgets, concurrency leases, burst/enumeration controls, opaque `IT-` audit watermarks, strict HTML/SVG allowlists and protected asset media checks. Imported HTML cannot bypass delivery through the PDF/page-image endpoint. Notes remain owner-scoped and revision checked.

Reviewed assessment metadata/start routes require authorization, an enabled subject and current subject access. Definitions expose no keys or question-ID lists. Issued attempts contain question/passage snapshots without answer indexes, grading explanations or correct-option text. Keys and explanations are returned only through the submitted-attempt result contract. Reading passages are snapshotted with their groups. Fixed mock durations and original raw +1/−0.25/0 practice scoring are retained; this is not official score normalization. Later bank edits do not rewrite issued attempts or previous results. Existing practice questions can also appear in chapter teaching/review; chapter reviews are not confidential high-stakes exams.

ZIPs, answer files, the canonical catalog, provenance, backups and screenshots are excluded from the frontend build. The postbuild guard rejects private educational files/directories. Vite also denies repository docs, backend content, database and archive paths. Hosting must publish **only `itatest/dist`**. Browser probes of private paths returned application HTML or absence, never ZIP/catalog bytes. Existing baseline evidence is reused; only new AFTER screenshots were captured in [after/](after/). These screenshots contain protected material and must remain private.

## Cleanup, retention and measured readiness

The Cent-only cleanup worker operates only when the general Cent reader is enabled. Every 15 minutes it considers at most 200 budget rows (configurable, maximum 1,000). Its expiry horizon covers the configured long window, lease and cooldown plus five minutes. It acquires the same SQL application lock and rechecks requests, cooldown, timestamp and live leases before deletion. It cannot reset a freshly used partition based on a stale candidate.

`Cent:Reader:Protection:CleanupEnabled=false` disables the worker. `CleanupBatchSize` controls its bound. Audit deletion is separate and opt-in: `Cent:Reader:AuditRetentionDays` accepts 30–3,650 days; absent/invalid settings retain audits. An operational example is 90 days, subject to the project's approved retention policy. Only reader-open/section-delivery events are eligible; note, payment, administrator and import audits are excluded. Export needed trace evidence before its approved expiry. Monitor cleanup backlog and audit growth before choosing production throughput settings.

The [SQLite benchmark](verification/sqlite-performance.json) records a verified pre-upgrade backup, historical/reviewed import time, idempotent replay, storage growth, 50 asset-budget acquire/release cycles and bounded expiry cleanup. Those results are local development measurements under concurrent test load, not SQL Server capacity estimates. The [HTTP probe](verification/http-security-results.json) records 18 simultaneous section requests, successful deliveries and positive Retry-After rejections, with no 500 responses.

Measured SQLite results: 18.1 s historical import, 12.1 s reviewed upgrade, 995 ms idempotent repeat; 12,836,864 → 13,062,144 database bytes, a 225,280-byte (220 KiB) increase. Fifty acquire/release cycles averaged 245 ms with a 292 ms p95 in the benchmark context. Two budget rows contained 9,334 JSON bytes; advancing the clock removed both expired rows and left zero. These guard timings include the benchmark's existing tracked import context and concurrent local test load; they are not production request latency targets.

SQL Server 2022 LocalDB is installed, but both its existing instance and a new `ItatestPhase4` instance fail registry access. The isolated SQL Server verifier generated the complete idempotent nine-migration Cent SQL, checked for pending model changes, then failed to connect. [Failure evidence](verification/sqlserver-results.json) and [generated SQL](verification/cent-migrations.sql) are retained. **No SQL Server migration execution, replica contention, SQL Server performance or SQL Server growth verification is claimed.** The verifier accepts no production connection and uses a newly generated Itatest-only local database name.

Dependency checks were retried. npm reported 13 moderate development-tool advisories, zero high/critical, with no available fixes reported for the direct affected tools. NuGet auditing failed TLS authentication against nuget.org; restore/build succeeded from available packages with NU1900 warnings. [npm evidence](verification/npm-audit.json) and [NuGet failure](verification/nuget-audit.log) remain release evidence, not a clean vulnerability certification.

## Verification evidence

Machine-readable final outcomes are in [test-results.json](verification/test-results.json). Full and corrective runs are identified separately; overlapping runs must not be summed.

- Frontend: 219 tests across 22 files; TypeScript production build and ESLint.
- Cent primary regression: full suite plus final corrective reviewed-content tests, including upgrade from historical data, strict conflict rollback, repeat import, all-section/all-asset sanitization, 121 mathematics diagram placements, preservation of purchases/notes/progress/history, bounded cleanup, passage snapshots and pre-submission key secrecy.
- Cent exam/commerce compatibility: 90 tests passed, including all nine Cent-only migrations generated offline. Historical release fixtures retain their original package and do not fabricate approval for the new publication content.
- Six-subject Chromium: desktop 1440×1000, mobile 390×844, light/dark, protected image decoding and counts, zoom dialogs, notes create/save/reload/restore/reattach with the same ID/text and a revised anchor, no page errors and no sampled horizontal overflow.
- PDF-page compatibility: a new synthetic rendered-page fixture exercised the protected WebP-to-canvas path, draft persistence, saved-note restore, anonymous denial, private/no-store and unavailable original-PDF download. [Evidence](verification/pdf-page-results.json) and [AFTER screenshot](after/pdf-page-after.png). This verifies the existing PDF-page delivery contract; native PDF parsing/device acceptance is not claimed.
- HTTP security: concurrent database-backed requests, throttling, private/no-store, anonymous/unauthorized section and asset denial, opaque traces, private build paths and reading assessment secrecy.
- Initial failures found stale count expectations, incomplete test commerce fixtures, a secrecy assertion matching the ordinary word “explanation” inside a passage, duplicate image-byte accounting, and two presentation defects. These were corrected; fixture fixes did not relax application security or commerce checks.

## Deployment and rollback instructions

1. Keep both reader switches disabled until approval: `Cent:Reader:Enabled` and the separate `Cent:ReaderPilot:Enabled`. Do not copy preview fixtures, tokens, ZIPs or evidence to hosting.
2. Reproduce the compiler from the six approved archives; review package checksums and all reported conflicts. Build Cent artifacts and the compatible Itatest client. Run the isolated verifier against a working disposable SQL Server instance before considering production migration approval.
3. After explicit deployment approval, use an independently verified Cent-only database backup and a maintenance window. Review the generated migration SQL; never apply it to the Lerona context/database. Import through the normal transactional importer. A conflict requires reconciliation against the private before/after evidence, not an unconditional update.
4. Complete specialist review and create an approved content/review release using the existing administrative process. The current subject-commerce release does not automatically certify the new chemistry hierarchy or logic supplement. Draft document publication is an explicit administrator action; HTML publication validates section completeness and sanitization, while PDF publication keeps its page checks.
5. Deploy only the client `dist` directory. Enable an approved small subject/cohort scope, configure cleanup/retention for the separate Cent database, and monitor authorization failures, throttles, cleanup backlog, response latency and database growth before widening rollout.

Rollback the reader rollout by disabling the two reader switches and retaining all content, notes, anchors, snapshots, entitlements and additive schema. This is a presentation/delivery rollback, not a restoration of obsolete teaching. Do not drop the anchor/budget tables or replace the live database with an old backup after users create new work. A content rollback needs an approved, rehearsed reverse field patch against matching current hashes, with new document/annotation identities retained; private before values and verified backups supply that evidence. Local test databases can simply be retained privately or discarded after review; no original local database depends on them.

Reproduction: run the compiler from `itatest`, frontend `test`, `lint`, `build`, Cent.Tests and Cent.Exam.Tests from `Backend/backend`. Build Cent.Preview with `--artifacts-path D:/Lerona/itatest/.preview-artifacts/reader-phase4-final-build`. Use a **new** database under that output's `App_Data/isolated`, loopback 5124, and explicit `--admin-fixtures true --import-curriculum true --reviewed-reader-fixtures true --prepare-subject-offers true --sandbox-subject-offers true --Cent:Reader:Enabled true --Cent:Reader:AllSubjects true`. Preview the built client on loopback 5194 with `CENT_BACKEND_URL=http://127.0.0.1:5124`. Run `check-reader-phase4.mjs` before `check-reader-phase4-security.mjs`; the latter intentionally triggers cooldowns. `Cent.ReaderVerification --sqlite <verification-directory>` performs the disposable backup/upgrade benchmark; without `--sqlite` it attempts only the named disposable LocalDB instance.

## Remaining release blockers

1. A working isolated production-compatible SQL Server is required to execute the migration chain and verify concurrent locking, deadlocks, throughput, cleanup and growth. LocalDB registry access prevents completion here.
2. Independent specialist approval is still required for the supplied content, distractors, explanations, ambiguities, difficulty estimates and new syllabus/review release. Structural validation does not prove scientific correctness or CEFR calibration. New subject-only access must not be widened by bypassing review checks.
3. NuGet vulnerability auditing must succeed online; the npm development-tool advisories require resolution or an explicitly accepted mitigation before release.
4. Native mobile/Safari/Firefox, accessibility and production-load acceptance remain outside the representative Chromium checks. Diagram zoom improves mobile label access but does not replace specialist diagram/accessibility review.

No production deployment or production database modification was performed.
