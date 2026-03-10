---
type: bug-fix
status: draft
audience: Oak Curriculum API team
severity: medium
size: 2
---

# OpenAPI and routing issues

**Severity**: Medium
**Size**: 2

Infrastructure issues affecting API contract accuracy and response headers.

## 1. Rate-limit headers missing on bulk route

**Severity**: Medium
**Endpoint**: `POST /api/bulk`
**Internal ref**: [v0-v1-improvements.md — V0-010](../../engineering/v0-v1-improvements.md#v0-010-rate-limit-headers-on-custom-routes)

The bulk route creates a `resHeaders` object and passes it to
`protect()`, which sets `X-RateLimit-*` headers on it. However,
`resHeaders` is never attached to the final response — the rate-limit
headers are lost.

The tRPC routes handle this correctly — they create a mutable
`resHeaders` Map and apply it to the response. The asset route
(`assets/[type]/route.ts`) also correctly passes `resHeaders` to the
`NextResponse` constructor.

**Code reference**: `bulk/route.ts:38` (resHeaders created),
`bulk/route.ts:96-98` (response returned without resHeaders)

**Fix**: Pass `resHeaders` to the response constructor, matching the
asset route pattern.

## 2. Asset endpoint exports all HTTP methods

**Severity**: Low
**Endpoint**: `GET /lessons/{lesson}/assets/{type}`
**Internal ref**: [v0-v1-improvements.md — V0-011](../../engineering/v0-v1-improvements.md#v0-011-bulk-download-api-method-handling)

The asset route exports handlers for GET, POST, PUT, PATCH, DELETE,
OPTIONS, and HEAD (lines 333-341). The bulk route correctly exports
only POST.

**Fix**: Restrict asset route to GET only (and OPTIONS for CORS).

## ~~3. Binary asset endpoint documented as JSON~~

**Withdrawn.** Verified 2026-03-10: the OpenAPI schema correctly
specifies `contentTypes: ['application/octet-stream']` at
`assets.ts:640`. This claim was inaccurate.
