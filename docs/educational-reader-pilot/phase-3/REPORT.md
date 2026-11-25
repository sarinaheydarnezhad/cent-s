# Educational reader — six-subject continuation

24 November 2026. The shared reader supports mathematics, physics, chemistry, biology, logic and reading comprehension. General rollout and the earlier single-lesson pilot remain **disabled by default**. This is a local implementation and verification checkpoint, not production enablement.

## Content and presentation

The implementation uses the existing 51 bundled HTML sources and imported section identities. It does not replace a package, rewrite scientific material or import new educational content. Server allowlists rebuild semantic HTML without original CSS, links or executable elements. Fractions, superscripts/subscripts, tables, solutions and expandable answers are retained. Presentation uses existing Slate & Sage tokens and local fonts.

This continuation completes the bounded static-source tokenizer already started in the workspace and removes unfinished AngleSharp references. No dependency was added. The tokenizer is scoped to this corpus, not general browser HTML. Content checks exercise every bundled source and imported section key, including both legacy ordinal keys and the named IDs used by the reviewed 2026 additions. Known unescaped inequality tokens are recovered without changing their visible mathematical characters.

SVG diagrams become protected image assets. Coordinates, shapes, text, colors and safe local marker references are retained; source styles and external references are excluded. Standalone SVG XML is rebuilt from allowlists. Unsafe diagram constructs fail explicitly. Local images resolve only to bounded embedded resources with media signatures checked. The frontend accepts both cases of server SHA-256 identifiers. Assets load near the viewport, with at most three concurrent requests; errors have a retry action and object URLs are disposed on section changes. A browser assertion compares delivered and rendered diagram counts to prevent silent omission.

Shared styles provide responsive tables, semantic example/solution layouts, isolated English/math direction and Western digits inside mathematical runs. Diagram labels scale with the original geometry and may need browser magnification on narrow screens. This does not establish full diagram accessibility or native-device acceptance.

## Notes and compatibility

Phase-one/two block IDs are generated before display adapters. Additional semantic anchors support images, tables and other structures. Existing IDs, bodies, ownership, optimistic revisions, anchor JSON and page/Y fallbacks are retained.

To reattach a note, select it, choose “اتصال دوباره به متن”, select the new block and save. The existing revision-checked endpoint preserves the note ID and text. The draft anchor controls the highlight during reattachment. Structured account/document/page drafts retain unsaved anchor and editing revision; approximate-location and changed-revision behavior remain available.

Updated clients consume either legacy responses or protected section delivery. Deploy the compatible client before enabling granular delivery; older clients cannot consume its outline contract. Disabling general rollout retains the old delivery behavior, while the separate phase-two pilot switch can still select its original chapter.

## Protected delivery

Enabled subjects receive metadata-only outlines and one section per authenticated body request. Section and asset routes reuse document access checks and validate section ownership. Imported HTML cannot use the page-image endpoint as a body-delivery bypass. Existing private/no-store policies remain. Assets receive restrictive content security policies and no public URL.

Section delivery and document opens use opaque `IT-` audit identifiers linked privately to account/content. Imprints contain no email or account ID; they identify a delivery, not who later distributed a copy. Existing PDF pages retain the canvas reader. Downloaded image pixels do not receive a burned-in watermark in this continuation.

`CentReaderProtection` persists account/IP windows, cooldowns and expiring concurrency leases in the **Cent database**. SQL Server uses serializable transactions and transaction-owned application locks in sorted partition order. Separate body/asset budgets avoid consuming section-navigation limits for diagrams. Body limits cover bursts, distinct enumeration, long-window requests and slow enumeration. Entitlements are checked first. Leases cover serialization and release on completion; expiration recovers abandoned leases. Logs contain hashes/content IDs, not session credentials or educational/note bodies.

The registration preserves a host-supplied `TimeProvider`; an existing authentication regression verified this requirement. Authentication, purchases and global admission rules were not redesigned.

Settings under `Cent:Reader:Protection`:

| Setting | Default |
|---|---:|
| AccountPerMinute / IpPerMinute | 60 / 600 |
| AssetAccountPerMinute / AssetIpPerMinute | 360 / 2400 |
| AccountConcurrent / IpConcurrent | 8 / 64 |
| BurstPer10Seconds / UniquePer10Seconds | 12 / 12 |
| LongWindowSeconds | 1800 |
| AccountLongRequests / IpLongRequests | 600 / 12000 |
| AssetAccountLongRequests / AssetIpLongRequests | 6000 / 40000 |
| UniquePerLongWindow | 120 |
| CooldownSeconds / LeaseSeconds | 10 / 120 |

