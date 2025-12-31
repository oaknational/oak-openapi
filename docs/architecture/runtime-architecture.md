# Runtime architecture

Purpose
- Document the request lifecycle for the public API, custom routes, and UI pages.

Version framing
- The public API is v0 (public alpha moving toward public beta).
- V0 items focus on correctness and trust; V1 items are deeper refinements after v0 stability.

Primary entrypoints
- tRPC OpenAPI: `src/app/api/v0/[...trpc]/route.ts`
- Asset streaming: `src/app/api/v0/lessons/[lesson]/assets/[type]/route.ts`
- Bulk download: `src/app/api/bulk/route.ts`
- Admin API key creation: `src/app/api/admin/create-api-key/route.ts`

tRPC request flow
```text
Client
  |
  v
Next.js route: /api/v0/[...trpc]
  |
  v
createOpenApiFetchHandler
  |
  v
createContext (CORS + user resolution + logging)
  |
  v
protectedProcedure (API key + rate limit)
  |
  v
Handler (GraphQL/SQL/Prisma)
  |
  v
Response JSON + rate limit headers
```

Custom route flow (asset streaming)
```text
Client
  |
  v
Next.js route: /api/v0/lessons/{lesson}/assets/{type}
  |
  v
withUser + protect (manual auth + rate limit)
  |
  v
assetsForLesson -> GCS or Mux
  |
  v
Stream file or redirect
```

Custom route flow (bulk download)
```text
Client
  |
  v
Next.js route: /api/bulk
  |
  v
protect (API key + rate limit)
  |
  v
Fetch JSON from GCS
  |
  v
Zip + stream response
```

Key runtime behaviors
- `src/lib/context.ts` adds permissive CORS, resolves user from Bearer token, and logs request info.
- `src/lib/protect.ts` enforces API key and rate limiting via Upstash Redis.
- `src/lib/trpc.ts` formats Zod errors and hides stack traces in production.

V0/V1 alignment
- V0: standardize headers (rate limit + CORS) across custom routes to match tRPC.
- V1: introduce a shared wrapper for custom routes and structured request logging.

Related docs
- `docs/architecture/openapi-generation.md`
- `docs/architecture/content-gating.md`
- `docs/architecture/bulk-download.md`
