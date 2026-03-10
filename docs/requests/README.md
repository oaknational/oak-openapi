# API Enhancement Requests

Actionable bug reports and feature requests for the Open Curriculum API,
from downstream consumers (SDK, MCP server, semantic search).

Each file is self-contained. A developer can pick up one file and understand
the problem without reading anything else. A product manager can read
this page to prioritise.

## Sizing key

Relative sizes using Fibonacci numbers. Size 1 = smallest unit
(single-line fix, one file, tests).

| Size | Meaning |
| ---- | ------- |
| 1 | Single focused change, one file |
| 2 | Small targeted change, 2-3 files |
| 3 | Multi-file change, some coordination |
| 5 | New endpoint or significant new capability |
| 8 | Large feature spanning multiple areas |
| 13 | Multiple independent items — split before implementation |

## Bug fixes

| File | Severity | Size | Summary |
| ---- | -------- | ---- | ------- |
| [sql-injection-in-lesson-search](bug-fixes/sql-injection-in-lesson-search.md) | Critical | 3 | User input interpolated into raw SQL |
| [transcript-issues](bug-fixes/transcript-issues.md) | High | 3 | Null VTT crash, broken search ordering, empty 200s |
| [pagination-url-construction](bug-fixes/pagination-url-construction.md) | Medium | 2 | Pagination URLs break when query params present |
| [sequence-assets-year-filter](bug-fixes/sequence-assets-year-filter.md) | Medium | 2 | Year filter query parameter ignored |
| [openapi-and-routing](bug-fixes/openapi-and-routing.md) | Medium | 3 | Swagger doc mutation, missing rate-limit headers, bulk accepts all methods, + 1 more |
| [bulk-download-data-integrity](bug-fixes/bulk-download-data-integrity.md) | Medium | 3+3 audit | Separates known fixes (exam dedup, field casing, string nulls), intentional omissions (MFL transcripts), and audits (primary maths transcripts, secondary unit threads, missing lesson refs) |

## Feature requests

Every feature request has been verified against three data sources:
- Bulk download schema (`schema.json`) — what's currently in bulk exports
- OpenAPI spec (`api-schema-original.json`) — what the API exposes
- Canonical URL map + Oak-Web-Application patterns — constructible URLs

Each request surfaces data that already exists in one or more of these sources,
or derives new fields from existing data (e.g., flattening nested API structures,
constructing URLs from patterns). Requests that would require creating new
curriculum data have been excluded.

| File | Priority | Size | Summary |
| ---- | -------- | ---- | ------- |
| [openapi-metadata-enrichment](feature-requests/openapi-metadata-enrichment.md) | High | 5 | "Use this when" descriptions, operation summaries, error docs |
| [bulk-download-data-enhancements](feature-requests/bulk-download-data-enhancements.md) | High | 13 | Tier, examSubject, categories — eliminate API calls during ingestion |
| [semantic-summary-field](feature-requests/semantic-summary-field.md) | High | 5 | Pre-computed summaries derived from existing metadata fields |
| [ontology-endpoint](feature-requests/ontology-endpoint.md) | High | 5 | Curriculum structure endpoint for AI tool composition |
| [programme-variants-and-identifiers](feature-requests/programme-variants-and-identifiers.md) | High | TBD | Programme context, tier/examBoard fields, identifier consistency |
| [thread-metadata-enhancements](feature-requests/thread-metadata-enhancements.md) | Medium | 3 | Derived aggregation fields (keyStagesCovered, unitCount) |
| [schemas-bundle-endpoint](feature-requests/schemas-bundle-endpoint.md) | Medium | 5 | Expose internal Zod validators for SDK type fidelity |
| [content-filtering-transparency](feature-requests/content-filtering-transparency.md) | Medium | 5 | Document filtering rules in bulk metadata, API descriptions, and OpenAPI schema |
| [maths-specific-enhancements](feature-requests/maths-specific-enhancements.md) | Medium | 16 | Image quiz items, thread tags, transcript segments, search filters, glossary |

## Status lifecycle

Each file has a `status` field in its YAML frontmatter.

| Status | Meaning | Who updates |
| ------ | ------- | ----------- |
| draft | Proposed, not yet picked up | Requester (initial state) |
| in-progress | Being implemented | Developer picking up the item |
| implemented | Completed and verified | Developer after merge + verification |
| wont-fix | Intentionally declined | API team with rationale in the file |

**Workflow**: When picking up an item, update its `status` in the file
and keep the README tables above in sync. If an item is declined, add a
brief rationale in the file body before setting `wont-fix`.

## How to use

- **Developers**: Pick a file from bug-fixes/ or feature-requests/. Each
  contains the problem, affected endpoints, and a suggested fix or
  approach. Sizes are relative — use them for rough comparison, not
  estimation.
- **Product managers**: Use the priority tables above. Each feature
  request includes a feasibility section grounded against actual data
  sources.
- **For deeper research**: AI-generated analysis notes (from the
  oak-mcp-ecosystem project) are archived in
  [`.agent/external-feedback-and-requests/from-mcp-semantic-search-work/`](../../.agent/external-feedback-and-requests/from-mcp-semantic-search-work/index.md)
  (committed to the repo). You should not need them to act on any
  request here.

## Blockers and dependencies

Three items have unresolved feasibility questions (details in each file):

1. **Programme variants**: Does the API team have access to the
   programme→sequence mapping in their data layer?
2. **CanonicalUrl generation**: URL pattern rules must be extracted
   from Oak-Web-Application code before bulk Phase 2c can proceed.
3. **Bulk data integrity audits** (items 6-8): Should complete before
   bulk enhancements Phase 1, to avoid reworking `prepare-bulk.ts`.

Cross-request dependencies are noted in `depends-on` frontmatter where
they exist. All other requests are ready to implement independently.

## Architectural questions for the API team

Several feature requests touch on questions that the API team is best
placed to answer. These are suggestions from the consumer side — the
API team will have better insight into the right approach:

1. **Programme vocabulary**: Should the API expose programme-level
   endpoints (absorbing OWA's URL routing concepts), or provide the
   mapping as data and let consumers construct URLs?
2. **Pre-computation vs data API**: Should fields like `semantic_summary`
   live in the API response, or be pre-computed in the bulk pipeline
   and left out of the live API?
3. **Schemas bundle distribution**: If exposing internal Zod validators
   is useful, should it be an HTTP endpoint, an NPM package, or a build
   artifact?

These don't block the simpler requests (bug fixes, metadata enrichment,
bulk Phase 1) but inform the shape of the higher-coupling features.

## Background

These requests originate from work on the
[oak-mcp-ecosystem](https://github.com/oaknational/oak-open-curriculum-ecosystem)
which consumes the API via generated SDK and MCP tools for AI assistants.

All feature requests have been audited against (paths in the
[oak-mcp-ecosystem](https://github.com/oaknational/oak-open-curriculum-ecosystem) repo):

- Bulk download schema: `apps/oak-search-cli/bulk-downloads/schema.json`
- OpenAPI spec: `packages/sdks/oak-sdk-codegen/schema-cache/api-schema-original.json`
- Real adapter code that demonstrates each data gap

For internal engineering tracking with code-level detail, see
[docs/engineering/v0-v1-improvements.md](../engineering/v0-v1-improvements.md).
