---
type: feature-request
status: draft
audience: Oak Curriculum API team
priority: medium
size: 3
---

# Subject keywords endpoint

## Feasibility

- **Realistic**: Yes - consumers need a subject-level keyword index without
  crawling every lesson.
- **Achievable**: Yes - lesson summaries already expose `lessonKeywords`.
- **Data source**: `GET /lessons/{lesson}/summary` includes `lessonKeywords`;
  lesson listing endpoints provide lesson slugs by key stage and subject.

**Goal**: Provide a single endpoint to list deduplicated curriculum keywords for
one subject (optionally by key stage and year).

## Evidence

- **Live MCP proof (oak-prod)**:
  - `get-key-stages-subject-lessons(keyStage: "ks2", subject: "maths", limit: 5)`
    returns lesson slugs but no consolidated subject keyword index.
  - `get-lessons-summary(lesson: "joining-using-and")` returns
    `lessonKeywords[]` for a single lesson.
- **Current consumer path**: list lessons first, then fetch each lesson summary
  to aggregate keywords. The endpoint proposed here would remove that N+1 pattern.

## Problem

Consumers currently build keyword indexes via N+1 fetches:

1. list lessons for a subject/key stage;
2. call lesson summary for each lesson;
3. aggregate and deduplicate keyword terms.

This is slow, repetitive, and easy to get wrong.

## Suggested approach

Add:

`GET /subjects/{subject}/keywords`

Optional query params:

- `keyStage`
- `year`

Example shape:

```json
{
  "subjectSlug": "maths",
  "keywords": [
    { "keyword": "denominator", "description": "The bottom number in a fraction." }
  ]
}
```

## Impact

- Faster keyword discovery for search and UX features.
- Removes repeated consumer-side aggregation code.

**Backwards compatibility**: Additive only - new endpoint, no breaking changes.

## Related

- [openapi-metadata-enrichment.md](openapi-metadata-enrichment.md)
