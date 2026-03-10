---
type: bug-fix
status: draft
audience: Oak Curriculum API team
severity: mixed (see items)
size: 13
---

# Bulk download data integrity

**Internal ref**: [v0-v1-improvements.md — V0-011 through V0-014](../../engineering/v0-v1-improvements.md#v0-011-bulk-download-api-method-handling)

Audit and correction of data quality issues in bulk download files.
Issues fall into four categories: known fixable bugs, known intentional omissions,
data gaps requiring upstream audit, and feature requests for additional data inclusion.

---

## Known Fixes (clear bugs, malformations)

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

### 2. String "NULL" instead of JSON null

**Severity**: Low
**Size**: 1

`contentGuidance` and `supervisionLevel` use the string `"NULL"` instead of JSON `null`
when no value is present. Consumers must check for both string and null.

**Note**: The schema type for `contentGuidance` is `array|null` (array of
objects, or null). The string `"NULL"` issue is a data quality problem in
actual exported values, not a schema definition issue.

**Fix**: Normalize to JSON `null` in `prepare-bulk.ts`.

### 3. Inconsistent field name casing

**Severity**: Low
**Size**: 1

`downloadsavailable` (all lowercase) diverges from the `camelCase` convention used by
every other field. (The API uses `downloadsAvailable`.)

**Fix**: Rename to `downloadsAvailable` in bulk export schema and transformation.

### 4. Null titles with populated slugs

**Severity**: Low
**Size**: 1

Some units in the bulk download have `null` titles but valid slugs. Consumers must
fall back to slugs for display or skip records with missing titles.

**Fix**: Audit upstream data. If units without titles exist in the API, bulk export
must decide: include with title fallback logic, or exclude.

---

## Known Intentional Omissions (data doesn't exist by design)

These are not bugs. The data is absent because of legitimate constraints or design decisions.

### 5. No transcripts for Modern Foreign Languages (MFLs)

**Rationale**: MFL videos are bilingual (English + target language). Creating
accurate transcripts for bilingual video is technically and logistically complex.
These transcripts do not exist in the curriculum data.

**Impact**: MFL lessons in bulk downloads have `transcript_sentences` and `transcript_vtt`
as `null`. This is correct and expected.

**Action**: Document as intentional omission in the bulk schema or API documentation.

---

## Audits Needed (unclear if intentional exclusion or data gap)

These items require investigation to determine whether they are intentional
omissions (data doesn't exist upstream) or accidental gaps (data exists in API
but is missing from bulk export).

### 6. Missing transcripts in primary maths

**Severity**: Medium
**Size**: 3 (audit + fix or documentation)

**Observation**: Some primary maths lessons have transcripts available via the API
but are missing from the bulk download.

**Questions for API team**:
- Are all primary maths lessons with transcripts in the API also in the bulk export?
- If not, are the missing ones intentionally excluded (e.g., copyright, third-party video)?
- If accidental, they should be included in bulk export.
- If intentional, can the API team document which lessons/subjects are affected and why?

**Possible outcomes**:
- If data gap in bulk export: add to bulk export pipeline (size 2)
- If intentional exclusion: document in schema (size 1)
- If copyright restriction: decide whether to include with licensing metadata (size 3)

### 7. Missing threads and empty descriptions on secondary units

**Severity**: Medium
**Size**: 3 (audit + fix or documentation)

**Observation**: Secondary units in the bulk download are missing:
- `threads` associations (present in API `UnitSummaryResponseSchema`)
- Non-empty `description` fields (present in API responses)

**Questions for API team**:
- Are secondary unit threads present in the API but omitted from bulk export?
- Are descriptions present in the API but empty/omitted in bulk export?
- If omitted, is this intentional (performance, licensing, or design)?
- If accidental, they should be added to bulk export.

**Possible outcomes**:
- If data gap in bulk export: add threads and descriptions to bulk pipeline (size 2)
- If intentional: document rationale in schema (size 1)
- If performance concern: discuss whether lazy-loading or pagination is needed (size 5)

### 8. Missing lesson records referenced by units

**Severity**: High
**Size**: 3 (audit + fix)

**Observation**: Some unit records in `sequence[].unitLessons[]` reference lesson slugs
that have no corresponding entry in `lessons[]`.

**Questions for API team**:
- Are the referenced lessons published in the API?
- If yes, why are they missing from bulk export? (Filter logic bug? Unpublished state?)
- If no, is the unit→lesson reference incorrect upstream?

**Impact**: This breaks joins during ingestion and causes silent data loss. High priority.

**Expected fix**: Verify referential integrity upstream; fix bulk export filter logic if needed.

---

## Feature Requests (data exists; requesting inclusion in bulk or API)

See separate feature request documents:
- [bulk-download-data-enhancements.md](../feature-requests/bulk-download-data-enhancements.md)
  (tier, examSubject, categories, unitOptions, canonicalUrl)

---

## Summary by Type

| Type | Count | Effort |
|------|-------|--------|
| Known fixes | 4 | ~4 points (parallel, all in one PR) |
| Known omissions | 1 | ~1 point (documentation only) |
| Audits needed | 3 | ~9 points (investigation + fix) |

**Total scope for API team**: Clarify the 3 audits first; fixes will follow naturally from audit findings.

## Related

- Research archive:
  [index.md](../../.agent/external-feedback-and-requests/from-mcp-semantic-search-work/index.md)
  (item 15: bulk download integrity examples and field-level analysis)
