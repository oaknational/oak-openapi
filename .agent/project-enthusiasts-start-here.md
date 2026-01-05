# Project Enthusiasts Start Here

Purpose
- Provide a narrative entry point for project managers and delivery leads who need context, framing, and a clear navigation map across a large documentation set.
- Focus on how the pieces fit together, what matters now (v0 stabilisation), and where to look next.

Audience
- Project managers, product leads, delivery managers, and stakeholders who need to understand the current state and the improvement landscape without starting from code.

## A quick orientation

This repo serves the upstream public curriculum API (v0, public alpha moving toward public beta). The API is schema-first: Zod schemas define the contract, OpenAPI is generated from those schemas, and tooling (SDKs, docs, MCP) is downstream of that contract. External feedback in this repo comes from a downstream SDK and tool ecosystem.

The core framing is intentionally simple:
- **V0** work fixes correctness and trust issues (behaviour, data integrity, and contractual accuracy).
- **V1** work is deeper refactor and modernisation once the v0 contract is reliable.

If you take only one principle from this doc: **the API contract flows from Zod schemas and OpenAPI output, not the other way round**. Treat generated artefacts as outputs and update the source schema when behaviour changes.

## Who are we serving?

When prioritising, return to users and outcomes:
- **Teachers and curriculum leaders**: need reliable content discovery, stable links, and accurate metadata.
- **API consumers and SDK/MCP engineers**: need strict, consistent schemas, predictable error handling, and discoverable endpoint intent.
- **AI tool builders**: need richer metadata and structural knowledge to choose the right tools and combine endpoints safely.

Ask early: *what impact are we trying to create for which users?* It keeps the backlog coherent when the list is long.

## What to read first (narrative path)

1. **Big picture and intent**
   - `docs/README.md`
   - `docs/engineering/v0-v1-improvements.md`
   - `docs/engineering/gap-analysis.md`
2. **Current system map**
   - `.agent/summary/overview/overview.md`
   - `.agent/summary/overview/runtime-architecture.md`
   - `.agent/summary/overview/api-handlers.md`
3. **Deep dives if you need evidence or root cause**
   - `.agent/summary/deep-dives/deep-dive-openapi-docs.md`
   - `.agent/summary/deep-dives/deep-dive-pagination-consistency.md`
   - `.agent/summary/deep-dives/deep-dive-gating.md`
4. **External feedback pack (for user-facing requests and examples)**
   - `.agent/external-feedback-and-requests/from-mcp-semantic-search-work/index.md`
   - `.agent/external-feedback-and-requests/from-mcp-semantic-search-work/08-summary-and-coordination.md`
   - `.agent/external-feedback-and-requests/from-mcp-semantic-search-work/00-overview-and-known-issues.md`

## Triage snapshot (v0 vs v1)

Use this as a quick prioritisation lens rather than a fixed plan.

V0 stabilisation (correctness and trust)
- Fix pagination consistency and missing results.
- Align schema and behaviour (year filters, transcript responses, binary assets).
- Document and align content gating behaviour across endpoints.
- Remove SQL injection risks and ensure rate-limit headers are returned.
- Treat bulk vs API alignment as a high-priority, cross-repo concern.

V1 improvements (refactors and modernisation)
- Shared pagination + error helpers, and consolidated data access.
- Static OpenAPI artefacts and richer schema metadata for tooling.
- Bulk pipeline enhancements (manifests, checksums, alignment with API).
- Major dependency upgrades (frameworks, tooling, CMS, data stack).

If in doubt, choose the smallest change that restores correctness and reduces ambiguity.

## Internal vs external improvements: keep separate, tie together

Recommendation: **keep the internal and external sources distinct, but add a crosswalk.**

Why this is the simplest high-quality approach:
- **Provenance**: external feedback stays attributable; internal analysis stays authoritative for implementation reality.
- **Clarity**: internal docs focus on correctness and code health; external docs focus on consumer needs.
- **Alignment**: a crosswalk makes overlap explicit without collapsing two different vocabularies into one list.

Suggested structure for tracking (lightweight):
- **Internal sources of truth**: `docs/engineering/gap-analysis.md`, `docs/engineering/v0-v1-improvements.md`, `.agent/summary/analysis/*`
- **External requests pack**: `.agent/external-feedback-and-requests/from-mcp-semantic-search-work/*`
- **Crosswalk**: `.agent/summary/analysis/internal-external-crosswalk.md` for overlaps, gaps, and alignment notes.

## Navigation map by question

If you are trying to understand…

- **Why the API behaves as it does** → `.agent/summary/overview/runtime-architecture.md`
- **Where the contract comes from** → `docs/architecture/openapi-generation.md`
- **What must be fixed before v1** → `docs/engineering/gap-analysis.md`
- **How bulk exports differ** → `docs/architecture/bulk-download.md` + `.agent/summary/guides/bulk-api-mapping-guide.md`
- **How gating/licensing affects results** → `docs/architecture/content-gating.md` + `.agent/summary/deep-dives/deep-dive-gating.md`
- **How pagination and listing behave** → `.agent/summary/deep-dives/deep-dive-pagination-consistency.md`
- **What external users are asking for** → `.agent/external-feedback-and-requests/from-mcp-semantic-search-work/08-summary-and-coordination.md`
- **Where internal and external concerns align** → `.agent/summary/analysis/internal-external-crosswalk.md`

## External requests: how to consume the pack quickly

The external pack is large. Use this path:
- Start with the overview and summary to avoid getting lost.
- Use the example packs only when you need concrete evidence or shape details.

Fast path:
1. `.../08-summary-and-coordination.md` (summary tables and priorities)
2. `.../00-overview-and-known-issues.md` (observed issues and questions)
3. `.../04-high-priority-requests.md`
4. `.../05-medium-priority-requests.md`

Example packs (use selectively):
- `.../10-availability-and-gating-examples.md`
- `.../11-assets-and-transcripts-examples.md`
- `.../14-listing-and-pagination-examples.md`
- `.../15-bulk-download-examples.md`
- `.../17-ontology-and-threads-examples.md`

## What changes are “schema-first”?

If a request affects API shapes or documentation, it is likely schema-first:
- Update Zod schemas in `src/lib/handlers/.../schemas`.
- Regenerate OpenAPI-ready schemas with `pnpm generate:openapi`.
- Avoid hand-editing generated output under `src/lib/zod-openapi/generated`.

This prevents accidental divergence between runtime behaviour, docs, and SDKs.

## A minimal checklist before committing to scope

- Could it be simpler without compromising quality?
- Is this a v0 correction or a v1 improvement?
- Does it change the public contract (Zod schema required)?
- Is it already captured in `docs/engineering/gap-analysis.md` or the external pack?
- What user group does it help most (teachers, API consumers, AI tooling)?

## If you only have 30 minutes

Read:
- `docs/engineering/gap-analysis.md`
- `docs/engineering/v0-v1-improvements.md`
- `.agent/external-feedback-and-requests/from-mcp-semantic-search-work/08-summary-and-coordination.md`

That combination gives you the internal fix list, the v0/v1 frame, and the external request map.
