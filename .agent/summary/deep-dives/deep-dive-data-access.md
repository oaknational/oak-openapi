# Deep dive: data access safety + consistency

Version framing
- The public API is v0 (public alpha moving toward public beta); prioritize V0 critical fixes first.
- V1 improvements are deeper refinements after v0 stability goals; see `.agent/summary/analysis/versioned-improvements.md` for the split.

Scope
- All primary data sources (Hasura GraphQL/SQL, Prisma/Postgres, GCS, Mux, Sanity) and query patterns.
- Safety, consistency, and error handling across integrations.

Inventory (by source)
- Hasura GraphQL: `src/lib/owaClient.ts` and handlers in `src/lib/handlers/*`.
- Hasura SQL: `querySQL` (`/v1/query`) and `runSQL` (`/v2/query`).
- Prisma/Postgres: `src/lib/db.ts`, `schema.prisma`, `src/lib/handlers/searchTranscripts/searchTranscripts.ts`.
- GCS: `src/lib/bulk-data/data-stores.ts`, `src/lib/handlers/assets/helpers.ts`.
- Mux: `src/lib/handlers/assets/helpers.ts` (MP4 derivation).
- Sanity CMS: `src/cms/lib/client.ts` and queries in `src/cms/queries/*`.

Data flow (typical handler)
```
HTTP request
  |
  v
Handler
  |
  +--> GraphQL (Hasura views)
  |
  +--> SQL (Hasura run_sql)
  |
  +--> Prisma (transcripts)
  |
  +--> GCS/Mux (assets)
  |
  v
Map + validate -> response
```

Findings (high-impact)
- Raw SQL is built from user input in lesson search, which can increase exposure to SQL injection and malformed queries.
  - Evidence: `src/lib/handlers/lesson/lesson.ts` (searchByTextSimilarity).

Findings (medium)
- Two SQL entrypoints (`/v1/query` and `/v2/query`) are used in different places, which can increase operational inconsistency and troubleshooting cost.
  - Evidence: `src/lib/owaClient.ts` vs `src/lib/bulk-data/data-stores.ts`.
- Transcript search ordering appears to use an ID/slug mismatch, which can reduce relevance accuracy.
  - Evidence: `src/lib/handlers/searchTranscripts/searchTranscripts.ts`.
- External calls (Hasura, Mux, GCS) do not currently have explicit timeouts or retries, which can make failures harder to diagnose.

Findings (low)
- GraphQL view names include version suffixes (e.g., `published_mv_lesson_openapi_1_2_3`), which creates strong coupling to Hasura view versions.

Consistency notes
- GraphQL queries often include `@cached(ttl: 300)` but cache behavior is only present if supported by the upstream service.
- Some handlers validate outputs with Zod before returning; others return raw mapped data without validation.

Recommendations

V0/V1 alignment
- V0: prioritize fixes that improve correctness, safety, and client trust.
- V1: schedule deeper refactors and enhancements after V0 stability goals are met.

- Replace raw SQL string building in user-facing handlers with parameterized queries or a query builder.
- Standardize SQL access via a single `runSQL` helper and consistent endpoint version.
- Add timeout and retry policies for critical external calls (GraphQL, Mux, GCS).
- Expand Zod output validation for handlers that map raw data without schema checks.

Evidence list
- `src/lib/owaClient.ts`
- `src/lib/handlers/lesson/lesson.ts`
- `src/lib/handlers/searchTranscripts/searchTranscripts.ts`
- `src/lib/bulk-data/data-stores.ts`
- `src/lib/handlers/assets/helpers.ts`
- `src/cms/lib/client.ts`
- `schema.prisma`
