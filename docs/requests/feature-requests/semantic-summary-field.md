---
type: feature-request
status: draft
audience: Oak Curriculum API team
priority: high
size: 5
depends-on:
  - bulk-download-data-integrity audit item 6 (incomplete transcripts produce incomplete summaries)
---

# Semantic summary field

## Feasibility

- **Realistic**: Yes — the search CLI already generates these summaries
  client-side from existing metadata fields. Having them pre-computed
  benefits all API consumers, not just the search CLI.
- **Achievable**: Yes — every constituent field already exists in both
  API and bulk: `lessonTitle`, `lessonKeywords`, `keyLearningPoints`,
  `misconceptionsAndCommonMistakes`, `teacherTips`,
  `priorKnowledgeRequirements` (on units), and transcript text
  (API field: `transcript`; bulk field: `transcript_sentences`).
  This is a structured concatenation of existing fields, not new data.
- **Data source**: `LessonSummaryResponseSchema` + `UnitSummaryResponseSchema`
  + bulk download lesson/unit fields.
- **Note**: The search CLI's `buildLessonSemanticSummary()` already
  implements the generation logic. The API team could adopt a similar
  approach or a simpler concatenation.

**Goal**: Add a pre-computed `semantic_summary` field to lessons (and
optionally units) for efficient embedding and semantic search.

## Problem

Full transcripts are 5,000+ tokens — too long for effective vector
embeddings. Titles are ~10 tokens — too short for semantic signal.
There is no middle-ground representation optimised for search,
reranking, or retrieval-augmented generation.

## Suggested approach

A ~150-250 token summary per lesson, composed from existing metadata:

```json
{
  "lessonSlug": "adding-fractions-same-denominator",
  "lessonTitle": "Adding fractions with the same denominator",
  "semantic_summary": "This KS2 maths lesson teaches Year 4 students to add fractions with common denominators. Students learn that when denominators match, only numerators are added. Key vocabulary includes numerator, denominator, and proper fraction. Prior knowledge: understanding fractions as parts of a whole."
}
```

**Composition**: title + keywords + learning objectives + key vocabulary
- prior knowledge + common misconceptions + transcript excerpt.

This could be:

- Generated at build time from existing lesson metadata (no AI needed —
  it is a structured concatenation of fields that already exist)
- Added to both API responses and bulk downloads
- Used directly as embedding input without further processing

## Impact

- Enables high-quality semantic search without full transcript processing
- Optimal density for vector embeddings and reranking
- Useful for RAG context windows
- Benefits both API consumers and bulk download users

**Backwards compatibility**: Additive only — new optional field on
existing lesson (and optionally unit) responses. Existing consumers
are unaffected.

**Naming convention note**: The example uses `semantic_summary`
(snake_case). The API convention is camelCase (`semanticSummary`);
the bulk download convention is snake_case (`semantic_summary`). The
API team should decide which convention to use in each context.

## Related

- Research archive:
  [index.md](../../.agent/external-feedback-and-requests/from-mcp-semantic-search-work/index.md)
  (item 02: semantic summary field design; item 19: field availability analysis)
