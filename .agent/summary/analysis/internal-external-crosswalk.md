# Internal vs external crosswalk

Purpose
- Connect internal v0/v1 stabilisation work with external feedback from SDK and AI-tool consumers.
- Preserve provenance while making overlap, gaps, and alignment decisions explicit.

Scope and ownership
- This repo is the upstream API and the source of truth for schema-first contracts.
- The external pack is sourced from a downstream SDK repo and focuses on consumer-facing issues, tooling metadata, and usage examples.
- Internal docs capture current implementation risks, constraints, and fix paths.

Tags
- area=coordination,alignment
- track=mixed
- source=internal
- endpoints=multi

How to use
- Start with internal v0 items for correctness and trust.
- Use the external pack to quantify user impact and prioritise metadata and discoverability work.
- Treat alignment tasks (bulk vs API and schema behaviour vs docs) as shared, high priority.

## Shared concerns (overlap)

| Theme | Internal sources | External sources | Notes |
| --- | --- | --- | --- |
| Pagination and listing completeness | [`docs/engineering/gap-analysis.md`](../../../docs/engineering/gap-analysis.md) | [`.agent/external-feedback-and-requests/from-mcp-semantic-search-work/14-listing-and-pagination-examples.md`](../../external-feedback-and-requests/from-mcp-semantic-search-work/14-listing-and-pagination-examples.md) | Broken pagination and truncated lists affect trust and ingestion. |
| Sequence assets year filtering | [`docs/engineering/gap-analysis.md`](../../../docs/engineering/gap-analysis.md) | [`.agent/external-feedback-and-requests/from-mcp-semantic-search-work/11-assets-and-transcripts-examples.md`](../../external-feedback-and-requests/from-mcp-semantic-search-work/11-assets-and-transcripts-examples.md) | Document or implement the `year` filter. |
| Content gating and availability rules | [`docs/engineering/gap-analysis.md`](../../../docs/engineering/gap-analysis.md), [`docs/architecture/content-gating.md`](../../../docs/architecture/content-gating.md) | [`.agent/external-feedback-and-requests/from-mcp-semantic-search-work/10-availability-and-gating-examples.md`](../../external-feedback-and-requests/from-mcp-semantic-search-work/10-availability-and-gating-examples.md) | Align behaviour, surface reasons, avoid silent filtering. |
| Bulk vs API alignment | [`docs/architecture/bulk-download.md`](../../../docs/architecture/bulk-download.md), [`.agent/summary/guides/bulk-api-alignment-plan.md`](../guides/bulk-api-alignment-plan.md) | [`.agent/external-feedback-and-requests/from-mcp-semantic-search-work/15-bulk-download-examples.md`](../../external-feedback-and-requests/from-mcp-semantic-search-work/15-bulk-download-examples.md) | High priority for this repo; balance completeness with licensing. |
| OpenAPI contract quality | [`.agent/summary/deep-dives/deep-dive-openapi-docs.md`](../deep-dives/deep-dive-openapi-docs.md) | [`.agent/external-feedback-and-requests/from-mcp-semantic-search-work/04-high-priority-requests.md`](../../external-feedback-and-requests/from-mcp-semantic-search-work/04-high-priority-requests.md) | Schema metadata improves tooling accuracy and user clarity. |
| Transcript availability semantics | [`.agent/summary/deep-dives/deep-dive-gating.md`](../deep-dives/deep-dive-gating.md) | [`.agent/external-feedback-and-requests/from-mcp-semantic-search-work/11-assets-and-transcripts-examples.md`](../../external-feedback-and-requests/from-mcp-semantic-search-work/11-assets-and-transcripts-examples.md) | Agree on 404 vs empty 200 and document the expected behaviour. |

## External request crosswalk (summary tables)

These tables mirror the external summary list in [`.agent/external-feedback-and-requests/from-mcp-semantic-search-work/08-summary-and-coordination.md`](../../external-feedback-and-requests/from-mcp-semantic-search-work/08-summary-and-coordination.md).

### Bugs (observed and confirmed)