Integers are clamped to 1–100000; missing/unparsable settings use defaults. Rejections return 429 and Retry-After. Protected GETs honor the full delay, including uppercase asset hashes; excessive delays go to retry UI. Earlier per-process pilot controls remain separate.

These controls do not prevent authorized extraction, screenshots, OCR, patient scraping or account sharing. Real SQL Server replica contention, deadlocks, throughput, NAT tuning and deployment load require further verification. Expired requests/leases are pruned when a partition is used; idle rows currently remain. Set operational budget-row cleanup and audit-retention policies before production enablement. No unapproved data cleanup or infrastructure service was introduced.

## Configuration, migration and rollback

General switches are independent of the earlier pilot:

```text
Cent__Reader__Enabled=true
Cent__Reader__Subjects=math,physics
```

`Cent__Reader__AllSubjects=true` selects all six known subjects only when Enabled is true. No checked-in deployment configuration enables them.

Migration `20261124174931_ReaderProtectionBudgets` adds only the budget table and timestamp index, after the earlier nullable note-anchor migration. [Generated SQL](verification/reader-protection.sql) is available for review. The snapshot has no pending model changes. No migration was applied to a shared or production database. Fresh SQLite previews use EnsureCreated and do not certify executing the SQL Server migration.

Rollback: disable `Cent:Reader:Enabled`; also disable `Cent:ReaderPilot:Enabled` if the old pilot should stop. Preserve all note/anchor and audit data. The budget table can remain. Review migration execution and SQL Server behavior before enabling production.

## Verification

| Check | Result |
|---|---|
| Frontend unit suite | **219/219 passed**, 22 files |
| TypeScript, production build, ESLint | Passed |
| Full Cent regression suite | **158/158 passed**, zero failed/skipped, after host-clock correction |
| Final content checks | **7/7 passed** after subsequent named-section fix; all 51 sources and every imported section key |
| Shared protection tests | Included in full suite: persisted minute/long windows; bursts/enumeration; concurrency across contexts; idempotent release; cooldown/recovery; slow enumeration; normal navigation; separate asset budgets |
| Isolated preview build | Passed, zero warnings/errors |
| Migration checks | SQL generated; no pending model changes; not applied to SQL Server |
| Chromium browser | Six subjects passed; desktop 1440×1000/mobile 390×844, light/dark; no page errors |
| Browser delivery/assets | Empty outline bodies, single-section delivery, no-store, anonymous 401/unauthorized 403, diagram counts and visible-image decoding |
| Browser annotations | Create/save/reload/restore; reattach preserves ID/text and increments revision; no mobile horizontal overflow in sampled sections |
| Both repository diff checks | Passed |

The full-suite TRX predates the final named-ID alias addition; the seven-test final content run covers that addition. Do not sum these overlapping counts. Initial tests caught the host-clock regression and actual reading-section/diagram-hash defects. Those defects were fixed. Initial harness setup also needed visible targets outside collapsed answers and reuse of existing disposable grants.

Evidence: [full suite](verification/reader-phase3.trx), [final content checks](verification/reader-content-final.trx), [browser results](after/results.json), and desktop/mobile/dark screenshots in [after/](after/). Screenshots contain protected educational content and must remain private review material. Browser coverage is representative, not exhaustive visual certification. Safari/Firefox, screen readers, native mobile keyboards, SQL Server replica behavior and production capacity remain unverified. No fresh online vulnerability scan was established; cached-package restore used NuGetAudit=false.

## Reproduction

Run frontend tests/build/lint from `itatest`, and Cent tests from sibling `Backend`. Build Cent.Preview under `itatest/.preview-artifacts/reader-phase3`. Start its DLL on loopback 5120 with the general switches, a **new** database under its output's `App_Data/isolated`, and `--admin-fixtures true --import-curriculum true --prepare-subject-offers true --sandbox-subject-offers true`. Start Vite on loopback 5190 with `CENT_BACKEND_URL=http://127.0.0.1:5120`. Run `node tests/browser/check-educational-reader.mjs` from `itatest`.

The harness reads only that isolated fixture file and sends credentials only to explicit loopback hosts. Fake development purchases and temporary notes exist solely in the disposable database. No real purchase, shared database, production migration, deployment, SMS or external message is part of this checkpoint.
