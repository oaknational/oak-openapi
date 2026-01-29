# Deep dive: instructions, diagrams, explanations, examples

Version framing
- The public API is v0 (public alpha moving toward public beta); prioritize V0 critical fixes first.
- V1 improvements are deeper refinements after v0 stability goals; see [.agent/summary/analysis/versioned-improvements.md](.agent/summary/analysis/versioned-improvements.md) for the split.

## Quickstart instructions

Local dev
- Required (per config): Node >= 20 (Dockerfile uses 22), pnpm >= 10.
- Set env vars from `.env.example` plus any required secrets (see below).
- Install and run:
  - `pnpm install`
  - `pnpm dev` (server on `http://localhost:2727`)

Minimal env vars (core API)
- `OAK_GRAPHQL_HOST` (Hasura host)
- `OAK_GRAPHQL_SECRET` (Hasura admin secret)
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

Optional env vars (feature specific)
- `PRISMA_ACCELERATE_DATABASE_URL` (transcript search)
- `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `SANITY_AUTH_SECRET` (CMS docs)
- `NEXT_PUBLIC_POSTHOG_API_KEY`, `NEXT_PUBLIC_POSTHOG_API_HOST` (analytics)
- `AUTH_USERNAME`, `AUTH_PASSWORD` (admin basic auth)
- `BULK_DATA_BUCKET` (bulk download API)
- `GOOGLE_APPLICATION_CREDENTIALS_JSON` or default credentials (GCS access)

Regenerate data
- Regenerate key stages/subjects: `pnpm build-subjects` (requires running API and `API_KEY`).
- Regenerate OpenAPI Zod schemas: `pnpm generate:openapi`.
- Regenerate CMS Zod schemas: `pnpm gen-zod-from-gql <file.gql>`.

## Core request flow (API)

Diagram: request path
```
Client
  |
  v
Next.js route: /api/v0/[...trpc]
  |
  v
createOpenApiFetchHandler
  |
  v
createContext (CORS + auth + logging)
  |
  v
protectedProcedure (API key + rate limit)
  |
  v
Handler (GraphQL/SQL/Prisma/GCS/Mux)
  |
  v
Response (JSON + rate limit headers)
```

Explanation
- The tRPC router is defined in `src/lib/router.ts` and mounted in `src/app/api/v0/[...trpc]/route.ts`.
- Each handler declares OpenAPI metadata and Zod schemas. These are used to generate the OpenAPI spec served at `/api/v0/swagger.json`.
- `protectedProcedure` in `src/lib/protect.ts` enforces API key checks and rate limiting.

Example (curl)
```
curl -sS \
  -H "Authorization: Bearer YOUR_API_KEY" \
  "http://localhost:2727/api/v0/subjects"
```

## Asset download flow

Diagram: asset streaming
```
Client
  |
  v
Next.js route: /api/v0/lessons/{lesson}/assets/{type}
  |
  v
withUser + protect (auth + rate limit)
  |
  v
assetsForLesson (GraphQL download view)
  |
  v
GCS or Mux fetch
  |
  v
stream file (octet-stream or redirect)
```

Explanation
- Asset metadata is fetched from the Hasura downloads view.
- Non-video assets are streamed directly from GCS.
- Video URLs are resolved to MP4 via Mux when needed.
- Some lessons/units are gated using `src/lib/queryGate.ts`.

Example (curl)
```
curl -L \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -o lesson.pdf \
  "http://localhost:2727/api/v0/lessons/lesson-slug/assets/worksheet"
```

## Documentation flow (CMS + OpenAPI)

Diagram: docs page
```
/docs/... page
  |
  v
Sanity CMS queries (GraphQL)
  |
  v
Docs components
  |
  +--> OpenAPI document -> endpoint grouping and examples
```

Explanation
- CMS content is queried from Sanity and rendered in `MainDocsContent`.
- Endpoint metadata is pulled from the OpenAPI document to render endpoint blocks.

## Bulk download pipeline

Diagram: bulk data pipeline
```
bin/prepare-bulk.ts
  |
  v
GraphQL/SQL: subjects -> sequences -> units -> lessons
  |
  v
Optional assets:
  - add URLs to videos.tsv
  - stream assets into tar packs
  |
  v
Write out/{sequence}/ (json + tar files)
  |
  v
Upload to GCS (if BUCKET_NAME set)
```

Explanation
- By default, only JSON data is produced.
- When `INCLUDE_ASSETS=true`, assets are downloaded and packaged.
- Videos are downloaded by `bin/bulk-download-videos.sh` and merged into tar files.

Example (bulk for a single sequence)
```
INCLUDE_ASSETS=false \
OAK_GRAPHQL_HOST=... \
OAK_GRAPHQL_SECRET=... \
pnpm bulk maths-primary
```

## Adding a new endpoint (example workflow)

1) Create request/response schemas
- Add request/response Zod schemas under `src/lib/handlers/<handler>/schemas`.
- Add matching JSON examples under `src/lib/handlers/<handler>/examples`.

2) Regenerate OpenAPI Zod schemas
- `pnpm generate:openapi`
- Import the generated schemas into your handler.

3) Add handler logic
- Implement the tRPC handler in `src/lib/handlers/<handler>/<handler>.ts`.
- Add `.meta({ openapi: ... })` with tags, path, method, and description.

4) Export in router
- Add your handler to `src/lib/router.ts` so it is exposed by the API.

5) Validate
- Run `pnpm test` and/or `pnpm lint`.

## Query gating explanation
- `src/lib/queryGate.ts` enforces access controls for lessons/units based on subject, unit, and explicit allow/deny lists.
- Key lists live in `src/lib/queryGateData`.
- This gating is applied in assets, transcript, and unit/lesson endpoints to restrict access to unlicensed content.
