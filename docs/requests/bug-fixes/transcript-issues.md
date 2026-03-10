---
type: bug-fix
status: draft
audience: Oak Curriculum API team
severity: high
size: 3
---

# Transcript issues

**Severity**: High (highest of three items)
**Size**: 3

Three related issues with transcript endpoints.

## 1. Null VTT crash

**Severity**: High
**Endpoint**: `GET /lessons/{lesson}/transcript`
**Internal ref**: [v0-v1-improvements.md — V0-009](../../engineering/v0-v1-improvements.md#v0-009-transcript-endpoint-crashes-on-null-vtt)

The endpoint calls `vtt.replace()` without null-checking. If the
`vtt` field is null (which it is for some lessons), this throws a
runtime error instead of returning an empty or absent transcript.

**Note**: The API schema field is `vtt`; the corresponding bulk
download field is `transcript_vtt`.

**Code reference**: `transcript.ts:60`

**Fix**: Add null guard: `vtt?.replace(/\r/g, '') ?? ''`

## 2. Search result ordering is broken

**Severity**: Low
**Endpoint**: `GET /search/transcripts`
**Internal ref**: [v0-v1-improvements.md — V0-002](../../engineering/v0-v1-improvements.md#v0-002-transcript-search-result-ordering)

The sort logic compares `lesson_id` UUIDs against `lessonSlug` strings.
`indexOf` returns `-1` for every item, so the sort has no effect.
Results come back in database order rather than relevance order.

**Code reference**: `searchTranscripts.ts:43, 72-73`

**Fix**: Build a slug-to-index map from the ranked search results, then
sort by that map.

## 3. Empty transcripts return 200

**Severity**: Medium
**Endpoint**: `GET /lessons/{lesson}/transcript`
**Internal ref**: [v0-v1-improvements.md — V0-017](../../engineering/v0-v1-improvements.md#v0-017-transcript-endpoint-returns-200-for-missing-transcripts)

Lessons without transcripts (e.g., practical lessons with no video)
return HTTP 200 with an empty body instead of 404. Consumers cannot
distinguish "has no transcript" from "request succeeded with empty
content."

**Suggested fix**: Return 404 with a clear reason (e.g.,
`{ "error": "not_found", "reason": "no_video" }`).
