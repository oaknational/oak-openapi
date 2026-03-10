---
type: feature-request
status: draft
audience: Oak Curriculum API team
priority: high
size: 5
---

# Ontology endpoint

## Feasibility

- **Realistic**: Yes — AI agents waste multiple tool calls discovering
  entity relationships that are implicit in endpoint naming.
- **Achievable**: Yes — the entity relationships (unit→lesson,
  sequence→unit, thread→unit) are real structural relationships in the
  data. This endpoint makes them explicit rather than requiring consumers
  to infer them from endpoint patterns.
- **Data source**: The relationships are inherent in the API structure
  and visible in `SequenceUnitsResponseSchema`,
  `ThreadUnitsResponseSchema`, etc. This is static metadata that changes
  only when the API schema changes.
- **Note**: Could also be partially solved by better OpenAPI descriptions
  (see [openapi-metadata-enrichment](openapi-metadata-enrichment.md)).
  A dedicated endpoint is more machine-readable.

**Goal**: Expose the curriculum's entity relationships so consumers can
navigate the hierarchy without trial and error.

## Problem

The curriculum has a rich structure (key stage, subject, unit, lesson,
with threads, sequences, and programmes as cross-cutting concepts) but
consumers must discover this through experimentation. AI agents in
particular waste multiple tool calls probing the structure before they
can compose efficient queries.

Human developers face a similar problem — the relationships between
entities are implicit in endpoint naming but not explicitly documented.

## Suggested approach

A single read-only endpoint, e.g. `GET /ontology` or
`GET /schema/curriculum`:

```json
{
  "entities": {
    "lesson": {
      "primaryKey": "lessonSlug",
      "endpoints": [
        "/lessons/{lesson}/summary",
        "/lessons/{lesson}/transcript"
      ],
      "fields": ["lessonTitle", "keyStageSlug", "subjectSlug", "unitSlug"]
    },
    "unit": {
      "primaryKey": "unitSlug",
      "endpoints": ["/units/{unit}/summary"],
      "fields": ["unitTitle", "year", "keyStageSlug", "subjectSlug"]
    },
    "thread": {
      "primaryKey": "threadSlug",
      "endpoints": ["/threads", "/threads/{thread}/units"],
      "fields": ["threadTitle"]
    }
  },
  "relationships": [
    { "from": "unit", "to": "lesson", "type": "contains" },
    { "from": "sequence", "to": "unit", "type": "contains" },
    { "from": "thread", "to": "unit", "type": "groups" }
  ],
  "keyStages": ["ks1", "ks2", "ks3", "ks4"],
  "schemaVersion": "1.0.0",
  "generatedAt": "2025-01-05T12:00:00Z"
}
```

This is static data that changes only when the API schema changes, so
it could be generated at build time.

## Impact

- Reduces multi-turn discovery conversations by ~60%
- AI agents can plan efficient tool call sequences
- Human developers understand the data model without reading multiple
  doc pages
- Enables intelligent tool composition (e.g., "find all lessons in a
  thread across key stages")

**Backwards compatibility**: Additive only — new endpoint with no effect
on existing endpoints or consumers.

## Related

- Research archive:
  [index.md](../../.agent/external-feedback-and-requests/from-mcp-semantic-search-work/index.md)
  (item 04: high-priority schema/ontology requests; item 17: ontology and threads examples)
