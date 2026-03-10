---
type: feature-request
status: draft
audience: Oak Curriculum API team
priority: medium
size: 5
depends-on:
  - openapi-metadata-enrichment (items 2-3 modify same OpenAPI descriptions)
---

# Content filtering transparency

## Feasibility

- **Realistic**: Yes — filtering rules already exist and are implemented in code.
  Documenting them requires no new data collection.
- **Achievable**: Yes — three separate documentation/metadata additions:
  1. Metadata in bulk downloads indicating filtered content
  2. API endpoint descriptions documenting filtering rules
  3. OpenAPI schema clarifications for intentional exclusions
- **Data source**: Existing gating logic code (`queryGate.ts`, `supportedUnits.json`,
  `supportedLessons.json`, etc.)

**Goal**: Make content filtering decisions visible to API consumers so they can predict
what data will and will not be available.

---

## Problem

Content availability is governed by overlapping filtering mechanisms that are invisible
to API consumers:

- **Subject-level blocking**: `english`, `financial-education` are excluded entirely
- **Subject-level support**: `maths` is specially supported with additional content
- **Unit-level allowlist**: `supportedUnits.json` — only these units are exposed
- **Lesson-level allowlist**: `supportedLessons.json` — only these lessons are exposed
- **Lesson-level blocklist**: `assets/blockedLessons.json` — these lessons are excluded
- **Question filtering**: Image-based quiz questions silently omitted for most subjects

These rules interact in non-obvious ways. For example, `english` is blocked at subject
level, but specific English units are allowed via the unit allowlist.

Consumers cannot predict what will be available without trial and error.

---

## Suggested approach

### 1. Bulk download metadata (size 2)

Add optional `filteringMetadata` to the bulk download schema to document what was excluded:

```json
{
  "sequenceSlug": "english-primary",
  "subjectTitle": "English",
  "sequence": [...],
  "lessons": [...],
  "filteringMetadata": {
    "subjectBlocked": false,
    "unitLevelGatingApplied": true,
    "lessonLevelGatingApplied": true,
    "imageQuestionsFiltered": true,
    "imageQuestionsFilteredCount": 47
  }
}
```

This allows bulk download consumers to understand why data is missing without inspecting
upstream code.

### 2. API endpoint descriptions (size 2)

Add clear descriptions to affected endpoints documenting filtering rules:

**`GET /lessons/{lesson}/quiz`**:
```
Returns quiz questions for the lesson.

Note: Image-based questions are excluded for subjects outside the maths allowlist.
Use GET /search/questions for subject/year/filtering options.
```

**`GET /search/lessons`**:
```
Search lessons across the curriculum.

Excluded subjects: financial-education.
Additionally filtered by: supportedUnits.json and supportedLessons.json.
```

Document the filtering hierarchy for each endpoint.

### 3. OpenAPI schema clarification (size 1)

Update the schema description to document intentional exclusions:

```yaml
/search/lessons:
  get:
    summary: Lesson search
    description: |
      Search lessons across the curriculum.

      **Intentional exclusions**:
      - financial-education subject is not available via search
      - Image-based quiz questions are omitted for most subjects
      - See bulkDownloads field for full filtering rules
```

---

## Impact

- Consumers understand why expected data is missing
- API team reduces support burden (fewer "why isn't X available?" questions)
- Bulk download consumers can audit completeness
- Enables transparent API changelog when filtering rules change

---

**Backwards compatibility**: Additive only — new optional metadata in
bulk downloads and enriched descriptions in OpenAPI. No changes to
existing response shapes or behaviour.

## Related

- Internal refs:
  - [v0-v1-improvements.md — V0-007](../../engineering/v0-v1-improvements.md#v0-007-quiz-endpoints-omit-image-based-questions-silently)
  - [v0-v1-improvements.md — V0-008](../../engineering/v0-v1-improvements.md#v0-008-content-gating-across-endpoints)
  - [v0-v1-improvements.md — V0-003](../../engineering/v0-v1-improvements.md#v0-003-searchlessons-excludes-financial-education-subject)
