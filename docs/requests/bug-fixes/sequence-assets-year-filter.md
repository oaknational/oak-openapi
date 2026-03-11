---
type: bug-fix
status: implemented
audience: Oak Curriculum API team
severity: medium
size: 2
---

# Sequence assets year filter ignored

**Severity**: Medium
**Size**: 2
**Endpoint**: `GET /sequences/{sequence}/assets`

## Status

**Already fixed.** Verified in current code:

- `src/lib/handlers/assets/assets.ts` extracts `year` from input and passes it
  into `sequenceWhere(sequence, year ? year.toString() : undefined)`.
- `src/lib/handlers/sequences/sequences.ts` applies `year` in `sequenceWhere()`
  via `baseWhere._and.push({ year: { _eq: year } })`.

This document remains as implementation history only.

## Evidence

- **Code proof**:
  - `src/lib/handlers/assets/assets.ts` passes `year` into `sequenceWhere(...)`.
  - `src/lib/handlers/sequences/sequences.ts` applies `year` in the GraphQL where
    clause.
- **Live MCP proof (oak-prod)**:
  - `get-sequences-assets(sequence: \"maths-primary\", year: \"1\")` returned 185
    lesson asset rows.
  - `get-sequences-assets(sequence: \"maths-primary\", year: \"2\")` returned 175
    lesson asset rows.
  - Different result sets for adjacent years confirm year filtering is active.

## Related

- Internal ref: [v0-v1-improvements.md — V0-006](../../engineering/v0-v1-improvements.md#v0-006-sequence-assets-ignore-year-filter)
