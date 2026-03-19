# API enhancement requests

Actionable bug reports and feature requests for the Open Curriculum API.

Each request file should be self-contained, human-readable, and backed by
evidence from this repository (code paths, schema shape, or reproducible
request/response examples). Speculative notes and external research artefacts
should stay out of this folder.

Product tracking happens in Notion. These files are technical context notes that
must stay aligned with current code.

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

| File | Severity | Status | Size | Summary |
| ---- | -------- | ------ | ---- | ------- |
| [pagination-url-construction](bug-fixes/pagination-url-construction.md) | ~~Medium~~ | implemented | ~~2~~ | **Already fixed** — uses URL API with searchParams.set() |
| [sequence-assets-year-filter](bug-fixes/sequence-assets-year-filter.md) | ~~Medium~~ | implemented | ~~2~~ | **Already fixed** — year is passed into `sequenceWhere()` and applied |
| [openapi-and-routing](bug-fixes/openapi-and-routing.md) | Low | draft | 1 | Asset route still exports non-GET methods |
| [bulk-download-data-integrity](bug-fixes/bulk-download-data-integrity.md) | Medium | draft | 3 | Consolidated bulk data integrity scope and deferred investigations |

## Feature requests

Feature requests in this folder should include a clear user-facing use case and
state whether they are:

- immediately actionable;
- blocked on API-team decisions; or
- deferred pending better evidence or product direction.

| File | Priority | Status | Size | Summary |
| ---- | -------- | ------ | ---- | ------- |
| [openapi-metadata-enrichment](feature-requests/openapi-metadata-enrichment.md) | High | draft | 5 | "Use this when" descriptions, operation summaries, error docs |
| [curriculum-model-endpoint](feature-requests/curriculum-model-endpoint.md) | High | draft | 5 | Construct and expose the curriculum model from upstream API (with linked artifact and generator source) |
| [bulk-download-data-enhancements](feature-requests/bulk-download-data-enhancements.md) | High | draft | 13 | Tier, examSubject, categories — eliminate API calls during ingestion |
| [programme-variants-and-identifiers](feature-requests/programme-variants-and-identifiers.md) | High | draft | 5 | Programme context, tier/examBoard fields, identifier consistency |
| [web-urls-in-api-responses](feature-requests/web-urls-in-api-responses.md) | High | draft | 5 | Add website URLs to all web-addressable API resources |
| [web-urls-in-bulk-data](feature-requests/web-urls-in-bulk-data.md) | High | draft | 5 | Add website URLs to all web-addressable bulk resources |
| [thread-metadata-enhancements](feature-requests/thread-metadata-enhancements.md) | Medium | draft | 3 | Derived aggregation fields (keyStagesCovered, unitCount) |
| [content-filtering-transparency](feature-requests/content-filtering-transparency.md) | Medium | draft | 5 | Document filtering rules in bulk metadata, API descriptions, and OpenAPI schema |
| [subject-keywords-endpoint](feature-requests/subject-keywords-endpoint.md) | Medium | draft | 3 | Aggregated subject keyword index from lesson keywords |

## MCP Evidence Matrix (oak-prod)

Proof calls executed against the live oak-prod MCP server (focusing on semantic
presence/absence, not transport-specific metadata):

| Request file | MCP proof calls used |
| --- | --- |
| `bug-fixes/openapi-and-routing.md` | `get-lessons-assets` (surface check), plus code verification for route method exports |
| `bug-fixes/pagination-url-construction.md` | Code verification only (already implemented; retained as history) |
| `bug-fixes/sequence-assets-year-filter.md` | `get-sequences-assets(sequence: "maths-primary", year: "1")`, `get-sequences-assets(sequence: "maths-primary", year: "2")` |
| `bug-fixes/bulk-download-data-integrity.md` | Code/schema verification (bulk schema + bulk data assembly path) |
| `feature-requests/bulk-download-data-enhancements.md` | `get-sequences-units(sequence: "maths-secondary", year: "10")`, `get-sequences-units(sequence: "science-secondary-aqa", year: "10")`, `get-sequences-units(sequence: "english-secondary-aqa", year: "10")`, `get-sequences-assets(...)` |
| `feature-requests/content-filtering-transparency.md` | `get-key-stages-subject-questions(keyStage: "ks2", subject: "english")`, `get-key-stages-subject-questions(keyStage: "ks2", subject: "maths")`, plus code verification (`queryGate.ts`) |
| `feature-requests/openapi-metadata-enrichment.md` | `get-key-stages-subject-lessons(...)`, `get-lessons-summary(lesson: "joining-using-and")`, `get-key-stages-subject-questions(...)` |
| `feature-requests/curriculum-model-endpoint.md` | `get-curriculum-model`, artifact [`oak-mcp-curriculum-model.json`](feature-requests/oak-mcp-curriculum-model.json), generator [curriculum-model-data.ts](https://github.com/oaknational/oak-mcp-ecosystem/blob/main/packages/sdks/oak-curriculum-sdk/src/mcp/curriculum-model-data.ts) |
| `feature-requests/programme-variants-and-identifiers.md` | `get-subjects`, `get-sequences-units(sequence: "maths-secondary", year: "10")`, `get-sequences-units(sequence: "science-secondary-aqa", year: "10")` |
| `feature-requests/web-urls-in-api-responses.md` | `get-lessons-summary(...)`, `get-subjects`, `get-threads-units(...)` |
| `feature-requests/web-urls-in-bulk-data.md` | `get-sequences-assets(...)`, bulk generation/schema references |
| `feature-requests/subject-keywords-endpoint.md` | `get-key-stages-subject-lessons(...)`, `get-lessons-summary(lesson: "joining-using-and")` |
| `feature-requests/thread-metadata-enhancements.md` | `get-threads`, `get-threads-units(thread: "number")` |

## Status lifecycle

Each file has a `status` field in its YAML frontmatter.

| Status | Meaning | Who updates |
| ------ | ------- | ----------- |
| draft | Proposed, not yet picked up | Requester (initial state) |
| in-progress | Being implemented | Developer picking up the item |
| implemented | Completed and verified | Developer after merge + verification |

**Workflow**: When picking up an item, update its `status` in the file
and keep the README tables above in sync.

## How to use

- **Developers**: Pick a file from bug-fixes/ or feature-requests/. Each
  contains the problem, affected endpoints, and a suggested fix or
  approach. Sizes are relative — use them for rough comparison, not
  estimation.
- **Product managers**: Use the priority tables above. Each feature
  request includes enough context to make a product decision without
  reading internal research notes.

## Blockers and dependencies

Three items have unresolved feasibility questions (details in each file):

1. **Programme variants**: Does the API team have access to the
   programme→sequence mapping in their data layer?
2. **Web URL coverage**: see
   `feature-requests/web-urls-in-api-responses.md` and
   `feature-requests/web-urls-in-bulk-data.md` for URL pattern and ownership
   constraints.
3. **Bulk data integrity known fixes** (items 1-2 in
   `bulk-download-data-integrity.md`): should complete before bulk enhancements
   Phase 1, to avoid reworking `prepare-bulk.ts`.

Cross-request dependencies are noted in `depends-on` frontmatter where
they exist. All other requests are ready to implement independently.

For internal engineering tracking with code-level detail, see
[docs/engineering/v0-v1-improvements.md](../engineering/v0-v1-improvements.md).