| External item (source) | Internal mapping | Endpoints / area | Track |
| --- | --- | --- | --- |
| `/sequences/{sequence}/assets` ignores `year` filter (`00-overview-and-known-issues.md`, `11-assets-and-transcripts-examples.md`) | [`docs/engineering/gap-analysis.md`](../../../docs/engineering/gap-analysis.md) item 4 | `/sequences/{sequence}/assets` | v0 |
| Lessons endpoint pagination bug (`00-overview-and-known-issues.md`, `14-listing-and-pagination-examples.md`) | Not captured; add to [`docs/engineering/gap-analysis.md`](../../../docs/engineering/gap-analysis.md) (missing lessons via pagination) | `/key-stages/{keyStage}/subject/{subject}/lessons` | v0 |
| Binary asset endpoint documented as JSON (`00-overview-and-known-issues.md`, `11-assets-and-transcripts-examples.md`) | Not captured; add to [`docs/engineering/gap-analysis.md`](../../../docs/engineering/gap-analysis.md) or OpenAPI doc plan | `/lessons/{lesson}/assets/{type}` | v0 |
| Empty transcript responses return 200 (`00-overview-and-known-issues.md`, `11-assets-and-transcripts-examples.md`) | Not captured; add to [`docs/engineering/gap-analysis.md`](../../../docs/engineering/gap-analysis.md) | `/lessons/{lesson}/transcript` | v0 |
| Bulk download: null titles with populated slugs (`00-overview-and-known-issues.md`, `15-bulk-download-examples.md`) | Not captured; add to [`docs/engineering/gap-analysis.md`](../../../docs/engineering/gap-analysis.md) (bulk data integrity) | `/api/bulk` | v0 |
| Bulk download: missing tier metadata for KS4 variants (`00-overview-and-known-issues.md`, `15-bulk-download-examples.md`) | Not captured; add to [`docs/engineering/v0-v1-improvements.md`](../../../docs/engineering/v0-v1-improvements.md) (bulk/API alignment) | `/api/bulk` | v1 |
| Bulk download: missing lesson record referenced by units (`00-overview-and-known-issues.md`, `15-bulk-download-examples.md`) | Not captured; add to [`docs/engineering/gap-analysis.md`](../../../docs/engineering/gap-analysis.md) (bulk data integrity) | `/api/bulk` | v0 |
| Bulk download: inconsistent null semantics (`00-overview-and-known-issues.md`, `15-bulk-download-examples.md`) | Not captured; add to [`docs/engineering/v0-v1-improvements.md`](../../../docs/engineering/v0-v1-improvements.md) (bulk cleanup) | `/api/bulk` | v1 |
| Bulk download: missing transcripts in maths primary (`00-overview-and-known-issues.md`, `15-bulk-download-examples.md`) | Not captured; add to [`docs/engineering/v0-v1-improvements.md`](../../../docs/engineering/v0-v1-improvements.md) (bulk completeness) | `/api/bulk` | v1 |
| Bulk download: missing threads and empty descriptions on secondary units (`00-overview-and-known-issues.md`, `15-bulk-download-examples.md`) | Not captured; add to [`docs/engineering/v0-v1-improvements.md`](../../../docs/engineering/v0-v1-improvements.md) (bulk completeness) | `/api/bulk` | v1 |

### Potential gaps requiring investigation

| External item (source) | Internal mapping | Endpoints / area | Track |
| --- | --- | --- | --- |
| Unit summary `unitLessons` truncation (`00-overview-and-known-issues.md`, `14-listing-and-pagination-examples.md`) | Not captured; add to [`docs/engineering/gap-analysis.md`](../../../docs/engineering/gap-analysis.md) or document constraint | `/units/{unit}/summary` | v0 |
| Subject gating and allowlists not documented (`00-overview-and-known-issues.md`, `10-availability-and-gating-examples.md`) | [`docs/engineering/gap-analysis.md`](../../../docs/engineering/gap-analysis.md) item 9 + [`docs/architecture/content-gating.md`](../../../docs/architecture/content-gating.md) | Gating across lessons, assets, transcripts, questions | v0 |
| Assets endpoint TPC filtering needs explicit documentation (`00-overview-and-known-issues.md`, `10-availability-and-gating-examples.md`) | Not captured; add to [`docs/architecture/content-gating.md`](../../../docs/architecture/content-gating.md) | `/key-stages/{keyStage}/subject/{subject}/assets` | v0 |
| `/search/lessons` excludes `financial-education` (`00-overview-and-known-issues.md`, `12-search-and-enums-examples.md`) | Not captured; add to [`docs/engineering/gap-analysis.md`](../../../docs/engineering/gap-analysis.md) or document constraint | `/search/lessons` | v0 |
| Quiz endpoints omit image-based questions silently (`00-overview-and-known-issues.md`, `13-quiz-content-examples.md`) | Not captured; add to [`docs/engineering/gap-analysis.md`](../../../docs/engineering/gap-analysis.md) | `/lessons/{lesson}/questions` | v0 |
| Key stage and subject enums are static (`00-overview-and-known-issues.md`, `12-search-and-enums-examples.md`) | Not captured; add to [`docs/engineering/v0-v1-improvements.md`](../../../docs/engineering/v0-v1-improvements.md) | Request schemas across list/search endpoints | v1 |
| KS4 science only accessible via sequences endpoint (`00-overview-and-known-issues.md`, `14-listing-and-pagination-examples.md`) | Not captured; add to [`docs/engineering/gap-analysis.md`](../../../docs/engineering/gap-analysis.md) or document constraint | `/key-stages/ks4/subject/science/lessons`, `/sequences/science-secondary-{board}/units` | v0 |
| Legitimate `z.unknown()` exceptions registry (`00-overview-and-known-issues.md`, `20-validation-and-schema-examples.md`) | Not captured; add to OpenAPI doc plan | Search responses, binary assets | v1 |
| Open questions (OpenAPI 3.1, path examples, Zod 4, schema snippets, metadata usefulness, data integrity) (`00-overview-and-known-issues.md`) | Partial: Zod 4 is [`docs/engineering/v0-v1-improvements.md`](../../../docs/engineering/v0-v1-improvements.md) item 12; others not captured | OpenAPI generation and docs | mixed |

