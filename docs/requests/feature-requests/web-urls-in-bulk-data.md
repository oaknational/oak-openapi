---
type: feature-request
status: draft
audience: Oak Curriculum API team
priority: high
size: 5
depends-on:
  - web-urls-in-api-responses (align URL semantics and naming)
---

# Web URLs in bulk data

## Feasibility

- **Realistic**: Yes - bulk consumers need stable web links without relying on
  live API calls or local URL-construction heuristics.
- **Achievable**: Yes - bulk generation already includes some `canonicalUrl`
  fields and can be extended during export generation.
- **Data source**:
  - Bulk generation pipeline in `prepare-bulk.ts` and bulk-data transforms.
  - Website routing patterns for resources that exist on
    `www.thenational.academy`.

**Goal**: Ensure every bulk resource that has a corresponding page on
`www.thenational.academy` includes that web URL in the bulk payload.

## Problem

Bulk files are designed for offline ingestion, but URL availability is not
consistently guaranteed across all resource types. Consumers currently need to:

1. build custom URL constructors; or
2. call live API endpoints during ingestion to fill URL gaps.

That undermines the goal of bulk-first, offline-capable pipelines.

## Evidence

- **Live MCP proof (oak-prod)**:
  - `get-sequences-assets(sequence: "maths-primary", year: "1")` returns
    lesson-level `canonicalUrl`.
  - URL presence is proven possible in serving-layer outputs, but not yet a
    clearly defined bulk-wide contract.
- **Current request dependency**:
  - `bulk-download-data-enhancements.md` currently treats canonical URL work as a
    sub-phase; this request separates it as a standalone deliverable.

## Suggested approach

- Add a standard URL field (prefer existing `canonicalUrl`) to bulk entities
  with corresponding website pages.
- Keep naming and semantics aligned with API responses.
- During bulk generation, validate URL coverage for eligible resource types and
  fail generation when required URL fields are unexpectedly missing.
- Document URL coverage guarantees in bulk schema docs.

## Impact

- Fully offline ingestion with direct website linking.
- No per-consumer URL reconstruction logic.
- Better consistency between bulk and API outputs for cross-channel clients.

**Backwards compatibility**: Additive only - URL fields added to existing bulk
records and schema.

## Related

- [web-urls-in-api-responses.md](web-urls-in-api-responses.md)
- [bulk-download-data-enhancements.md](bulk-download-data-enhancements.md)
