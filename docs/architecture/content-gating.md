# Content gating and licensing rules

Purpose
- Document how allow/deny lists restrict content and where gating is applied.

Version framing
- The public API is v0 (public alpha moving toward public beta).
- V0 items focus on correctness and trust; V1 items are deeper refinements after v0 stability.

Gating flow (lesson assets and transcripts)
```text
Lesson request
  |
  v
checkLessonAllowedAsset
  |
  +--> blockedLessons? -> deny
  +--> subject/unit lookup
  +--> blockedUnits? -> deny
  +--> allow if subject OR unit OR lesson is allowlisted
```

Gating flow (lesson summary)
```text
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
- Subject allowlist: `supportedSubjects`.
- Subject denylist: `blockedSubjects`.
- Sequence denylist: `blockedSequenceSubjects`.
- Unit allowlist: `supportedUnits.json`.
- Lesson allowlist: `supportedLessons.json`.
- Asset denylist: `assets/blockedLessons.json`, `assets/blockedUnits.json`.
- Placeholder videos: `placeholderVideoLessons.json`.

Where gating is applied
- Lessons summary: `src/lib/handlers/lesson/lesson.ts`.
- Units summary: `src/lib/handlers/units/units.ts`.
- Assets: `src/lib/handlers/assets/assets.ts` and the asset streaming route.
- Transcripts: `src/lib/handlers/transcript/transcript.ts`.
- Questions: `src/lib/handlers/questions/questions.ts`.
- Sequences: `src/lib/handlers/sequences/sequences.ts`.

V0/V1 alignment
- V0: reduce inconsistent behavior between endpoints and document the current rules clearly.
- V1: centralize gating policy with explicit precedence and versioned config.

Related ADRs
- [docs/architecture/decision-records/0012-content-gating-allowlists.md](docs/architecture/decision-records/0012-content-gating-allowlists.md)

Related docs
- [docs/architecture/runtime-architecture.md](docs/architecture/runtime-architecture.md)
- [docs/architecture/data-sources.md](docs/architecture/data-sources.md)