### Enhancement requests

| External item (source) | Internal mapping | Endpoints / area | Track |
| --- | --- | --- | --- |
| Flat tier/examBoard fields (`18-programmes-and-identifiers-examples.md`) | Not captured; add to [`docs/engineering/v0-v1-improvements.md`](../../../docs/engineering/v0-v1-improvements.md) | Lessons, units, sequences | v1 |
| `semantic_summary` field (`19-semantic-summary-examples.md`) | Not captured; add to [`docs/engineering/v0-v1-improvements.md`](../../../docs/engineering/v0-v1-improvements.md) | Lessons, units, sequences, subjects, threads | v1 |
| Maths sequence bundle endpoint (`21-maths-education-enhancements.md`) | Not captured; add to [`docs/engineering/v0-v1-improvements.md`](../../../docs/engineering/v0-v1-improvements.md) | `/sequences/{sequence}/bundle` | v1 |
| Maths lesson thread tags + thread metadata (`21-maths-education-enhancements.md`) | Not captured; add to [`docs/engineering/v0-v1-improvements.md`](../../../docs/engineering/v0-v1-improvements.md) | `/lessons/{lesson}/summary`, `/threads` | v1 |
| Structured maths answers + marking metadata (`21-maths-education-enhancements.md`) | Not captured; add to [`docs/engineering/v0-v1-improvements.md`](../../../docs/engineering/v0-v1-improvements.md) | `/lessons/{lesson}/questions` | v1 |
| Return image/diagram quiz items (`21-maths-education-enhancements.md`) | Not captured; add to [`docs/engineering/v0-v1-improvements.md`](../../../docs/engineering/v0-v1-improvements.md) | `/lessons/{lesson}/questions` | v1 |
| Maths representation tags (`21-maths-education-enhancements.md`) | Not captured; add to [`docs/engineering/v0-v1-improvements.md`](../../../docs/engineering/v0-v1-improvements.md) | Lesson and unit summaries | v1 |
| Transcript segments + maths normalisation (`21-maths-education-enhancements.md`) | Not captured; add to [`docs/engineering/v0-v1-improvements.md`](../../../docs/engineering/v0-v1-improvements.md) | `/lessons/{lesson}/transcript` | v1 |
| Transcript search filters + richer context (`21-maths-education-enhancements.md`) | Not captured; add to [`docs/engineering/v0-v1-improvements.md`](../../../docs/engineering/v0-v1-improvements.md) | `/search/transcripts` | v1 |
| Maths glossary + keyword IDs (`21-maths-education-enhancements.md`) | Not captured; add to [`docs/engineering/v0-v1-improvements.md`](../../../docs/engineering/v0-v1-improvements.md) | `/subjects/{subject}/keywords` | v1 |
| "Use this when" descriptions (`16-schema-and-metadata-examples.md`) | Not captured; add to [docs/engineering/v0-v1-improvements.md](docs/engineering/v0-v1-improvements.md) (quick win) | OpenAPI metadata across endpoints | v1 |
| Operation summaries (`16-schema-and-metadata-examples.md`) | Not captured; add to [docs/engineering/v0-v1-improvements.md](docs/engineering/v0-v1-improvements.md) (quick win) | OpenAPI metadata across endpoints | v1 |
| `/ontology` endpoint (`17-ontology-and-threads-examples.md`) | Not captured; add to [docs/engineering/v0-v1-improvements.md](docs/engineering/v0-v1-improvements.md) | `/ontology` | v1 |
| Error response docs (`16-schema-and-metadata-examples.md`) | Not captured; add to [docs/engineering/gap-analysis.md](docs/engineering/gap-analysis.md) (contract clarity) | All endpoints | v0 |
| Programme variant metadata (`18-programmes-and-identifiers-examples.md`) | Not captured; add to [docs/engineering/v0-v1-improvements.md](docs/engineering/v0-v1-improvements.md) | `/programmes`, sequences | v1 |
| Consistent resource IDs (`18-programmes-and-identifiers-examples.md`) | Not captured; add to [docs/engineering/v0-v1-improvements.md](docs/engineering/v0-v1-improvements.md) | Lessons, units, sequences, programmes | v1 |
| Parameter examples (`16-schema-and-metadata-examples.md`) | Not captured; add to [docs/engineering/v0-v1-improvements.md](docs/engineering/v0-v1-improvements.md) | OpenAPI metadata across endpoints | v1 |
| Custom schema extensions (`16-schema-and-metadata-examples.md`) | Not captured; add to [docs/engineering/v0-v1-improvements.md](docs/engineering/v0-v1-improvements.md) | OpenAPI metadata across endpoints | v1 |
| Behavioural metadata (`16-schema-and-metadata-examples.md`) | Not captured; add to [docs/engineering/v0-v1-improvements.md](docs/engineering/v0-v1-improvements.md) | OpenAPI metadata across endpoints | v1 |
| Thread enhancements (`17-ontology-and-threads-examples.md`) | Not captured; add to [docs/engineering/v0-v1-improvements.md](docs/engineering/v0-v1-improvements.md) | `/threads`, `/threads/{thread}/units` | v1 |
| Standardise types with `$ref` (`16-schema-and-metadata-examples.md`) | Not captured; add to [docs/engineering/v0-v1-improvements.md](docs/engineering/v0-v1-improvements.md) | OpenAPI components | v1 |
| Expose Zod validators (`09-schemas-endpoint-rfc.md`, `20-validation-and-schema-examples.md`) | Not captured; add to [docs/engineering/v0-v1-improvements.md](docs/engineering/v0-v1-improvements.md) | `/schemas` | v1 |
| Response examples (`16-schema-and-metadata-examples.md`) | Not captured; add to [docs/engineering/v0-v1-improvements.md](docs/engineering/v0-v1-improvements.md) | OpenAPI metadata across endpoints | v1 |
| Canonical URL patterns (`16-schema-and-metadata-examples.md`) | Not captured; add to [docs/engineering/v0-v1-improvements.md](docs/engineering/v0-v1-improvements.md) | OpenAPI metadata across endpoints | v1 |
| Resource timestamps (`16-schema-and-metadata-examples.md`) | Not captured; add to [docs/engineering/v0-v1-improvements.md](docs/engineering/v0-v1-improvements.md) | Resource responses across endpoints | v1 |
| Performance hints (`16-schema-and-metadata-examples.md`) | Not captured; add to [docs/engineering/v0-v1-improvements.md](docs/engineering/v0-v1-improvements.md) | OpenAPI metadata across endpoints | v1 |
| OpenAPI best practices (`16-schema-and-metadata-examples.md`) | Not captured; add to [docs/engineering/v0-v1-improvements.md](docs/engineering/v0-v1-improvements.md) | OpenAPI document | v1 |

