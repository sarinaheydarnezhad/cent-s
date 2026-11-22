# Itatest refinement program

Baseline date: 2026-11-18. Phase 0 is conditionally accepted; the owner explicitly authorized Phase 1 on frontend main. Implementation is delivered for visual review; later phases remain unauthorized. All reporting, documentation, explanations, plans and approval questions are in English. The interface remains conversational, warm, professional Persian.

## Purpose

Refine the existing React frontend into a calm, consistent, accessible exam preparation companion under **Itatest / ایتاتست**, preserving working architecture and product behavior. Current exam: CEnT-S. IMAT, SAT and broader personalization are future direction unless actual service availability is separately established.

Brand essence: **پیشرفت با آرامش و آگاهی**. Promise: help learners identify their next meaningful step. Tagline: **یاد بگیر، با روش خودت. / Learn Your Way.** Position: **همراه شخصی آمادگی آزمون**. Affordable, clear, supportive, organized, competent and nonjudgmental.

Personality: competence 45%, sincerity 40%, excitement 15%. Archetypes: Sage 60%, Caregiver 40%. Visual direction: Calm Intelligence; Calm Academic 50%, Intelligent Clarity 35%, Friendly Modern 15%. These are design direction, not validated audience measurements.

## Sources and precedence

1. Latest explicit owner decisions in the program request.
2. [Complete V1 brand guidelines](../brand/Itatest-Complete-Brand-Design-Guidelines-V1.pdf), all 26 physical pages extracted and rendered.
3. [Logo](../brand/logo-reference.png), [palette](../brand/palette-reference.png), [UI concept](../brand/ui-reference.png).
4. Repository architecture, README, CLOUDFLARE.md, browser test README and source.
5. Proposed refinements, separately labeled.

Approved: both themes; Light/Dark/System; Slate & Sage; selected ascending geometric mark; flat colors without gradients; conversational Persian; minimal, calm professional design; existing behavior and routes retained. Five core colors: `#4D687A`, `#A5B5A1`, `#29343C`, `#E0E4E6`, `#F5F7F7`. Supporting and dark colors remain validation candidates. No white normal text on sage.

## Scope and protections

Scope: public presentation, shared UI, accessible navigation and feedback, dual themes, student/admin pages, assessment presentation, protected reader controls, commerce presentation and truthful Persian writing.

Protected: backend and Lerona infrastructure; schemas/migrations; API contracts and environment identifiers; OAuth/PKCE, sessions, role checks; assessment state, timers, answers, scoring and recommendations; payments, orders and entitlements; protected document delivery; note persistence; user data; existing URLs and base paths; deployment and production configuration. Any necessary change to these requires a separate concrete proposal and explicit approval.

No production writes, real payments, deployment, push, automatic commits, secret files, mock production data, dependency upgrades, broad formatting or functional source edits in Phase 0. Initial working tree had only `?? docs/` containing supplied brand assets; all preserved.

## Success criteria

All discovered routes and important states reviewed; reusable semantic design system; coherent dual themes and local preference persistence without startup flash; conversational accurate writing; responsive/mobile access; meaningful WCAG 2.2 AA evaluation without unsupported compliance claims; passing relevant checks; documented baseline vs new failures; visual and functional owner approval at each gate. No later phase starts automatically.

Current evidence and gaps: [PROGRAM_STATUS](PROGRAM_STATUS.md), [AUDIT_COVERAGE](AUDIT_COVERAGE.md), [REGRESSION_REPORT](REGRESSION_REPORT.md).

## Permanent runtime and shared-repository constraints — 2026-11-18

Frontend repository: `D:\app\itatest`. Shared backend repository: `D:\Lerona\Backend`. Itatest local preview project: `D:\Lerona\Backend\backend\Cent.Preview\Cent.Preview.csproj`. API: `http://127.0.0.1:5108`; frontend: `http://localhost:5173/cent-s`.

Permanent constraint: the backend repository is read-only for this refinement program. Itatest-specific Cent.Module/Cent.Preview, Lerona-specific modules, and shared infrastructure are distinct boundaries. Inspect backend code only as needed for existing frontend behavior. Use only Cent.Preview with verified isolated local data for safe API tests. No production database connections, backend source/configuration/schema/authentication/API-contract edits, Lerona/shared-infrastructure edits, database upgrades or migrations, unrelated services, real payments, destructive operations, deployments, commits, or pushes. Any necessary backend change requires stopping and presenting impact analysis for both Itatest and Lerona before approval. Local fixture records created through the already-running preview's supported APIs are the explicitly authorized exception for runtime data; no direct database edits or cleanup/deletions were performed.

All reports, progress updates, technical explanations, implementation plans, documentation and approval questions are permanently in English, superseding the former Persian reporting rule. The user-facing interface remains conversational, warm, professional Persian.

The user starts the backend separately. This audit used the already-running preview and ordinary API fixtures; the database was isolated before writes. Runtime status and remaining limits: [updated Phase 0 report](PHASE_0_REPORT.md). Phase 1 remains unstarted.


## Phase 1 implementation record

Work is authorized directly on frontend `main`. No redesign branch, commit, push, deployment, production access, database migration or shared-backend source/configuration change. Preserve GIS commits frontend `c8df574` / backend `87525a7`. Backend source is read-only; compiled output is confined to ignored frontend `.preview-artifacts/`. Tests use isolated SQLite and development mock payments only. Local fixture data is not production data.

Phase 0 is conditionally accepted, including its known defects and safe exclusions. Phase 1 covers brand/token/theme/type foundations and minimal shell integration; no page restructure or Phase 2 work. All program reporting is English; the product UI remains conversational Persian. Confirmed backend path: D:\Lerona\Backend. Preview project: backend\Cent.Preview\Cent.Preview.csproj, port 5108. Current report: [Phase 1](PHASE_1_REPORT.md).
