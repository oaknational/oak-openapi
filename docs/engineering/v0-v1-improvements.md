# V0 and V1 Improvements

## Purpose

Separate immediate v0 fixes from deeper v1 improvements so sequencing stays clear.

## Version Framing

- The public API is **v0** (public alpha moving toward public beta).
- V0 items focus on **correctness and trust**; V1 items are deeper refinements after v0 stability.

## Tags

- area=planning,stability,modernisation
- track=mixed
- source=internal
- endpoints=multi

---

## Consumer Requests

For bug reports and feature requests from downstream API consumers
(SDK, MCP server, semantic search), see:

**[docs/requests/](../requests/README.md)** — prioritised, self-contained
files aimed at developers and product managers.

The V0/V1 items below are internal engineering tracking with code-level
detail. Many correspond to consumer requests — cross-references are noted.

---

## Two-Track View

```text
V0 Stabilisation
  -> correctness + safety fixes
  -> targeted dependency updates (incl. Zod 4)
  -> consistent API behaviour

V1 Improvements
  -> refactors and modernisation
  -> tooling upgrades
  -> deeper DX enhancements
```

---

# V0 Critical Fixes

## Pagination and URL Construction

### V0-001: Pagination `Link` header URL construction

- **Status**: Implemented
- **Severity**: Medium
- **Endpoints**: `/key-stages/{keyStage}/subject/{subject}/lessons`, `/sequences/{sequence}/questions`, `/key-stages/{keyStage}/subject/{subject}/questions`
- **Description**: The pagination URL is constructed by concatenating `baseUrl + ctx.req.url + "?offset=..."`. If `ctx.req.url` already contains query parameters (e.g., `?limit=10`), this produces an invalid URL with duplicate `?` characters.
- **Code references**:
  - [`keyStageSubjectLessons.ts:81-83`](../../../src/lib/handlers/keyStageSubjectLessons/keyStageSubjectLessons.ts#L81-L83)
  - [`questions.ts:203-205`](../../../src/lib/handlers/questions/questions.ts#L203-L205)
  - [`questions.ts:338-340`](../../../src/lib/handlers/questions/questions.ts#L338-L340)
- **Expected behaviour**: URL should correctly merge query parameters (e.g., `?limit=10&offset=10`)
- **Actual behaviour**: URL may produce `?limit=10?offset=10` if `ctx.req.url` already contains query params
- **Fix**: Use the `URL` API to properly parse and modify query parameters, or strip existing query params before appending.

---

## Search and Data Ordering

### V0-002: Transcript search result ordering

- **Status**: Confirmed
- **Severity**: Low
- **Endpoints**: `/search/transcripts`
- **Description**: The sorting logic compares apples to oranges - `ids` contains `lesson_id` UUIDs but the sort uses `lessonSlug` strings.
- **Code references**:
  - [`searchTranscripts.ts:43`](../../../src/lib/handlers/searchTranscripts/searchTranscripts.ts#L43) — `ids = search.map((r) => r.lesson_id)` (UUIDs)
  - [`searchTranscripts.ts:72-73`](../../../src/lib/handlers/searchTranscripts/searchTranscripts.ts#L72-L73) — `ids.indexOf(a.lessonSlug)` (slugs)
- **Impact**: Since `indexOf` returns `-1` for all non-matches (slugs vs UUIDs), the sort has no effect. Results are returned in `findMany` order rather than similarity-ranked order from the snippets query.
- **Fix**: Use `ids.indexOf(res.find(r => r.slug === a.lessonSlug)?.id)` or build a Map for O(1) lookup.

### V0-003: `/search/lessons` excludes `financial-education` subject

- **Status**: Intentional (needs documentation)
- **Severity**: Low (documentation gap)
- **Endpoints**: `/search/lessons`
- **Description**: The search query explicitly filters out `financial-education` subject. This is intentional for now but should be documented.
- **Code reference**: [`lesson.ts:162-163`](../../../src/lib/handlers/lesson/lesson.ts#L162-L163)
- **Action**: Document in API description that this subject is excluded.

---

## Data Safety and SQL Injection

### V0-004: Lesson search builds SQL from user input

- **Status**: Confirmed
- **Severity**: Critical
- **Endpoints**: `/search/lessons`
- **Description**: User input is sanitised only by replacing `'` with `''` then interpolated into raw SQL. While this provides some protection, it is not a robust defence and should use parameterised queries.
- **Code reference**: [`lesson.ts:142-163`](../../../src/lib/handlers/lesson/lesson.ts#L142-L163)
- **Fix**: Replace string interpolation with parameterised queries or prepared statements via Hasura/Prisma.

---

## OpenAPI and Documentation

### ~~V0-005: Swagger JSON route mutates the shared OpenAPI document~~

**Withdrawn.** The route comments this as intentional (`"safe to do so"`).
The mutation is idempotent, and the docs pages (`getEndpointDocs.ts`)
are rendered at build time rather than sharing the serverless runtime.
Practical risk is negligible.

---

## Filtering and Gating

### V0-006: Sequence assets ignore `year` filter

- **Status**: Implemented
- **Severity**: Medium
- **Endpoints**: `/sequences/{sequence}/assets`
- **Description**: The `year` parameter is accepted but never applied to the query. Code contains explicit `FIXME` comments.
- **Code references**:
  - [`assets.ts:257`](../../../src/lib/handlers/assets/assets.ts#L257) — `FIXME year was never being used to filter`
  - [`assets.ts:372`](../../../src/lib/handlers/assets/assets.ts#L372) — `FIXME add the year filter if provided`
- **Fix**: Apply year filter to the GraphQL query or remove the parameter from the schema.

### V0-007: Quiz endpoints omit image-based questions silently

- **Status**: Confirmed (intentional but undocumented)
- **Severity**: Medium
- **Endpoints**: `/lessons/{lesson}/quiz`, `/sequences/{sequence}/questions`, `/key-stages/{keyStage}/subject/{subject}/questions`
- **Description**: Questions containing image answers are silently filtered out when `imagesAllowed === false`. The `imagesAllowed` flag is determined by `supportsImages(subject, unit)` which returns `true` only for maths or specific units.
- **Code references**:
  - [`questions/helpers.ts:241-249`](../../../src/lib/handlers/questions/helpers.ts#L241-L249) — filtering logic
  - [`queryGate.ts:137-138`](../../../src/lib/queryGate.ts#L137-L138) — `supportsImages()` function
- **Fix**: Document the filtering behaviour, or return metadata indicating questions were omitted (e.g., `imageQuestionsOmitted: true`).

### V0-008: Content gating across endpoints

- **Status**: Needs review and documentation
- **Severity**: Medium
- **Endpoints**: Multiple (lessons, assets, transcripts, questions)
- **Description**: Content gating is implemented through multiple mechanisms that work together but require documentation:
  - **Subject-level blocking**: `blockedSubjects = ['english', 'financial-education']` ([`queryGate.ts:25`](../../../src/lib/queryGate.ts#L25))
  - **Subject-level support**: `supportedSubjects = ['maths']` ([`queryGate.ts:24`](../../../src/lib/queryGate.ts#L24))
  - **Unit-level allowlist**: `supportedUnits.json` (~8KB of unit slugs)
  - **Lesson-level allowlist**: `supportedLessons.json` (~500KB of lesson slugs)
  - **Lesson-level blocklist**: `assets/blockedLessons.json`
- **Current behaviour for English**:
  - English is in `blockedSubjects`, so subjects/units at subject level are blocked
  - However, specific English units are in `supportedUnits.json` allowlist, which overrides subject blocking ([`queryGate.ts:61-64`](../../../src/lib/queryGate.ts#L61-L64))
  - Not all English units are available - only those explicitly listed
- **Fix**: Document the gating hierarchy and ensure consistent application across endpoints.

---

## Transcript Handling

### V0-009: Transcript endpoint crashes on null VTT

- **Status**: Implemented
- **Severity**: High
- **Endpoints**: `/lessons/{lesson}/transcript`
- **Description**: Line 60 calls `vtt.replace()` without null-checking. If `transcript_vtt` is null/undefined, this will throw a runtime error.
- **Code reference**: [`transcript.ts:60`](../../../src/lib/handlers/transcript/transcript.ts#L60)
- **Fix**: Add null guard: `return { vtt: vtt?.replace(/\r/g, '') ?? '', transcript };`

---

## Rate Limiting

### V0-010: Rate-limit headers on custom routes

- **Status**: Confirmed
- **Severity**: Medium
- **Endpoints**: `/api/bulk`, `/lessons/{lesson}/assets/{type}`
- **Description**: Custom routes (non-tRPC) incorrectly construct the context. They pass `req.headers` (the **request** headers) as `resHeaders`:

  ```typescript
  // WRONG: uses request headers as response headers
  resHeaders: req.headers,
  ```
  
  The `protect()` middleware then calls `resHeaders.set('X-RateLimit-Limit', ...)`, which attempts to write to the immutable request headers. This silently fails, so clients never receive rate-limit headers.

- **Code references**:
  - [`bulk/route.ts:24`](../../../src/app/api/bulk/route.ts#L24)
  - [`assets/[type]/route.ts:31`](../../../src/app/api/v0/lessons/[lesson]/assets/[type]/route.ts#L31)
- **Contrast with tRPC routes**: The tRPC router correctly creates a `resHeaders` Map and applies it to the response ([`[...trpc]/route.ts:15-31`](../../../src/app/api/v0/[...trpc]/route.ts#L15-L31)).
- **Fix**: Create a proper response headers object pattern matching what tRPC routes do.

---

## Bulk Download

### V0-011: Bulk download API method handling

- **Status**: Confirmed
- **Severity**: Low
- **Endpoints**: `/api/bulk`
- **Description**: The route exports handlers for all HTTP methods (GET, POST, PUT, DELETE, etc.) but unconditionally calls `req.json()`. GET/HEAD requests have no body, causing JSON parse errors.
- **Code reference**: [`bulk/route.ts:37-38, 89-97`](../../../src/app/api/bulk/route.ts#L37-L38)
- **Context**: The endpoint is intended for POST requests only. Exporting all methods may be a pattern to ensure OPTIONS works for CORS preflight.
- **Fix**: Either restrict to POST only, or check method before parsing body.

### V0-012: Video bulk downloads

- **Status**: Not currently implemented
- **Severity**: N/A
- **Description**: There is no video bulk download feature at this time. The `bulk-download-videos.sh` script and related code only run when `INCLUDE_ASSETS=true` is set during bulk data preparation. This is an internal build-time tool, not a public feature.
- **Code references**:
  - [`prepare-bulk.ts:41`](../../../bin/prepare-bulk.ts#L41) — `processAssets` flag controls video processing
  - [`bulk-download-videos.sh`](../../../bin/bulk-download-videos.sh) — internal video archiver
- **Action**: No fix needed; document that video bulk downloads may be added in future.

### V0-013: Bulk download gating alignment

- **Status**: Consistent (verified)
- **Severity**: Low (documentation gap)
- **Description**: Bulk data preparation uses the same gating logic as the API via `isLessonAssetsAllowed()` which calls `isSubjectSupported()` and `isUnitSupported()` from `queryGate.ts`.
- **Code reference**: [`prepare-bulk.ts:79-92`](../../../bin/prepare-bulk.ts#L79-L92)
- **Behaviour**:
  - All maths lessons are included (subject supported)
  - English lessons are only included if their unit is in `supportedUnits.json`
  - `financial-education` is excluded entirely
- **Action**: Document the gating behaviour in bulk download documentation.

### V0-014: JSON Schema in bulk download data

- **Status**: Not implemented
- **Severity**: Medium (enhancement)
- **Description**: The bulk download data includes JSON (per-sequence metadata) and JSONL (lessons), but no JSON Schema for validation.
- **Code references**:
  - [`prepare-bulk.ts:317-319`](../../../bin/prepare-bulk.ts#L317-L319) — writes `{sequence}.json`
  - [`prepare-bulk.ts:242-245`](../../../bin/prepare-bulk.ts#L242-L245) — writes `lessons.jsonl`
- **Fix**: Generate and include a JSON Schema file with each bulk export.

### ~~V0-016: Binary asset endpoint content-type mismatch~~

- **Status**: Withdrawn — verified 2026-03-10 that `assets.ts:640`
  correctly specifies `contentTypes: ['application/octet-stream']`.
  Original claim was inaccurate.

### V0-017: Transcript endpoint returns 200 for missing transcripts

- **Status**: Confirmed
- **Severity**: Medium
- **Endpoints**: `/lessons/{lesson}/transcript`
- **Description**: Lessons without transcripts (e.g., practical lessons with no video) return HTTP 200 with an empty body instead of 404. Consumers cannot distinguish "has no transcript" from "request succeeded with empty content."
- **Fix**: Return 404 with a clear reason (e.g., `{ "error": "not_found", "reason": "no_video" }`), or return 200 with a schema that includes a `hasTranscript: false` field.
- **Consumer request**: moved from deleted `transcript-issues.md` (request file removed during docs consolidation).

---

## Priority Dependency Upgrade

### V0-015: Upgrade to Zod 4 and zod-openapi

- **Status**: ✅ Complete
- **Description**: The codebase is now on `zod@4.3.5` and `zod-openapi@5.4.6`. All schemas use the `zod/v4` import path.
- **Related docs**: [`dependency-upgrades.md`](./dependency-upgrades.md)

---

## V0 Dependency Maintenance (Low-Risk)

- Apply patch/minor updates in small batches with smoke tests.
- Keep a short upgrade log to track changes.
- See [`dependency-upgrades.md`](./dependency-upgrades.md) for the full list.

---

# V1 Improvements

## API and DX Consistency

- Shared pagination helper for `Link` headers and limit/offset defaults.
- Custom-route wrapper for consistent CORS and rate-limit headers.

## OpenAPI and Documentation

### Static OpenAPI artifact

- **Description**: Currently the OpenAPI document is generated dynamically by tRPC. A static `.json` artifact generated at build time would enable:
  - Version control of API changes
  - CI validation of breaking changes
  - Easier consumption by SDK generators
- **Action**: Add a build step to generate and commit `openapi.json`.

### Restored example validation

- **Status**: Examples exist in schemas
- **Description**: OpenAPI examples are defined in generated schemas (e.g., `example: 'ks1'` in request schemas). These should be validated against the schema at test time to catch drift.
- **Action**: Add test to validate examples parse successfully against their schemas.

### Additional documentation improvements

See [openapi-metadata-enrichment](../requests/feature-requests/openapi-metadata-enrichment.md)
for the full request including "use this when" descriptions, parameter
examples, and error documentation.

## New Endpoints and Features

Full specifications for each item are in
[docs/requests/feature-requests/](../requests/README.md). The table
below links to the canonical request file for each feature.

| Feature | Request file |
| ------- | ------------ |
| Thread metadata enhancements | [thread-metadata-enhancements.md](../requests/feature-requests/thread-metadata-enhancements.md) |
| Programme variant endpoint | [programme-variants-and-identifiers.md](../requests/feature-requests/programme-variants-and-identifiers.md) |
| Bulk download data enhancements | [bulk-download-data-enhancements.md](../requests/feature-requests/bulk-download-data-enhancements.md) |
| Subject keywords endpoint | [subject-keywords-endpoint.md](../requests/feature-requests/subject-keywords-endpoint.md) |
| Content filtering transparency | [content-filtering-transparency.md](../requests/feature-requests/content-filtering-transparency.md) |
| OpenAPI metadata enrichment | [openapi-metadata-enrichment.md](../requests/feature-requests/openapi-metadata-enrichment.md) |

---

## Data Access and Resilience

- Standardise SQL helpers to a single Hasura endpoint.
- Add timeouts/retries for external calls (Hasura, Mux, GCS).
- Expand Zod output validation where raw data is returned.

## Bulk Pipeline Enhancements

- Dry-run mode for bulk exports.
- Per-sequence manifests and checksums.
- Align bucket configuration across bulk scripts.
- Publish bulk/API mapping guide.

## Major Dependency Upgrades (V1 Track)

**Completed:**

- ✅ Vitest 4.x, Vite 7.x (done)
- ✅ uuid 13.x, lint-staged 16.x (done)
- ✅ eslint-config-next 16.x (done)

**Pending:**

- Next.js 16.x
- Prisma 7.x
- Sanity 5.x
- Storybook 10.x
- See [`dependency-upgrades.md`](./dependency-upgrades.md) for the full list.

## Modernisation (Lower Priority)

- Evaluate Babel replacement for schema generation.
- Reduce lodash usage with targeted utilities or native equivalents.

## Notes and Intentional Behaviours

| Item | Status |
|------|--------|
| `financial-education` excluded from search | Intentional — to be documented |
| English content limited to specific units | Intentional — handled via `supportedUnits.json` |
| Video bulk downloads | Not currently implemented |
| Binary asset content-type | Correctly documented as `application/octet-stream` (previous mismatch claim withdrawn) |
| `unitLessons` truncation | Not present — returns all lessons |

---

## Related Docs

- **[docs/requests/](../requests/README.md)** — consumer-facing bug reports and feature requests
- [`docs/engineering/gap-analysis.md`](./gap-analysis.md)
- [`docs/engineering/enhancements.md`](./enhancements.md)
- [`docs/engineering/dependency-upgrades.md`](./dependency-upgrades.md)

## Appendix

Downstream research archive references were intentionally removed. Notion is the
source of truth for ticket tracking, and `docs/requests/` is the technical
context surface in this repository.