## Disparate concerns

Internal-only (implementation and safety)
- Swagger document mutation in `/swagger.json` and other OpenAPI runtime handling.
- SQL injection risk in lesson search and low-level query safety.
- Rate-limit headers missing on asset/bulk routes due to response header handling.
- Bulk video packaging sentinel bug and bulk JSON parsing by method.
- Dependency upgrades (Zod 4 and zod-openapi 4.x) and tooling constraints.

External-only (consumer-facing and tooling enrichment)
- Ontology endpoint and curriculum structural pattern documentation.
- Programme variants, tier/exam board context, and identifier consistency across services.
- `semantic_summary` and `rerank_summary` fields for search and AI tooling.
- `/schemas` bundle for validator reuse, plus richer examples and parameter metadata.
- Maths-specific enhancements (threads, representations, structured answers, transcript segmentation).

## Tensions and decisions to resolve

- **Bulk completeness vs licensing alignment**: external requests push for completeness; internal policy needs gating alignment. Decide whether to offer dual outputs or explicit flags.
- **Metadata enrichment vs v0 stabilisation**: external pack prioritises tool metadata; internal v0 list prioritises correctness. Decide which metadata improvements can be delivered as low-risk v0 wins.
- **Transcript availability semantics**: external requests expect explicit 404s; internal docs do not yet list this as v0-critical. Decide whether to elevate.
- **KS4 structural access**: external pack flags science KS4 access via sequences; internal list does not. Decide if this becomes a v0 issue or a documented constraint.

## Candidate additions to the internal backlog

These are high-impact external items not yet captured in internal v0/v1 lists:
- Explicit error response documentation and canonical error shapes in OpenAPI.
- Binary asset responses documented as binary rather than JSON.
- Structural pattern documentation (especially KS4 science traversal).
- Programme context and identifier consistency for OWA links.

If adopted, add them to [docs/engineering/v0-v1-improvements.md](docs/engineering/v0-v1-improvements.md) and the relevant v0/v1 plan.
