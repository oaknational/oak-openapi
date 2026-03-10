---
type: feature-request
status: draft
audience: Oak Curriculum API team
priority: medium
size: 3
---

# Thread metadata enhancements

## Feasibility

- **Realistic**: Yes — consumers currently must call `/threads`, then
  `/threads/{thread}/units`, then inspect each unit's key stage
  just to find which key stages a thread covers.
- **Achievable**: Yes — both fields are derivable from existing
  thread→unit relationships, though the derivation path requires
  joining through unit detail data.
- **Data source**: `ThreadUnitsResponseSchema` returns units with
  `unitTitle`, `unitSlug`, and `unitOrder`. **Note**: `keyStageSlug`
  is NOT present in the thread units response — deriving
  `keyStagesCovered` requires joining thread units to unit detail
  data (e.g., via `GET /units/{unit}/summary` or bulk download unit
  records which include `keyStageSlug`). `unitCount` is directly
  derivable from the thread units array length.

**Goal**: Enrich thread endpoints with derived aggregation fields that
help consumers understand thread coverage without N+1 calls.

## Problem

`GET /threads` currently returns only `slug` and `title`. Consumers
cannot determine which key stages a thread covers or how many units it
contains without calling additional endpoints and manually aggregating.

## Suggested approach

Enrich the thread response with derived fields:

```json
{
  "threads": [{
    "slug": "number",
    "title": "Number",
    "keyStagesCovered": ["ks1", "ks2", "ks3", "ks4"],
    "unitCount": 118
  }]
}
```

Both fields are derivable from the existing thread→unit relationships
that `/threads/{thread}/units` already exposes.

## Impact

- Reduces discovery overhead for thread-based navigation
- Enables search faceting by thread coverage

**Backwards compatibility**: Additive only — new optional fields on
existing thread response. Existing consumers are unaffected.

## Related

- Research archive:
  [index.md](../../.agent/external-feedback-and-requests/from-mcp-semantic-search-work/index.md)
  (item 05: medium-priority metadata extensions; item 17: ontology and threads examples)
