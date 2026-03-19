---
type: bug-fix
status: implemented
audience: Oak Curriculum API team
severity: medium
size: 2
---

# Pagination URL construction

**Severity**: Medium
**Size**: 2
**Endpoints**: `GET /key-stages/{keyStage}/subject/{subject}/lessons`,
`GET /sequences/{sequence}/questions`,
`GET /key-stages/{keyStage}/subject/{subject}/questions`
**Internal ref**: [v0-v1-improvements.md — V0-001](../../engineering/v0-v1-improvements.md#v0-001-pagination-link-header-url-construction)

## Status

**Already fixed.** The current code in `pagination.ts` uses the `URL`
API with `searchParams.set()` to correctly merge query parameters.
Verified 2026-03-10 against the codebase.

## Evidence

- **Code proof**: pagination link generation now uses URL parsing and
  query-param merging instead of string concatenation.
- **Status proof**: this file is retained as implementation history with
  `status: implemented`; no active remediation item remains.

## Original problem

The `Link` header URL was built by concatenating
`baseUrl + ctx.req.url + "?offset=..."`. If the request URL already
contained query parameters (e.g., `?limit=10`), this produced an invalid
URL like `?limit=10?offset=10`.

**Code references**: `keyStageSubjectLessons.ts:81-86`,
`questions.ts:203-206`, `questions.ts:337-340`
