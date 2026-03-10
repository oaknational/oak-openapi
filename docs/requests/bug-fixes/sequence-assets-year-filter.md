---
type: bug-fix
status: draft
audience: Oak Curriculum API team
severity: medium
size: 2
---

# Sequence assets year filter ignored

**Severity**: Medium
**Size**: 2
**Endpoint**: `GET /sequences/{sequence}/assets`

## Problem

The `year` query parameter is accepted in the endpoint schema but was
not applied to the underlying query.

**Code references**: `assets.ts:261` (year extracted from input),
`assets.ts:275` (year passed to `sequenceWhere()`)

**Note (2026-03-10 verification)**: The current code at line 275 does
pass `year` to `sequenceWhere()`. The original FIXME comments at
lines 257 and 372 are no longer present. The API team should verify
whether the year filter is now fully functional or if the
`sequenceWhere()` implementation still ignores it.

## Expected behaviour

The endpoint should filter assets by year group when the `year`
parameter is provided.

## Fix

Verify that `sequenceWhere()` applies the year filter correctly.
If it does, this can be marked as implemented. If not, apply the
filter or remove the parameter from the OpenAPI schema.

**Scope**: Verify existing logic (1) + tests if needed (1).

## Related

- Internal ref: [v0-v1-improvements.md — V0-006](../../engineering/v0-v1-improvements.md#v0-006-sequence-assets-ignore-year-filter)
