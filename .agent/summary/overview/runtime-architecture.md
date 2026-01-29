# Runtime architecture

Version framing
- The public API is v0 (public alpha moving toward public beta); prioritize V0 critical fixes first.
- V1 improvements are deeper refinements after v0 stability goals; see [.agent/summary/analysis/versioned-improvements.md](.agent/summary/analysis/versioned-improvements.md) for the split.

Request flow (API)
- `src/app/api/v0/[...trpc]/route.ts` exposes the tRPC router through `createOpenApiFetchHandler`, using `src/lib/context.ts` for context and `src/lib/router.ts` for route definitions.
- `src/lib/trpc.ts` initializes tRPC with `superjson`, OpenAPI metadata, and custom error formatting for Zod and server errors.
- `src/lib/context.ts` adds permissive CORS headers, resolves the user via API key, and logs request info (userId, URL, query) for observability.
- `src/lib/protect.ts` enforces API key presence and rate limiting, and populates rate-limit headers in the response.

OpenAPI generation and playground
- `src/lib/zod-openapi/schema/generateDocument.ts` generates an OpenAPI document from the tRPC router using `trpc-to-openapi`.
- API versioning is derived from the changelog in `src/lib/handlers/changelog/helpers.ts`.
- `/api/v0/swagger.json` returns the OpenAPI document (with docs-only tags removed), used by Swagger UI at `/playground` (`src/app/(pages)/playground/Playground.tsx`).

Custom API routes
- `src/app/api/v0/lessons/[lesson]/assets/[type]/route.ts` streams assets from GCS or Mux and handles auth/rate limit manually via `protect`.
- `src/app/api/bulk/route.ts` zips and returns bulk JSON files from GCS for user-selected subjects (requires API key).
- `src/app/api/admin/create-api-key/route.ts` creates API keys for admin use (protected by basic auth middleware).
- `src/app/api/health/route.ts` and `src/app/api/pingdom/route.ts` hit GraphQL views to report system health.

Next.js UI
- `src/app/layout.tsx` sets up global fonts, analytics provider, and styled-components registry.
- UI pages are in `src/app/(pages)/*` and mostly fetch data server-side before rendering client components.
