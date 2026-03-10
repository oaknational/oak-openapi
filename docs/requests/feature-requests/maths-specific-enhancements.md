---
type: feature-request
status: draft
audience: Oak Curriculum API team
priority: medium
size: 16
depends-on:
  - content-filtering-transparency (item 1 depends on ungating image questions)
---

# Maths-specific enhancements

## Feasibility

- **Realistic**: Yes — each item addresses a real gap in maths content
  accessibility verified against the API schema and bulk downloads.
- **Achievable**: Yes — every item below surfaces existing data or
  derives new fields from existing data.

**Goal**: Improve maths content accessibility for AI tools, quiz
validation, and domain-specific search.

## Problem

Maths content has domain-specific needs that the current API does not
address: diagram-dependent quiz questions are silently dropped, there is
no way to filter by mathematical domain (number, algebra, geometry),
transcripts lack structured timestamps, and transcript search cannot be
scoped by curriculum metadata. Each gap forces consumers to work around
missing data or accept incomplete results.

Each item below can be implemented independently. Size 13 signals
multiple independent items — split into separate tickets before
implementation.

## 1. Return image-based quiz questions (size 3)

Image/diagram questions are silently omitted for most subjects (see
[content-filtering-transparency.md](content-filtering-transparency.md)).
For maths, diagrams are essential — geometry, graphs, data handling all
depend on visual content. The image data exists; it is filtered out by
`supportsImages()`. Return them with image URLs rather than omitting.

## 2. Lesson-level thread tags (size 2)

Add `threadSlugs` array to lesson responses so consumers can filter
by mathematical domain (number, algebra, geometry, statistics) without
joining through unit→thread endpoints.

**Data source**: Units already have `threads[]` with slugs. Lessons
belong to units. The mapping is derivable.

## 3. Transcript segments (size 3)

Add `segments` array with `startMs`, `endMs`, `text` to transcripts.
The VTT format already contains timestamp data; this parses it into a
structured array.

## 4. Transcript search filters (size 3)

Add `subject`, `keyStage`, `year` filters to
`GET /search/transcripts`. Currently there is no way to scope
transcript search by curriculum metadata. The filtering data exists on
lessons; the transcript search just doesn't use it.

## 5. Maths glossary endpoint (size 5)

`GET /subjects/{subject}/keywords` aggregating keywords from lessons.
Keywords with descriptions already exist on every lesson via
`lessonKeywords[]`. A cross-year aggregation endpoint surfaces them,
grouping by keyword text.

**Backwards compatibility**: All items are additive — new optional
fields, new endpoints, or enriched responses. No changes to existing
response shapes or behaviour.

## Related

- Research archive:
  [index.md](../../.agent/external-feedback-and-requests/from-mcp-semantic-search-work/index.md)
  (item 21 — 520 lines, OpenAPI sketches for each item)
