# Deep dive: content gating + licensing rules

Version framing
- The public API is v0 (public alpha moving toward public beta); prioritize V0 critical fixes first.
- V1 improvements are deeper refinements after v0 stability goals; see `.agent/summary/analysis/versioned-improvements.md` for the split.

Scope
- License and content gating logic for lessons, units, assets, transcripts, questions, and sequences.
- Allowlist/denylist sources and where rules are applied.

Primary sources
- `src/lib/queryGate.ts`
- `src/lib/queryGateData/*`
- `src/lib/blockedContent.ts`
- Handlers: lessons, units, assets, transcripts, questions, sequences.

Gating flow (lesson assets/transcripts)
```
Lesson request
  |
  v
checkLessonAllowedAsset
  |
  +--> blockedLessons? -> deny
  +--> subject/unit lookup
  +--> blockedUnits? -> deny
  +--> allow if subject supported OR unit supported OR lesson supported
```

Gating flow (lesson summary)
```
Lesson summary
  |
  v
blockLessonForCopyrightText
  |
  +--> supportedLessons? -> allow
  +--> subject/unit lookup
  +--> blockedSubjects + not supportedUnits -> deny
```

Gating sources
- Subject allowlist: `supportedSubjects = ['maths']` (hard-coded).
- Subject denylist: `blockedSubjects = ['english', 'financial-education']`.
- Sequence denylist: `blockedSequenceSubjects = ['rshe-pshe']`.
- Unit allowlist: `supportedUnits.json`.
- Lesson allowlist: `supportedLessons.json`.
- Asset denylist: `assets/blockedLessons.json`, `assets/blockedUnits.json`.
- Placeholder videos: `placeholderVideoLessons.json`.

Where gating is applied
- Lessons summary: `src/lib/handlers/lesson/lesson.ts` (blockLessonForCopyrightText).
- Units summary: `src/lib/handlers/units/units.ts` (blockUnitForCopyrightText).
- Assets: `src/lib/handlers/assets/assets.ts` and asset streaming route.
- Transcripts: `src/lib/handlers/transcript/transcript.ts` (checkLessonAllowedAsset).
- Questions: `src/lib/handlers/questions/questions.ts` (isBlockedUnitOrSubject + allowedUnits fallback).
- Sequences: `src/lib/handlers/sequences/sequences.ts` (blockedSequenceSubjects).

Findings (high-impact)
- Gating rules are distributed across multiple lists and functions, which can lead to inconsistent behavior across endpoints (lesson summary vs transcript vs assets vs questions). This can increase licensing compliance risk and make client behavior less predictable.
  - Evidence: `src/lib/queryGate.ts`, handlers listed above.

Findings (medium)
- Multiple independent allow/deny lists exist (subjects, units, lessons, sequences, asset-specific blocks, placeholder videos) without a single source of truth or versioning.
- The allowlist logic differs by endpoint (e.g., question endpoints use `allowedUnits` when subject is blocked, while assets/transcripts use `checkLessonAllowedAsset`).

Recommendations

V0/V1 alignment
- V0: prioritize fixes that improve correctness, safety, and client trust.
- V1: schedule deeper refactors and enhancements after V0 stability goals are met.

- Centralize gating logic into a single policy layer with explicit rule precedence and clear documentation.
- Normalize gating decisions by endpoint type (lesson summary, assets, transcripts, questions, sequences).
- Add a versioned configuration file for allow/deny lists and provide a way to audit changes.

Evidence list
- `src/lib/queryGate.ts`
- `src/lib/queryGateData/*`
- `src/lib/blockedContent.ts`
- `src/lib/handlers/lesson/lesson.ts`
- `src/lib/handlers/units/units.ts`
- `src/lib/handlers/assets/assets.ts`
- `src/lib/handlers/transcript/transcript.ts`
- `src/lib/handlers/questions/questions.ts`
- `src/lib/handlers/sequences/sequences.ts`
