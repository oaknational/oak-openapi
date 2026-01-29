# Deep dive: API lifecycle + error handling

Version framing
- The public API is v0 (public alpha moving toward public beta); prioritize V0 critical fixes first.
- V1 improvements are deeper refinements after v0 stability goals; see [.agent/summary/analysis/versioned-improvements.md](.agent/summary/analysis/versioned-improvements.md) for the split.

Scope
- Request lifecycle for tRPC OpenAPI endpoints and custom API routes.
- Authentication, rate limiting, CORS, and error formatting.

Primary entrypoints
- `src/app/api/v0/[...trpc]/route.ts`
- `src/app/api/v0/lessons/[lesson]/assets/[type]/route.ts`
- `src/app/api/bulk/route.ts`

Execution flow (tRPC OpenAPI)
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
createContext (CORS + user resolution + logging)
  |
  v
protectedProcedure (API key + rate limit)
  |
  v
Handler logic (GraphQL/SQL/Prisma)
  |
  v
Response JSON + rate limit headers
```

Execution flow (custom streaming endpoints)
```
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
Stream file / redirect
```

Key components
- Context and logging: `src/lib/context.ts` sets permissive CORS, resolves user from Bearer token, and logs userId/url/query.
- Auth and rate limiting: `src/lib/protect.ts` uses Upstash rate limits from `src/lib/rateLimit.ts`.
- Error formatting: `src/lib/trpc.ts` normalizes error responses and hides stacks in production.

Findings (high-impact)
- Asset and bulk routes currently do not return rate-limit headers: `protect` sets headers on `ctx.resHeaders`, but in custom routes this is the request headers object. Result: clients do not receive rate-limit metadata.
  - Evidence: `src/app/api/v0/lessons/[lesson]/assets/[type]/route.ts`, `src/app/api/bulk/route.ts`.
- Bulk API accepts GET/HEAD exports but unconditionally parses JSON, which may throw on GET/HEAD.
  - Evidence: `src/app/api/bulk/route.ts`.

Findings (medium/low)
- CORS headers are only set in `createContext`; custom routes do not currently set CORS headers.
- `Server-Timing` header assembly may include an empty entry when no existing header is set.
  - Evidence: `src/lib/serverTimings.ts`.

Recommendations

V0/V1 alignment
- V0: prioritize fixes that improve correctness, safety, and client trust.
- V1: schedule deeper refactors and enhancements after V0 stability goals are met.

- Create a shared API wrapper for custom routes that builds a response `Headers` object, applies rate-limit headers, and sets consistent CORS.
- Restrict bulk download API to POST only, or guard JSON parsing by method.
- Normalize `Server-Timing` header handling to avoid empty values.

Testing notes
- There is test coverage for rate limiting and OpenAPI schema presence, but no direct tests for custom route headers or error formatting.

Evidence list
- `src/app/api/v0/[...trpc]/route.ts`
- `src/lib/trpc.ts`
- `src/lib/context.ts`
- `src/lib/protect.ts`
- `src/app/api/v0/lessons/[lesson]/assets/[type]/route.ts`
- `src/app/api/bulk/route.ts`
- `src/lib/serverTimings.ts`
