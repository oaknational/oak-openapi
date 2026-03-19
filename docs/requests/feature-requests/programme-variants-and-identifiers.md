---
type: feature-request
status: draft
audience: Oak Curriculum API team
priority: high
size: 5
---

# Programme variants and identifiers

## Feasibility

- **Realistic**: Partially - current API surfaces some variant context
  (tiers/exam-subject groupings in sequence responses) but does not expose a
  programme-level API model.
- **Achievable**: Partially.
  - Lesson search responses already include `examBoardTitle` in nested unit
    data.
  - Sequence responses already include tiers and exam-subject groupings.
  - There is no `/programmes` endpoint in current handlers.
- **Data source**:
  - `src/lib/handlers/sequences/sequences.ts`
  - `src/lib/handlers/lesson/lesson.ts`
  - `src/lib/handlers/keyStageSubjectLessons/keyStageSubjectLessons.ts`

**Goal**: clarify where programme-level context is genuinely missing and avoid
requesting fields that already exist.

## Evidence

- **Live MCP proof (oak-prod)**:
  - `get-subjects` returns `sequenceSlugs[]` with `ks4Options` and
    subject-level `canonicalUrl`.
  - `get-sequences-units(sequence: "maths-secondary", year: "10")` returns
    top-level `tiers[]`.
  - `get-sequences-units(sequence: "science-secondary-aqa", year: "10")`
    returns `examSubjects[]` with nested `tiers[]`.
- **Gap confirmation**: there is no first-class programme fetch/list tool in the
  current oak-prod MCP toolset; consumers infer programme context from sequence +
  KS4 option structures.

## Verified current state

1. **No programme endpoints today**

- No `/programmes` route exists in the OpenAPI handlers.
- Existing routes are sequence-, unit-, lesson-, and key-stage/subject-oriented.

2. **Some identifier context already exists**

- Lesson search includes `examBoardTitle` in each unit entry.
- Sequence units include tier and exam-subject structure, but nested.

## Suggested approach

### 1. Keep canonical URL work in bulk enhancements

- Canonical URL generation remains the core cross-system need.
- Do not duplicate URL-construction work here.

### 2. Reduce to one actionable API task

If still needed after migration: add a lightweight identifier mapping endpoint
or endpoint field for programme context, but only after confirming data-layer
availability.

## Impact

- Keeps this request aligned to real API gaps.
- Avoids proposing endpoints that may not be supportable pre-migration.

**Backwards compatibility**: Additive only for any future mapping field/endpoint.

## Related

- [bulk-download-data-enhancements.md](bulk-download-data-enhancements.md)
