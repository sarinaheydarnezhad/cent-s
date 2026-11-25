# Educational reader pilot — Phase 2

24 November 2026. Scope: `math/chapter2.html#section-02` only. The pilot remains **disabled by default**. No rollout, revised-package import, scientific edits, authentication/payment changes, Lerona changes, or production/shared-database migrations were performed.

## Presentation

Refined the existing Slate & Sage reader using its theme tokens and local Vazirmatn fonts. Reduced section/formula padding, narrowed the prose measure, aligned worked-solution formulas in a compact desktop column, and used stacked steps on mobile. Final answers have a restrained Sage treatment. Definitions, exam tips, common mistakes and exercises retain their original structure and wording. The original three examples and three exercises, including every expandable solution, are retained.

Every existing `.ltr` mathematical run is direction-isolated, including operators, negative signs, parentheses and nested fractions. Only digits **inside mathematical runs** are normalized to Western digits; Persian prose remains unchanged. Textbook zoom changes font size and reflows the pilot rather than widening the page. Long formulas can scroll inside their container. The mobile header/toolbar fit two compact rows with accessible controls. Light/dark colors use existing semantic tokens.

## Annotations

- A reserved right margin holds 44px numbered controls; they do not cover lesson text, formulas or illustrations. Nearby anchors share one numbered control with a `+count`; the notes panel lists every note. Selecting a member aligns that control with its exact anchor. Separate controls never overlap. Collapsing an answer temporarily attaches its control to the answer summary; selecting it opens the answer again.
- Selecting a marker or note highlights its content block. Mobile uses a dismissible notes sheet and scrolls the anchor into the visible area above it. Returning to reading preserves position.
- Phase-one block IDs are generated **before** display digit normalization and formula layout changes. Original text quotes, note IDs, normalized coordinates, ownership and optimistic revisions are preserved. Font loading, font-size changes, resize, zoom, and answer toggles recalculate geometry.
- Version-two local drafts contain text, anchor JSON/Y, the new-note ID or edited-note snapshot/revision, under the existing account/document/page key, only for the pilot. Other lessons retain plain-text draft writes. Reopening restores the draft and its highlight. Legacy plain-text drafts still load. Server revision checks resolve conflicts; a restored draft cannot silently overwrite a newer note. Drafts remain device-local and accessible to same-origin scripts.
- New HTML anchors include a server content revision (SHA-256-derived identifier). Older anchors remain valid. Resolution tries the existing block ID, then the original text quote, then legacy normalized page Y. Changed revisions and approximate positions have explicit status messages. No automatic remapping writes to existing notes. Large content edits still require human reconciliation; revision identifiers do not guarantee semantic matching.

## Delivery and security audit

The previous authenticated chapter endpoint exposed every section body at once. Adding a limiter to a separate route would have left that bypass intact. With the flag enabled, **only the chapter containing the exact pilot key** uses this delivery contract:

- `GET /documents/{id}/source-sections` returns outlines/IDs, `delivery: "section-v1"`, and the exact pilot indicator. All `text` values are empty; no HTML bodies are returned.
- `GET /documents/{id}/source-sections/{sectionId}` authorizes the document and validates the section belongs to it, then returns **one** section. Only the selected lesson receives original protected HTML; its text field is empty. Neighbours receive their existing plain-text presentation, without redesigned HTML.
- Every protected request reuses `CentAccess.RequireDocument`, including active/non-revoked entitlement dates and reviewed subject-release checks. The old bulk route, document metadata, public curriculum and image route were checked as alternate paths. Outlines and document metadata contain no bodies. The imported HTML chapter has no downloadable page images; the page route returns 404. Other chapters retain their original delivery and reader.
- Existing `private, no-store, max-age=0`, authorization, nosniff and no-referrer policies remain. HTML is rebuilt with the existing strict tag/class allowlist; no styles, URLs, event handlers, images or executable elements are copied. A browser injection probe verified removal. No protected lesson body was found in public assets or the production frontend build.

Deploy the compatible frontend **before enabling the flag**. The old response remains an array and the disabled contract is unchanged, but an already-open phase-one frontend cannot consume `section-v1` and must reload to the updated frontend. Returning chapter bodies to those clients would reopen the extraction path. Flag rollback restores the legacy response; the updated frontend also handles that response. There is no public or client-controlled compatibility bypass.

### Scoped anti-scraping controls

`Cent:ReaderPilot:Enabled=true` opts in; environment equivalent: `Cent__ReaderPilot__Enabled=true`. Protection settings are under `Cent:ReaderPilot:Protection`:

| Setting | Default |
|---|---:|
| `AccountPerMinute` | 60 |
| `IpPerMinute` | 240 |
| `AccountConcurrent` | 2 |
| `IpConcurrent` | 8 |
| `BurstPer10Seconds` | 12 |
| `UniquePer10Seconds` | 12 |
| `CooldownSeconds` | 10 |

Counters use rolling windows. Fast repeated delivery and distinct-section enumeration (including invalid section IDs) trigger temporary throttling. Account and IP limits apply independently. Concurrency leases cover content lookup, private trace persistence and response serialization and release on completion/failure. Settings are positive integers, clamped to 1–10,000; omitted/invalid values use defaults. No permanent bans or account/purchase mutations occur.

Rejections return JSON `pilot_throttled`, HTTP 429 and `Retry-After`. A minute-rate rejection waits until the oldest counted request expires, or the configured cooldown if longer. The pilot section client retries GET twice after the full returned delay when it is at most 120 seconds. Longer configured delays go directly to the retry state with Retry-After metadata; they never trigger an early automatic retry. Unrelated API retry timing is unchanged. Structured warning logs include reason, internal account ID, hashed IP, section ID and retry interval; no emails, tokens, note bodies or lesson bodies. Successful delivery creates a private audit event.

