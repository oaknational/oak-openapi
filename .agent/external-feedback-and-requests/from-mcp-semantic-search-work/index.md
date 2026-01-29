# Open Curriculum API Wishlist Index

This directory contains a split version of the upstream API metadata wishlist to keep each document short and focused. The content is split sequentially and preserved verbatim within each file.

## Key references

- API docs: https://open-api.thenational.academy/docs/about-oaks-api/api-overview
- OpenAPI schema (local): packages/sdks/oak-curriculum-sdk/src/types/generated/api-schema/api-schema-original.json
- Canonical field name: semantic_summary
- Archive (original single file): .agent/plans/external/ooc-api-wishlist/archive/upstream-api-metadata-wishlist.md

## Guiding question

If someone handed you this pack, would you know how to find what you want, and would you be able to discover everything important?

## How to find what you need

**If you need a quick overview:** start with [08-summary-and-coordination.md](08-summary-and-coordination.md), then scan [00-overview-and-known-issues.md](00-overview-and-known-issues.md).

**If you want examples first:** jump to [10-availability-and-gating-examples.md](10-availability-and-gating-examples.md) through [20-validation-and-schema-examples.md](20-validation-and-schema-examples.md), then follow cross-links back to the request docs.

**If you are working by topic:**

- **Maths-specific improvements:** [21-maths-education-enhancements.md](21-maths-education-enhancements.md)
- **Search and enums:** [12-search-and-enums-examples.md](12-search-and-enums-examples.md) and [04-high-priority-requests.md](04-high-priority-requests.md) (Items 1-2)
- **Threads and ontology:** [17-ontology-and-threads-examples.md](17-ontology-and-threads-examples.md) and [05-medium-priority-requests.md](05-medium-priority-requests.md) (Item 10)
- **Quizzes and questions:** [13-quiz-content-examples.md](13-quiz-content-examples.md) and [04-high-priority-requests.md](04-high-priority-requests.md) (Item 4)
- **Assets and transcripts:** [11-assets-and-transcripts-examples.md](11-assets-and-transcripts-examples.md) and [06-response-metadata-and-caching.md](06-response-metadata-and-caching.md)
- **Bulk download integrity:** [15-bulk-download-examples.md](15-bulk-download-examples.md) and [00-overview-and-known-issues.md](00-overview-and-known-issues.md)
- **Bulk download completeness:** [15-bulk-download-examples.md](15-bulk-download-examples.md) (Examples 8-12) and [00-overview-and-known-issues.md](00-overview-and-known-issues.md) (ER4-ER8)
- **Schema/validation tooling:** [20-validation-and-schema-examples.md](20-validation-and-schema-examples.md) and [09-schemas-endpoint-rfc.md](09-schemas-endpoint-rfc.md)
- **Programme variants and identifiers:** [18-programmes-and-identifiers-examples.md](18-programmes-and-identifiers-examples.md) and [04-high-priority-requests.md](04-high-priority-requests.md) (Items 5-6)
- **MFL/Languages issues:** [00-overview-and-known-issues.md](00-overview-and-known-issues.md) (MFL Transcript API Response Inconsistency, ER14 Multilingual Captioning)
- **Data variances and coverage:** [00-overview-and-known-issues.md](00-overview-and-known-issues.md) (ER15 Category Availability, ER16 Key Stage Coverage Discovery) and [Data Variances](../../../../docs/data/DATA-VARIANCES.md)
- **Ground truth and evaluation:** [00-overview-and-known-issues.md](00-overview-and-known-issues.md) (ER17 Phase Metadata, ER18 Bulk Slug Validation, ER19 Field Availability, ER20 Bulk Version Metadata)

## Tagging key

- `area`: primary domain(s) touched by the document.
- `track`: likely v0 or v1 relevance (`v0`, `v1`, or `mixed`).
- `endpoints`: primary API paths (or `multi` when broad).
- `source`: `external` for this pack.

## File map (tagged)

