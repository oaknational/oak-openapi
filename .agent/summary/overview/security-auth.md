# Security, auth, and rate limits

Version framing
- The public API is v0 (public alpha moving toward public beta); prioritize V0 critical fixes first.
- V1 improvements are deeper refinements after v0 stability goals; see [.agent/summary/analysis/versioned-improvements.md](.agent/summary/analysis/versioned-improvements.md) for the split.

API keys and users
- API keys are stored in Redis via `src/lib/apikeys.ts` with `addUser`, `updateUser`, and lookup by key/email.
- `src/app/api/admin/create-api-key/route.ts` creates a user record and returns an API key.
- Admin UI at `src/app/(pages)/admin/page.tsx` posts to the create-key endpoint.

Rate limiting
- Rate limiting is enforced in `src/lib/protect.ts` using Upstash `@upstash/ratelimit` in `src/lib/rateLimit.ts`.
- Standard limit is 1000/hour unless overridden per user; a `rateLimit` value of 0 is treated as unlimited.
- Rate-limit response headers are set on every protected request.

Admin authentication
- `src/app/middleware.ts` enforces HTTP Basic Auth for `/admin/*` and `/api/admin/*` routes, controlled by `AUTH_USERNAME` and `AUTH_PASSWORD`.

CORS and logging
- `src/lib/context.ts` sets permissive CORS headers and logs requests with userId, URL, and query parameters.
