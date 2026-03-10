---
type: bug-fix
status: draft
audience: Oak Curriculum API team
severity: medium
size: 3
---

# OpenAPI and routing issues

**Severity**: Medium
**Size**: 3

Infrastructure issues affecting API contract accuracy and response headers.

## 1. Swagger JSON route mutates shared document

**Severity**: Medium
**Endpoint**: `GET /api/v0/swagger.json`
**Internal ref**: [v0-v1-improvements.md — V0-005](../../engineering/v0-v1-improvements.md#v0-005-swagger-json-route-mutates-the-shared-openapi-document)

The route directly mutates the shared `openApiDocument` singleton to
strip internal tags. This mutation persists across requests, causing
inconsistent behaviour in serverless environments where the singleton
may or may not be reused.

**Code reference**: `swagger.json/route.ts:6-21`

**Fix**: Deep-clone the document before modification, or use a filter
function during JSON serialisation.

## 2. Rate-limit headers missing on custom routes

**Severity**: Medium
**Endpoints**: `GET /api/bulk`, `GET /lessons/{lesson}/assets/{type}`
**Internal ref**: [v0-v1-improvements.md — V0-010](../../engineering/v0-v1-improvements.md#v0-010-rate-limit-headers-on-custom-routes)

Custom (non-tRPC) routes pass the request headers object as response
headers. The rate-limit middleware writes to the immutable request
headers, silently failing. Clients never receive `X-RateLimit-*`
headers on these routes.

The tRPC routes handle this correctly — they create a mutable
`resHeaders` Map and apply it to the response.

**Code references**: `bulk/route.ts:24`,
`assets/[type]/route.ts:31`

**Fix**: Create a proper response headers object matching the tRPC
route pattern.

## 3. Bulk download endpoint accepts all HTTP methods

**Severity**: Low
**Endpoint**: `POST /api/bulk`
**Internal ref**: [v0-v1-improvements.md — V0-011](../../engineering/v0-v1-improvements.md#v0-011-bulk-download-api-method-handling)

The route exports handlers for all HTTP methods but unconditionally
calls `req.json()`. GET/HEAD requests have no body, causing parse
errors.

**Fix**: Restrict to POST only, or check method before parsing body.

## 4. Binary asset endpoint documented as JSON

**Severity**: Medium
**Endpoint**: `GET /lessons/{lesson}/assets/{type}`
**Internal ref**: V0-016 (see [v0-v1-improvements.md](../../engineering/v0-v1-improvements.md))

The OpenAPI schema describes the asset download response as
`application/json`, but the endpoint returns binary data
(`application/octet-stream`). This causes generated validators
and SDK type expectations to be incorrect.

**Fix**: Update the OpenAPI response schema to use the correct
content type.
