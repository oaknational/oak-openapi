# Data sources and integrations

Version framing
- The public API is v0 (public alpha moving toward public beta); prioritize V0 critical fixes first.
- V1 improvements are deeper refinements after v0 stability goals; see `.agent/summary/analysis/versioned-improvements.md` for the split.

OWA Hasura GraphQL and SQL
- Primary curriculum data is pulled from Hasura views defined in `src/lib/owaClient.ts` (e.g., lesson, sequence, subject, download, unit-variant views).
- GraphQL calls use `OAK_GRAPHQL_HOST` and `OAK_GRAPHQL_SECRET`.
- Raw SQL access is done via `querySQL` in `src/lib/owaClient.ts` and `runSQL` in `src/lib/bulk-data/data-stores.ts`.

Prisma/Postgres for transcript search
- Prisma client is in `src/lib/db.ts`, backed by `schema.prisma` (Lesson and Snippet models).
- `src/lib/handlers/searchTranscripts/searchTranscripts.ts` runs a Postgres `to_tsvector/to_tsquery` search against snippets, then fetches lesson records.
- Uses `PRISMA_ACCELERATE_DATABASE_URL` for Prisma Accelerate.

Upstash Redis
- API keys and rate limits use Upstash Redis via `src/lib/redis.ts` and `src/lib/apikeys.ts`.
- Env vars: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`.

Google Cloud Storage and Mux
- Lesson assets and bulk download jobs read from GCS (`@google-cloud/storage`) using optional `GOOGLE_APPLICATION_CREDENTIALS_JSON` and bucket env vars.
- Video URLs are resolved through Mux by replacing HLS streams with MP4 variants in `getVideoFromMux`.

Sanity CMS
- Documentation content is fetched via Sanity GraphQL in `src/cms`.
- Key env vars: `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `SANITY_AUTH_SECRET`.

Analytics and logging
- PostHog is initialized in `src/context/AnalyticsProvider.tsx` and `src/lib/posthog.ts`.
- tRPC context logging (userId, URL, query) is written via `console.info` for aggregation in Datadog.
