# Data sources and integrations

Purpose
- Provide an inventory of external systems and how the API depends on them.

Version framing
- The public API is v0 (public alpha moving toward public beta).
- V0 items focus on correctness and trust; V1 items are deeper refinements after v0 stability.

Integration map
```text
API handlers
  |
  +--> Hasura GraphQL views (curriculum data)
  |
  +--> Hasura SQL (specialized queries)
  |
  +--> Prisma/Postgres (transcript search)
  |
  +--> Upstash Redis (API keys + rate limits)
  |
  +--> GCS (assets + bulk outputs)
  |
  +--> Mux (video derivatives)
  |
  +--> Sanity CMS (docs content)
```

Hasura GraphQL/SQL (curriculum)
- Primary read path for curriculum data via `src/lib/owaClient.ts`.
- GraphQL views are versioned by name.
- SQL access is used for specific query needs and bulk jobs.

Prisma/Postgres (transcript search)
- `src/lib/db.ts` uses Prisma Accelerate to query transcript snippets.
- The search handler combines Postgres text search with lesson lookups.

Upstash Redis (API keys + rate limiting)
- API keys are stored and validated via `src/lib/apikeys.ts`.
- Rate limiting is enforced in `src/lib/rateLimit.ts`.

GCS and Mux (assets)
- Lesson assets are read from GCS and sometimes rewritten to Mux MP4 URLs.
- Bulk outputs are stored in GCS and downloaded via the bulk API route.

Sanity CMS (docs)
- Docs pages are rendered from Sanity data using GraphQL queries.

V0/V1 alignment
- V0: address safety and correctness (SQL safety, timeouts, consistent rate-limit headers).
- V1: consolidate SQL helpers, add retries, and expand output validation.

Related ADRs
- `docs/architecture/decision-records/0004-hasura-graphql-views.md`
- `docs/architecture/decision-records/0005-prisma-transcript-search.md`
- `docs/architecture/decision-records/0006-upstash-redis-rate-limits.md`
- `docs/architecture/decision-records/0007-asset-delivery-gcs-mux.md`
- `docs/architecture/decision-records/0009-sanity-cms-docs.md`

Related docs
- `docs/architecture/runtime-architecture.md`
- `docs/architecture/openapi-generation.md`
