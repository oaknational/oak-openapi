---
type: feature-request
status: draft
audience: Oak Curriculum API team
priority: high
size: 5
---

# Web URLs in API responses

## Feasibility

- **Realistic**: Yes - API consumers frequently need to deep-link users to the
  matching page on `www.thenational.academy` after selecting API resources.
- **Achievable**: Yes - parts of the API already expose `canonicalUrl`, so the
  pattern exists and can be made consistent.
- **Data source**:
  - Existing API responses that already include `canonicalUrl`.
  - Website routing patterns in Oak-Web-Application for resources that have a
    corresponding web page.

**Goal**: Ensure every API resource that has a corresponding page on
`www.thenational.academy` includes that web URL in its response payload.

## Problem

Web URL availability is inconsistent across API responses. Some resources expose
`canonicalUrl`, while others either omit it or provide it only in specific
endpoints. Consumers building integrations must either:

1. maintain custom URL construction logic; or
2. make extra API calls to find a route that includes a URL.

This creates avoidable complexity and broken-link risk.

## Evidence

- **Live MCP proof (oak-prod)**:
  - `get-lessons-summary(lesson: "joining-using-and")` includes `canonicalUrl`.
  - `get-subjects` includes subject-level `canonicalUrl`.
  - `get-threads-units(thread: "number")` returns `canonicalUrl` values that are
    often `null`, showing inconsistency for thread-linked units.
- **Current state**: URL presence is endpoint/resource-dependent rather than a
  consistent contract for all web-addressable resources.

## Suggested approach

Define one contract for web-addressable resources:

- Add a standard URL field (prefer existing `canonicalUrl`) to all resource
  responses where a corresponding website page exists.
- If no corresponding website page exists, omit the field (do not fabricate URLs).
- Document this behaviour in OpenAPI descriptions and schema examples.

Suggested rollout order:

1. lessons
2. units
3. subjects/programmes/sequences
4. thread-linked resources where applicable

## Impact

- Consumers can deep-link reliably without custom routing logic.
- Fewer integration bugs caused by URL construction drift.
- Better developer and AI agent UX when navigating between API and website.

**Backwards compatibility**: Additive only - URL fields are optional additions
to existing responses.

## Related

- [web-urls-in-bulk-data.md](web-urls-in-bulk-data.md)
- [openapi-metadata-enrichment.md](openapi-metadata-enrichment.md)
