---
type: feature-request
status: draft
audience: Oak Curriculum API team
priority: medium
size: 5
---

# Schemas bundle endpoint

## Feasibility

- **Realistic**: Yes — the SDK currently rehydrates Zod from OpenAPI,
  losing `transform`, `refine`, and branded types. Real validation drift.
- **Achievable**: Yes — the Zod schemas already exist internally in the
  API codebase. This is surfacing existing internal artifacts, not
  creating new data.
- **Data source**: Internal Zod schema definitions used for request/response
  validation.

**Goal**: Expose the API's internal Zod validators so consuming
applications can use identical validation logic without rehydrating
from OpenAPI.

## Problem

The API defines Zod schemas internally. Consuming SDKs currently
rehydrate validation from the OpenAPI spec, losing fidelity — Zod
features like `transform`, `refine`, and branded types are not
representable in JSON Schema. This creates subtle type mismatches
between what the API validates and what consumers validate.

## Suggested approach

```
GET /api/v0/schemas
```

```json
{
  "version": "v0",
  "generatedAt": "2025-01-05T12:00:00Z",
  "schemas": {
    "LessonSummaryResponse": {
      "zodSource": "export const lessonSummaryResponseSchema = z.object({ ... })",
      "jsonSchema": { "type": "object", "properties": {} }
    }
  }
}
```

This could also be a static artifact generated at build time rather
than a live endpoint.

## Impact

- SDK/MCP engineers reuse exact API validators
- Eliminates validation drift between API and consumers
- Optional runtime checks for consumers who want them

**Backwards compatibility**: Additive only — new endpoint (or build
artifact) with no effect on existing endpoints or consumers.

**Security/licensing consideration**: Exposing Zod source definitions
may reveal internal validation logic. The API team should review whether
this creates any unintended disclosure. For a public curriculum API the
risk is low, but a licensing review of any third-party schema
dependencies is recommended before shipping.

## Related

- Research archive:
  [index.md](../../.agent/external-feedback-and-requests/from-mcp-semantic-search-work/index.md)
  (item 09: schemas endpoint RFC; item 20: validation and schema examples)
