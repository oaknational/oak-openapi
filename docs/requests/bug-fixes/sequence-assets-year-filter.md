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

The `year` query parameter is accepted in the endpoint schema but never applied to the
underlying query. Code contains `FIXME` comments acknowledging the incomplete implementation.

**Code references**: `assets.ts:257`, `assets.ts:372`

## Expected behaviour

The endpoint should filter assets by year group when the `year` parameter is provided.
Currently it returns all assets regardless of year.

## Fix

Apply the year filter to the query logic, or remove the parameter from the OpenAPI schema
if year filtering is not intended.

**Scope**: Update filter logic (1) + tests (1).

## Related

- Internal ref: [v0-v1-improvements.md — V0-006](../../engineering/v0-v1-improvements.md#v0-006-sequence-assets-ignore-year-filter)
