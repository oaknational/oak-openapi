# API Analytics Plan

Current wiring reviewed:

- Frontend PostHog is initialised in `src/context/AnalyticsProvider.tsx`.
- API auth is resolved in `src/lib/context.ts` (`withUser` from `Authorization: Bearer <apiKey>`).
- tRPC entrypoint is `src/app/api/v0/[...trpc]/route.ts`.
- Protected API procedures flow through `protectedProcedure` in `src/lib/protect.ts` and are declared across `src/lib/handlers/*`.

## Plan

1. Add a server-side PostHog client module for API capture.
- Create `src/lib/analytics/posthogServer.ts` with safe no-op behaviour when env is missing/non-production.
- Use server capture only (not `posthog-js`) to avoid browser-only assumptions.

2. Define one API event schema and API-key identity strategy.
- Standardise on one event name, e.g. `api_request`.
- Properties: `endpoint_path`, `http_method`, `trpc_path`, `success`, `error_code`, `duration_ms`, `user_id`, `args`, `query_params`.
- `args` should include parsed procedure input (path/query/body arguments).
- `query_params` should include URL search params for endpoints that accept query string arguments.
- Include API key as a fingerprint, not raw secret (e.g. SHA-256 + last4), and use that as `distinct_id` for anonymous/invalid-key traffic.

3. Instrument tRPC once, centrally, via middleware.
- Add a middleware in `src/lib/trpc.ts` that wraps `next()`, measures latency, and emits one PostHog event per call.
- Read route metadata from `meta.openapi` where available, otherwise fall back to `path`/request method.
- Ensure this middleware runs for both public and protected procedures.

4. Keep auth/rate-limit behaviour unchanged.
- Leave `src/lib/protect.ts` logic intact; analytics middleware should observe outcomes, not alter authorisation flow.
- Capture unauthorised and rate-limited outcomes via error code/status properties.

5. Add tRPC handler fallback for pre-procedure failures.
- In `src/app/api/v0/[...trpc]/route.ts`, use handler `onError` to capture parse/not-found failures that may occur before middleware completion.

6. Add focused tests.
- Add unit tests for middleware payload mapping and "does not throw if PostHog fails".
- Add coverage for success, unauthorised, and validation/rate-limit error events.
- Stub network capture in tests to keep test suite deterministic.

7. Update env/docs and rollout checks.
- If we introduce server-specific env names, update `.env.example` and `docs/engineering/onboarding.md`.
- Verify locally with a temporary debug logger, then confirm event ingestion in PostHog by endpoint and API-key fingerprint.

## Decisions To Confirm Before Build

1. API key in PostHog: fingerprinted only.
2. Scope for this change: tRPC endpoints plus non-tRPC API routes that use API-key auth (`/api/bulk` and `/api/v0/lessons/{lesson}/assets/{type}`).

## Implementation Checklist

- [x] Build server capture utility with API-key fingerprint helper and non-throwing behaviour.
- [x] Extend request context so analytics has access to request URL and presented API key.
- [x] Add central tRPC middleware capture for success and error outcomes.
- [x] Add tRPC handler `onError` fallback capture for pre-procedure failures.
- [x] Add or update tests to cover payload shape and failure resilience.
- [x] Update docs/env notes and mark this checklist complete at the end of the change.

## Delivered Changes

- Added `src/lib/analytics/posthogServer.ts` for server-side PostHog capture with:
  - event name `api_request`
  - fingerprinted API key identity (`sha256` prefix + key suffix)
  - `args` and `query_params` capture
  - fire-and-forget network call and guaranteed non-throwing behaviour
- Extended context in `src/lib/context.ts` to include presented API key in context (`apiKey`) and exposed `getApiKeyFromRequest`.
- Added central tRPC analytics middleware in `src/lib/trpc.ts`, applied to all `publicProcedure` and therefore all `protectedProcedure`.
- Updated `src/lib/protect.ts` so protected procedures build on the instrumented public procedure base.
- Added pre-procedure fallback capture in `src/app/api/v0/[...trpc]/route.ts` using handler `onError` for unknown/unresolved request failures.
- Added non-tRPC route capture for:
  - `src/app/api/bulk/route.ts`
  - `src/app/api/v0/lessons/[lesson]/assets/[type]/route.ts`
  Both capture API key identity, args, query params, duration, and success/error outcomes.
- Added tests in `__tests__/analytics-trpc.test.ts` covering:
  - success event capture with `args` and `query_params`
  - error event capture with `error_code`
  - resilience when analytics transport fails
- Added tests in `__tests__/non-trpc-analytics.test.ts` covering:
  - analytics capture for `/api/bulk`
  - analytics capture for lesson asset route `/api/v0/lessons/{lesson}/assets/{type}`
- Updated env/docs:
  - `.env.example`
  - `docs/engineering/onboarding.md`

## Event Schema

Event name: `api_request`

Top-level payload sent to PostHog `/capture/`:
- `api_key`: PostHog project key (`POSTHOG_API_KEY` or fallback `NEXT_PUBLIC_POSTHOG_API_KEY`)
- `event`: `api_request`
- `distinct_id`: one of:
  - `api-user:{userId}` when authenticated user is resolved
  - `api-key:{fingerprint}` when API key is present but user is not resolved
  - `api-anonymous` when no API key is present
- `properties`:
  - `endpoint_path`: API route/template path
  - `http_method`: HTTP method
  - `trpc_path`: tRPC procedure path (tRPC flows only)
  - `source`: instrumentation source (`trpc_middleware`, `trpc_on_error`, `bulk_route`, `lesson_assets_route`)
  - `success`: boolean success flag
  - `error_code`: error code when request fails
  - `duration_ms`: request duration in milliseconds
  - `user_id`: resolved user id when available
  - `api_key_fingerprint`: fingerprinted API key (`sha256:<prefix>:<last4>`)
  - `args`: parsed request/procedure arguments
  - `query_params`: parsed URL query parameters

Source mapping by route:
- tRPC procedure execution (`src/lib/trpc.ts`):
  - source: `trpc_middleware`
  - captures both success and procedure-level failures
- tRPC pre-procedure/unknown handler errors (`src/app/api/v0/[...trpc]/route.ts`):
  - source: `trpc_on_error`
  - captures unresolved/unknown-path style failures
- Bulk route (`src/app/api/bulk/route.ts`):
  - source: `bulk_route`
  - `args` from JSON body (e.g. `subjects`)
- Lesson assets route (`src/app/api/v0/lessons/[lesson]/assets/[type]/route.ts`):
  - source: `lesson_assets_route`
  - `args` from route params (`lesson`, `type`)