| File | Focus | Tags |
| --- | --- | --- |
| [00-overview-and-known-issues.md](00-overview-and-known-issues.md) | Known issues, questions, and bulk integrity notes. | `area=overview,gating,bulk,search,assets,transcripts; track=mixed; endpoints=multi; source=external` |
| [01-derived-fields-and-ks4-metadata.md](01-derived-fields-and-ks4-metadata.md) | Derived fields registry and KS4 metadata clarifications. | `area=metadata,ks4; track=v1; endpoints=multi; source=external` |
| [02-semantic-summary.md](02-semantic-summary.md) | Rerank summary and `semantic_summary` requests. | `area=search,metadata; track=v1; endpoints=multi; source=external` |
| [03-context-and-vision.md](03-context-and-vision.md) | Executive summary, vision, and tool ecosystem overview. | `area=overview,tooling; track=mixed; endpoints=multi; source=external` |
| [04-high-priority-requests.md](04-high-priority-requests.md) | High priority schema, ontology, and error documentation requests. | `area=metadata,ontology,errors; track=mixed; endpoints=multi; source=external` |
| [05-medium-priority-requests.md](05-medium-priority-requests.md) | Metadata extensions, schema refs, validators, and ingestion efficiency. | `area=metadata,schemas,threads; track=mixed; endpoints=multi; source=external` |
| [06-response-metadata-and-caching.md](06-response-metadata-and-caching.md) | Response examples, canonical URLs, and timestamps. | `area=metadata,caching; track=v1; endpoints=multi; source=external` |
| [07-low-priority-and-best-practices.md](07-low-priority-and-best-practices.md) | Performance hints and OpenAPI best practices. | `area=docs,openapi; track=v1; endpoints=multi; source=external` |
| [08-summary-and-coordination.md](08-summary-and-coordination.md) | Summary tables and coordination notes. | `area=overview,coordination; track=mixed; endpoints=multi; source=external` |
| [09-schemas-endpoint-rfc.md](09-schemas-endpoint-rfc.md) | `/schemas` bundle endpoint RFC. | `area=validation,schemas; track=v1; endpoints=/schemas; source=external` |
| [10-availability-and-gating-examples.md](10-availability-and-gating-examples.md) | Gating and availability examples. | `area=gating; track=v0; endpoints=/sequences/*,/lessons/*,/key-stages/*/assets; source=external` |
| [11-assets-and-transcripts-examples.md](11-assets-and-transcripts-examples.md) | Assets and transcript behaviour examples. | `area=assets,transcripts; track=v0; endpoints=/sequences/*/assets,/lessons/*/assets,/lessons/*/transcript; source=external` |
| [12-search-and-enums-examples.md](12-search-and-enums-examples.md) | Search constraints and enum sources. | `area=search,enums; track=v0; endpoints=/search/lessons; source=external` |
| [13-quiz-content-examples.md](13-quiz-content-examples.md) | Quiz omissions and metadata examples. | `area=quiz; track=v0; endpoints=/lessons/*/questions; source=external` |
| [14-listing-and-pagination-examples.md](14-listing-and-pagination-examples.md) | Listing and pagination behaviour; KS4 science access. | `area=pagination,listing; track=v0; endpoints=/key-stages/*/subject/*/lessons,/units/*/summary,/sequences/*/units; source=external` |
| [15-bulk-download-examples.md](15-bulk-download-examples.md) | Bulk data integrity and completeness examples. | `area=bulk; track=v0; endpoints=/api/bulk; source=external` |
| [16-schema-and-metadata-examples.md](16-schema-and-metadata-examples.md) | Schema metadata patterns and examples. | `area=metadata,openapi; track=mixed; endpoints=multi; source=external` |
| [17-ontology-and-threads-examples.md](17-ontology-and-threads-examples.md) | Ontology endpoint and thread metadata examples. | `area=ontology,threads; track=v1; endpoints=/ontology,/threads; source=external` |
| [18-programmes-and-identifiers-examples.md](18-programmes-and-identifiers-examples.md) | Programme variants and identifier consistency. | `area=programmes,identifiers; track=v1; endpoints=/programmes,/lessons/*,/units/*; source=external` |
| [19-semantic-summary-examples.md](19-semantic-summary-examples.md) | `semantic_summary` examples. | `area=search,metadata; track=v1; endpoints=multi; source=external` |
| [20-validation-and-schema-examples.md](20-validation-and-schema-examples.md) | Validation, `z.unknown()`, and binary response examples. | `area=validation,schemas; track=v1; endpoints=/schemas,/lessons/*/assets; source=external` |
| [21-maths-education-enhancements.md](21-maths-education-enhancements.md) | Maths-specific enhancements and OpenAPI sketches. | `area=maths,quiz,transcripts,threads; track=v1; endpoints=multi; source=external` |

## Related Analysis Documents

- **[Data Variances](../../../../docs/data/DATA-VARIANCES.md)** — **Consolidated reference** for all curriculum data differences, transcript availability, structural patterns, API vs Bulk, integrity issues
- **[Curriculum Structure Analysis](../../analysis/curriculum-structure-analysis.md)** — Comprehensive analysis of all 7 structural patterns, traversal strategies, and aggregation requirements (2025-12-28)
