---
type: feature-request
status: draft
audience: Oak Curriculum API team
priority: high
size: TBD pending audit
---

# Programme variants and identifiers

## Blockers

This request has unresolved feasibility questions that must be answered
before implementation can be sized or scheduled:

1. **Programme→sequence mapping**: Does the API team have access to the
   programme-to-sequence mapping in their data layer (Hasura views)?
   The OWA website uses this mapping, but it is not present in the
   current API schema. If unavailable via Hasura, programme endpoints
   cannot be implemented as proposed.

2. **Slug consistency audit**: Are lesson, unit, and sequence slugs
   identical across API responses, bulk downloads, and OWA URLs? No
   cross-system audit has been performed. If slugs diverge, the
   consistent-identifiers goal cannot be achieved as designed.

3. **Canonical URL map coverage**: The canonical URL map
   (`canonical-url-map.json`) contains 178 programme slugs with
   variants (exam board, tier, learning suffixes like `-l`), but does
   not include programme landing pages. Additional programme URLs
   exist beyond the map. Programme slugs cannot be derived from
   subject+keystage alone.

**Related**: See also
[bulk-download-data-enhancements.md](bulk-download-data-enhancements.md)
Phase 1 (tier/examSubject on bulk units) — overlapping fields that
should use consistent naming.

## Feasibility

- **Realistic**: Yes — the OWA website uses programme slugs in URLs but
  the API only exposes sequences. Consumers cannot construct correct OWA
  links without the mapping.
- **Achievable**: Partially.
  - **Flat tier/examBoard fields** (size 3): The data exists in
    `SequenceUnitsResponseSchema` — tiers and exam subjects are nested in
    the sequence response. Denormalising onto lesson/unit responses is
    surfacing existing data in a flatter shape.
  - **Programme endpoints** (size 5): The programme→sequence mapping
    exists (the OWA website uses it). Whether the API team has this
    mapping accessible in their data layer needs confirmation.
  - **Consistent identifiers** (size 3): Requires cross-system audit.
    The slugs exist in both systems; the question is whether they match.
- **Data source**: `SequenceUnitsResponseSchema` (tiers, exam subjects),
  `SubjectResponseSchema` (`ks4Options`), OWA URL patterns.

**Goal**: Expose programme context so consumers can generate correct
OWA website URLs and filter by tier/exam board without nested traversal.

## Problem

The API uses "sequences" internally, but the Oak website uses
"programmes" in user-facing URLs. One sequence (e.g.,
`science-secondary-aqa`) maps to 8+ programmes (Foundation/Higher x
4 exam subjects). Consumers cannot reliably construct OWA links or
filter by programme without this mapping.

Additionally, KS4 lessons lack flat `tier` and `examBoard` fields,
forcing consumers to call sequence-level endpoints and traverse nested
structures to determine which tier/board a lesson belongs to.

## Suggested approach

### 1. Programme endpoints

```
GET /programmes
GET /programmes/{programmeSlug}/units
```

These would expose the programme-level view that the OWA website uses,
allowing direct URL construction.

### 2. Flat tier and exam board fields on lessons and units

Add optional flat fields to lesson and unit responses:

```json
{
  "unitSlug": "algebraic-manipulation",
  "tier": "foundation",
  "examBoard": "aqa",
  "examSubject": "physics"
}
```

Non-KS4 resources would omit these fields.

### 3. Consistent resource identifiers

Ensure lesson slugs, unit slugs, and sequence slugs are consistent
across API responses, bulk downloads, and OWA URLs. Currently some
identifiers differ between these systems.

## Impact

- Correct OWA URL generation from API data
- KS4 filtering without nested traversal
- Consistent cross-service linking
- Simpler SDK and MCP tool implementation for KS4 content

**Backwards compatibility**: Flat tier/examBoard fields are additive
(new optional fields). Programme endpoints are new endpoints. Consistent
identifiers may require a migration path if slugs currently diverge.

## Related

- Research archive:
  [index.md](../../.agent/external-feedback-and-requests/from-mcp-semantic-search-work/index.md)
  (item 04: high-priority schema requests; item 18: programmes and identifiers examples)
