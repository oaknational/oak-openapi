# API handlers and endpoint groups

Version framing
- The public API is v0 (public alpha moving toward public beta); prioritize V0 critical fixes first.
- V1 improvements are deeper refinements after v0 stability goals; see `.agent/summary/analysis/versioned-improvements.md` for the split.

tRPC router composition
- `src/lib/router.ts` aggregates handlers into `getSequences`, `getLessonTranscript`, `searchTranscripts`, `getAssets`, `getSubjects`, `getKeyStages`, `getKeyStageSubjectLessons`, `getAllKeyStageAndSubjectUnits`, `getQuestions`, `getLessons`, `getUnits`, `getThreads`, `changelog`, and `getRateLimit`.

Key endpoint groups (by handler)
- Lists and lookup
  - Subjects, key stages, threads, key stage/subject units and lessons.
  - Files: `src/lib/handlers/subjects`, `src/lib/handlers/keyStages`, `src/lib/handlers/threads`, `src/lib/handlers/keyStageSubjectLessons`, `src/lib/handlers/allKeyStageAndSubjectUnits`.
- Lessons
  - Lesson summary and lesson transcript endpoints.
  - Files: `src/lib/handlers/lesson`, `src/lib/handlers/transcript`.
- Units and sequences
  - Sequence units (`/sequences/{sequence}/units`) and unit summary (`/units/{unit}/summary`).
  - Files: `src/lib/handlers/sequences`, `src/lib/handlers/units`.
- Questions
  - Quiz questions for lesson, sequence, and key stage/subject.
  - File: `src/lib/handlers/questions`.
- Assets
  - Sequence, subject, lesson asset listing endpoints and a placeholder endpoint for asset streaming.
  - Actual asset streaming lives in `src/app/api/v0/lessons/[lesson]/assets/[type]/route.ts`.
  - File: `src/lib/handlers/assets`.
- Search
  - Lesson title similarity search (SQL via Hasura) and transcript search (Prisma/Postgres).
  - Files: `src/lib/handlers/lesson`, `src/lib/handlers/searchTranscripts`.
- Internal
  - Changelog and rate-limit status.
  - Files: `src/lib/handlers/changelog`, `src/lib/handlers/rate`.

Cross-cutting behaviors
- All public API endpoints (except changelog) use `protectedProcedure` to enforce API keys and rate limits.
- Pagination is done via `limit` and `offset` query params and a `Link: <next>; rel="next"` header for some list endpoints.
- Several endpoints apply content gating via `src/lib/queryGate.ts` and `src/lib/blockedContent.ts` to block certain subjects, units, or lessons.
- OpenAPI metadata is supplied in each handler via `.meta({ openapi: ... })`, with schemas pulled from `src/lib/zod-openapi/generated/*`.
