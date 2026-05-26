# API endpoints

Purpose

- Link each API endpoint to the source file where it is defined.

Notes

- Public v0 endpoints are served under `/api/v0`.
- Most public v0 endpoint paths are defined in handler `openapi` metadata and routed through [`src/app/api/v0/[...trpc]/route.ts`](../src/app/api/v0/%5B...trpc%5D/route.ts).
- Response and request shapes remain defined by the Zod schemas and generated OpenAPI output, not this file.

## Public v0 endpoints

| Method | Endpoint                                                    | Definition                                                                                                                                                                                                                            |
| ------ | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/api/v0/changelog`                                         | [`src/lib/handlers/changelog/changelog.ts`](../src/lib/handlers/changelog/changelog.ts#L13)                                                                                                                                           |
| GET    | `/api/v0/changelog/latest`                                  | [`src/lib/handlers/changelog/changelog.ts`](../src/lib/handlers/changelog/changelog.ts#L33)                                                                                                                                           |
| GET    | `/api/v0/key-stages`                                        | [`src/lib/handlers/keyStages/keyStages.ts`](../src/lib/handlers/keyStages/keyStages.ts#L14)                                                                                                                                           |
| GET    | `/api/v0/key-stages/{keyStage}/subject/{subject}/assets`    | [`src/lib/handlers/assets/assets.ts`](../src/lib/handlers/assets/assets.ts#L433)                                                                                                                                                      |
| GET    | `/api/v0/key-stages/{keyStage}/subject/{subject}/lessons`   | [`src/lib/handlers/keyStageSubjectLessons/keyStageSubjectLessons.ts`](../src/lib/handlers/keyStageSubjectLessons/keyStageSubjectLessons.ts#L19)                                                                                       |
| GET    | `/api/v0/key-stages/{keyStage}/subject/{subject}/questions` | [`src/lib/handlers/questions/questions.ts`](../src/lib/handlers/questions/questions.ts#L270)                                                                                                                                          |
| GET    | `/api/v0/key-stages/{keyStage}/subject/{subject}/units`     | [`src/lib/handlers/allKeyStageAndSubjectUnits/allKeyStageAndSubjectUnits.ts`](../src/lib/handlers/allKeyStageAndSubjectUnits/allKeyStageAndSubjectUnits.ts#L20)                                                                       |
| GET    | `/api/v0/keywords`                                          | [`src/lib/handlers/keywords/keywords.ts`](../src/lib/handlers/keywords/keywords.ts#L19)                                                                                                                                               |
| GET    | `/api/v0/lessons/{lesson}/assets`                           | [`src/lib/handlers/assets/assets.ts`](../src/lib/handlers/assets/assets.ts#L619)                                                                                                                                                      |
| GET    | `/api/v0/lessons/{lesson}/assets/{type}`                    | [`src/lib/handlers/assets/assets.ts`](../src/lib/handlers/assets/assets.ts#L644); download route in [`src/app/api/v0/lessons/[lesson]/assets/[type]/route.ts`](../src/app/api/v0/lessons/%5Blesson%5D/assets/%5Btype%5D/route.ts#L48) |
| GET    | `/api/v0/lessons/{lesson}/quiz`                             | [`src/lib/handlers/questions/questions.ts`](../src/lib/handlers/questions/questions.ts#L42)                                                                                                                                           |
| GET    | `/api/v0/lessons/{lesson}/summary`                          | [`src/lib/handlers/lesson/lesson.ts`](../src/lib/handlers/lesson/lesson.ts#L46)                                                                                                                                                       |
| GET    | `/api/v0/lessons/{lesson}/transcript`                       | [`src/lib/handlers/transcript/transcript.ts`](../src/lib/handlers/transcript/transcript.ts#L21)                                                                                                                                       |
| GET    | `/api/v0/rate-limit`                                        | [`src/lib/handlers/rate/rate.ts`](../src/lib/handlers/rate/rate.ts#L13)                                                                                                                                                               |
| GET    | `/api/v0/search/lessons`                                    | [`src/lib/handlers/lesson/lesson.ts`](../src/lib/handlers/lesson/lesson.ts#L214)                                                                                                                                                      |
| GET    | `/api/v0/search/transcripts`                                | [`src/lib/handlers/searchTranscripts/searchTranscripts.ts`](../src/lib/handlers/searchTranscripts/searchTranscripts.ts#L16)                                                                                                           |
| GET    | `/api/v0/sequences/{sequence}/assets`                       | [`src/lib/handlers/assets/assets.ts`](../src/lib/handlers/assets/assets.ts#L252)                                                                                                                                                      |
| GET    | `/api/v0/sequences/{sequence}/questions`                    | [`src/lib/handlers/questions/questions.ts`](../src/lib/handlers/questions/questions.ts#L130)                                                                                                                                          |
| GET    | `/api/v0/sequences/{sequence}/units`                        | [`src/lib/handlers/sequences/sequences.ts`](../src/lib/handlers/sequences/sequences.ts#L131)                                                                                                                                          |
| GET    | `/api/v0/subjects`                                          | [`src/lib/handlers/subjects/subjects.ts`](../src/lib/handlers/subjects/subjects.ts#L37)                                                                                                                                               |
| GET    | `/api/v0/subjects/{subject}`                                | [`src/lib/handlers/subjects/subjects.ts`](../src/lib/handlers/subjects/subjects.ts#L101)                                                                                                                                              |
| GET    | `/api/v0/subjects/{subject}/key-stages`                     | [`src/lib/handlers/subjects/subjects.ts`](../src/lib/handlers/subjects/subjects.ts#L144)                                                                                                                                              |
| GET    | `/api/v0/sequences/{slug}`                                  | [`src/lib/handlers/sequences/sequences.ts`](../src/lib/handlers/sequences/sequences.ts#L119)                                                                                                                                          |
| GET    | `/api/v0/subjects/{subject}/years`                          | [`src/lib/handlers/subjects/subjects.ts`](../src/lib/handlers/subjects/subjects.ts#L161)                                                                                                                                              |
| GET    | `/api/v0/swagger.json`                                      | [`src/app/api/v0/swagger.json/route.ts`](../src/app/api/v0/swagger.json/route.ts#L3)                                                                                                                                                  |
| GET    | `/api/v0/threads`                                           | [`src/lib/handlers/threads/threads.ts`](../src/lib/handlers/threads/threads.ts#L31)                                                                                                                                                   |
| GET    | `/api/v0/threads/{threadSlug}/units`                        | [`src/lib/handlers/threads/threads.ts`](../src/lib/handlers/threads/threads.ts#L68)                                                                                                                                                   |
| GET    | `/api/v0/units/{unit}/summary`                              | [`src/lib/handlers/units/units.ts`](../src/lib/handlers/units/units.ts#L43)                                                                                                                                                           |

## Other API routes

Some operational route files export additional HTTP verbs from the same handler;
the table lists the primary verb used by consumers.

| Method | Endpoint                    | Definition                                                                                      |
| ------ | --------------------------- | ----------------------------------------------------------------------------------------------- |
| POST   | `/api/admin/create-api-key` | [`src/app/api/admin/create-api-key/route.ts`](../src/app/api/admin/create-api-key/route.ts#L14) |
| POST   | `/api/bulk`                 | [`src/app/api/bulk/route.ts`](../src/app/api/bulk/route.ts#L18)                                 |
| GET    | `/api/bulk/schema.json`     | [`src/app/api/bulk/schema.json/route.ts`](../src/app/api/bulk/schema.json/route.ts#L4)          |
| GET    | `/api/health`               | [`src/app/api/health/route.ts`](../src/app/api/health/route.ts#L4)                              |
| GET    | `/api/pingdom`              | [`src/app/api/pingdom/route.ts`](../src/app/api/pingdom/route.ts#L5)                            |
