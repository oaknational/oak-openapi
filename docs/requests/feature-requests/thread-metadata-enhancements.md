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
- **Data source**:
  - `GET /threads` returns `title` and `slug` only.
  - `GET /threads/{threadSlug}/units` returns `unitTitle`, `unitSlug`,
    `unitOrder` only.
  - `keyStageSlug` is absent from thread responses and would require join logic.

**Goal**: Enrich thread endpoints with derived aggregation fields that
help consumers understand thread coverage without N+1 calls.

## Evidence

- **Live MCP proof (oak-prod)**:
  - `get-threads` returns `title` and `slug` only.
  - `get-threads-units(thread: "number")` returns unit rows with
    `unitTitle`, `unitSlug`, `unitOrder`, and `canonicalUrl` (often null),
    but no `keyStageSlug` or aggregate `unitCount`.
- **Resulting gap**: consumers cannot determine key-stage coverage for a thread
  from thread endpoints alone and must join additional data.

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

- `src/lib/handlers/threads/threads.ts`
