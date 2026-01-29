# Bulk download vs API mapping guide

Version framing
- The public API is v0 (public alpha moving toward public beta); prioritize V0 critical fixes first.
- V1 improvements are deeper refinements after v0 stability goals; see [.agent/summary/analysis/versioned-improvements.md](.agent/summary/analysis/versioned-improvements.md) for the split.

Purpose
- Help integrators understand how bulk outputs relate to the live API and where differences can appear.

High-level differences (in plain terms)
- Bulk exports are snapshot-style and may include lesson metadata that the API gates in real time.
- API responses are shaped for specific use cases (grouped by year/unit, filtered by subject/sequence), while bulk outputs are per-sequence snapshots.
- Asset availability can differ from lesson metadata availability; bulk may include lesson text even when asset endpoints are gated.

Key mappings

1) Subjects, sequences, and units
- Bulk: `out/{sequence-slug}/{sequence-slug}.json` contains `sequence` (unit summaries) and sequence metadata.
- API:
  - `/subjects` and `/subjects/{subject}` list available subjects and sequences.
  - `/sequences/{sequence}/units` lists units in sequence order.
  - `/units/{unit}/summary` returns details for a single unit.

Mapping note
- Bulk sequence data roughly corresponds to `/sequences/{sequence}/units` plus unit summaries, but with a different shape.

2) Lessons
- Bulk:
  - If `INCLUDE_ASSETS=false`, lessons are collected into `lessons` inside `{sequence}.json`.
  - If `INCLUDE_ASSETS=true`, lessons are streamed to `lessons.jsonl` (current behavior) and may not appear in `{sequence}.json`.
- API:
  - `/key-stages/{keyStage}/subject/{subject}/lessons` groups lessons by unit.
  - `/lessons/{lesson}/summary` returns a single lesson summary.

Mapping note
- Bulk lessons are closer to the `/lessons/{lesson}/summary` shape, but are not grouped the same way as the list endpoint.

3) Transcripts
- Bulk: `lesson.transcript_sentences` and `lesson.transcript_vtt` in lesson records.
- API: `/lessons/{lesson}/transcript` returns `{ transcript, vtt }`.

Mapping note
- Field names differ (`transcript_sentences` vs `transcript`) but content is aligned.

4) Quiz questions
- Bulk: lesson records can include quiz data when pulled from the source views used by bulk scripts.
- API:
  - `/lessons/{lesson}/quiz` returns starter/exit quizzes.
  - `/sequences/{sequence}/questions` and `/key-stages/{keyStage}/subject/{subject}/questions` return grouped lesson quizzes.

Mapping note
- The API groups quizzes by lesson; bulk data can be used to reconstruct similar structures if needed.

5) Assets (videos, worksheets, etc.)
- Bulk:
  - Assets are packaged into tar files and referenced in lesson records as `tar-file:internal-path`.
- API:
  - `/lessons/{lesson}/assets` lists download endpoints by asset type.
  - `/lessons/{lesson}/assets/{type}` streams the asset.

Mapping note
- Bulk asset references are not URLs; they are archive references. API asset endpoints are per-lesson download URLs.

Gating and availability notes
- API gating uses `queryGate` rules and subject/unit/lesson allowlists to restrict certain content.
- Bulk export currently applies asset gating but does not yet consistently gate lesson metadata.
- Recommendation: treat bulk outputs as a fuller snapshot and rely on API gating rules when serving content via live endpoints.

Suggested integration approach
- Use bulk exports for offline analytics, indexing, or batch processing.
- Use live API endpoints for user-facing integrations where gating must be enforced in real time.
- If strict alignment is required, apply the same gating rules in bulk processing or document the exceptions.
