---
type: bug-fix
status: draft
audience: Oak Curriculum API team
severity: low
size: 1
---

# OpenAPI and routing issues

**Severity**: Low
**Size**: 1

Infrastructure issues affecting API contract accuracy and response headers.

## Evidence

- **Code proof (bulk headers fixed)**: `src/app/api/bulk/route.ts` now returns
  responses with `headers: resHeaders`, so headers set by `protect()` are
  attached to the response.
- **Code proof (asset route methods)**:
  `src/app/api/v0/lessons/[lesson]/assets/[type]/route.ts` exports
  `handlerWrapper` for GET/POST/PUT/PATCH/DELETE/OPTIONS/HEAD.
- **MCP surface check**: oak-prod exposes this route as `get-lessons-assets`
  (GET shape), so non-GET method export remains an implementation detail that is
  not needed for consumer behaviour.

## 1. ~~Rate-limit headers missing on bulk route~~

**Severity**: ~~Medium~~
**Endpoint**: `POST /api/bulk`
**Internal ref**: [v0-v1-improvements.md — V0-010](../../engineering/v0-v1-improvements.md#v0-010-rate-limit-headers-on-custom-routes)

**Implemented.** `src/app/api/bulk/route.ts` now returns the response with
`headers: resHeaders`, so rate-limit headers applied by `protect()` are
preserved.

## 2. Asset endpoint exports all HTTP methods

**Severity**: Low
**Endpoint**: `GET /lessons/{lesson}/assets/{type}`
**Internal ref**: [v0-v1-improvements.md — V0-010](../../engineering/v0-v1-improvements.md#v0-010-rate-limit-headers-on-custom-routes)

The route currently exports handlers for GET, POST, PUT, PATCH, DELETE,
OPTIONS, and HEAD:

`src/app/api/v0/lessons/[lesson]/assets/[type]/route.ts` exports
`handlerWrapper` for all methods at the bottom of the file.

**Fix**: Restrict asset route to GET only (and OPTIONS for CORS).

## ~~3. Binary asset endpoint documented as JSON~~

**Withdrawn.** Verified 2026-03-10: the OpenAPI schema correctly
specifies `contentTypes: ['application/octet-stream']` at
`assets.ts:640`. This claim was inaccurate.