These are **per-process**, pilot-chapter controls with bounded idle counter retention and a partition-capacity fail-safe. They are not a distributed scraper/DDoS service. This matches the deployment limitation described in [Microsoft's rate-limiting guidance](https://learn.microsoft.com/en-us/aspnet/core/performance/rate-limit?view=aspnetcore-10.0). Existing global admission limits remain unchanged. Remote IP comes from the existing connection/trusted-proxy setup; do not trust arbitrary forwarded headers. Shared NATs and multiple server instances require measured tuning before enablement. No shared infrastructure was changed.

### Traceable watermark

A server-generated random audit-event ID is delivered as `IT-<opaque identifier>`. The existing private `cent_audit_events` record links it to the authenticated account and section. No email, account ID or purchase details appear in the pilot watermark. It appears in the article imprint and remains visible in the reader header while scrolling. Tracing uses restricted server-side audit access; there is no public lookup endpoint. Retain and protect those records for the required traceability period. An ID identifies a delivery, not proof of who later distributed it.

HTML imprints can be removed. Authorized users can still extract delivered DOM/network bytes, pace scraping below thresholds, screenshot or use OCR. Neither right-click blocking nor concealment is treated as security. No-store cannot revoke previously copied content.

Server-side image watermarking was evaluated but not introduced. Burning the trace into WebP pixels would cover network image extraction, while adding per-delivery decoding/encoding CPU, latency and temporary memory (roughly width × height × 4 bytes before encoder buffers), plus per-user cache/storage costs. Shared unwatermarked caches must stay private; personalized responses cannot use public/shared caches. Cropping, retouching, screenshots and OCR remain possible, and image text accessibility remains poor. Benchmark real page sizes and a reviewed image library before a separate scoped implementation. No infrastructure pricing or capacity claims were assumed.

## Verification

All content/browser checks use the original embedded lesson and **new isolated local SQLite databases**. Test-only purchases/fixture accounts exist solely in those disposable databases. No real purchase records changed.

| Check | Result |
|---|---|
| Frontend unit suite | 22 files / 218 tests passed |
| TypeScript + production build | Passed |
| ESLint | Passed |
| Backend full suite | 143/143 passed; zero failed/skipped (7m16s) |
| Pilot protection tests | 13/13 focused backend checks passed; account/IP minute limits, burst, enumeration, account/IP concurrency and lease release; cooldown/recovery; 100 simulated normal reads 15 seconds apart |
| Protected HTTP integration | Default-off compatibility; exact original fragment; single-section ownership; no bulk body; private audit mapping; no-store; 401/403; expired entitlement rejected before throttle; 404 for missing sections/images; 429 + Retry-After |
| Actual-content browser harness | Original formulas/3 examples/3 exercises; RTL/LTR and Western math digits; desktop/mobile/light/dark; margin clearance and marker collision geometry; draft reload and ID preservation; legacy/changed/unresolved anchors; font/zoom/resize/answer toggles; reopening; edit/delete/revision conflicts; cross-user note read/edit/delete denial; neighbouring legacy reader; sanitizer probe; no page errors |
| Live bulk retrieval | Default burst detector returned 429 / `pilot_throttled`, Retry-After **10 seconds**; next authorized request succeeded after the interval |
| NuGet vulnerability retry | NU1900: nuget.org service index remains unreachable; advisory status **unverified** |

The limiter tests use low configured thresholds and a controlled clock for deterministic limits/recovery. The browser test exercises the real default burst detector with sequential requests, avoiding confusion with pre-existing global admission limits. These are functional checks, not a production load/capacity benchmark. Chromium desktop and mobile viewports were tested; native Safari/Firefox, screen readers and real-device keyboard behavior remain follow-up checks.

## Evidence and reproduction

Reused [phase-one baseline screenshots](../after/); no redundant BEFORE screenshots were captured. New private AFTER evidence: [desktop](after/desktop.png), [formulas / worked solutions](after/formulas.png), [mobile](after/mobile.png), [dark mode](after/dark.png), [exercises](after/exercises.png), [annotation creation](after/annotations.png), [restoration](after/annotation-restored.png), [mobile annotations](after/annotations-mobile.png). [Machine-readable results](after/results.json). These artifacts contain paid lesson content and must remain private review material.

Harness: `tests/browser/check-reader-pilot-phase2.mjs`, local API 5119 and Vite 5189. Build `Cent.Preview` using `--artifacts-path D:/Lerona/itatest/.preview-artifacts/reader-pilot-phase2`. Start the built DLL with the pilot flag, a **new** `--isolated-database` beneath that output's `App_Data/isolated`, `--admin-fixtures true --import-curriculum true --prepare-subject-offers true --sandbox-subject-offers true`. This seeds the existing bundled corpus only in the disposable database. Start Vite with `CENT_BACKEND_URL=http://127.0.0.1:5119`, port 5189, then run the harness from the frontend root. Its fixture path is pinned to that isolated output and credentials never leave local hosts. Initial fixture-setup/test failures were corrected before final verification.

## Migration and rollback

Phase 2 adds **no migration**. It reuses phase one's nullable `cent_notes.AnchorJson` column and existing audit storage. No shared/production migration was applied. Keep the phase-one column and all note/anchor data on rollback; dropping it discards metadata. Remove/set `Cent:ReaderPilot:Enabled=false` to restore the old reader and chapter delivery. Existing metadata/drafts remain readable by the updated frontend. Keep private trace audit records if historical attribution is required. Rolling back to the older phase-one frontend also requires disabling the flag; its plain-text draft format cannot read new structured draft records.

Stop at this pilot. Further lesson rollout, global hardening, server-side image watermarking, production enablement and revised educational imports require separate approval.
