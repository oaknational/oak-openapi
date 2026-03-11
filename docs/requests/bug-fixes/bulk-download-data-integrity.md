---
type: bug-fix
status: draft
audience: Oak Curriculum API team
severity: medium
size: 3
---

# Bulk download data integrity

**Internal ref**: [v0-v1-improvements.md — V0-011 through V0-014](../../engineering/v0-v1-improvements.md#v0-011-bulk-download-api-method-handling)

Audit and correction of data quality issues in bulk download files.

This file now includes only evidence-backed consistency issues. Items that
require dataset-specific examples are deferred until reproducible payloads are
attached.

## Evidence

- **Code/schema proof (referential integrity check missing)**:
  the same bulk schema contains an explicit TODO to validate joins between
  `sequence[].unitLessons[]` and `lessons[]`, confirming this is not currently
  enforced by schema validation.
- **Code-path proof (exam board dedup risk area)**:
  bulk unit assembly and exam-board aggregation occurs in
  `src/lib/bulk-data/get-data.ts` (`getAllSequenceData`) and is the correct
  location for explicit deduplication by slug.
- **Deferred-investigation rule**: any claim about missing records stays deferred
  until backed by reproducible API/bulk payload pairs.

---

## Known fixes (clear bugs, malformations)

These are definite issues in the bulk export process. Fix location: `prepare-bulk.ts`.

### 1. Duplicated exam boards

**Severity**: Medium
**Size**: 1 (deduplication logic in `prepare-bulk.ts`)

Science KS4 units contain massively duplicated `examBoards` arrays.
Example: 12 entries instead of 3 unique boards (4x duplication per board).

```json
"examBoards": [
  {"title": "Edexcel", "slug": "edexcel"},
  {"title": "Edexcel", "slug": "edexcel"},
  {"title": "Edexcel", "slug": "edexcel"},
  {"title": "Edexcel", "slug": "edexcel"},
  {"title": "OCR", "slug": "ocr"},
  {"title": "AQA", "slug": "aqa"}
]
```

Expected: 3 unique entries (one per board).

**Fix**: Add deduplication by `slug` in the unit transformation step.

### 2. Referential integrity not validated in schema

**Severity**: Medium
**Size**: 1

The bulk schema includes a TODO for cross-array integrity checks but does not
enforce them:

- `unitLessons[].lessonSlug` should exist in `lessons[]` for published lessons.
- `lessons[].unitSlug` should exist in `sequence[].unitSlug`.

This leaves consumers to detect broken joins at ingest time.

**Fix**: Add explicit validation in bulk generation and fail export if broken.

---

## Feature Requests (data exists; requesting inclusion in bulk or API)

See separate feature request documents:

- [bulk-download-data-enhancements.md](../feature-requests/bulk-download-data-enhancements.md)
  (tier, examSubject, categories, unitOptions, canonicalUrl)

---

## Summary by Type

- Known fixes: 2 (~2 points, parallel in one PR)
- Deferred investigations (need examples): 3 (TBD after evidence)

**Total scope for API team**: implement known fixes first; only re-open deferred
investigations when reproducible examples are attached.

## Deferred investigations (re-open only with examples)

The following themes were raised but are intentionally removed from the
actionable scope until we have concrete examples (request/response payloads and
affected slugs):

1. Missing transcripts in primary maths.
2. Missing threads and/or descriptions on secondary units.
3. Missing lesson records referenced by units.

## Related

- [bulk-download-data-enhancements.md](../feature-requests/bulk-download-data-enhancements.md)
