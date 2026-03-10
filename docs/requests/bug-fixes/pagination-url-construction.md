---
type: bug-fix
status: draft
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

## Problem

The `Link` header URL is built by concatenating
`baseUrl + ctx.req.url + "?offset=..."`. If the request URL already
contains query parameters (e.g., `?limit=10`), this produces an invalid
URL like `?limit=10?offset=10`.

**Code references**: `keyStageSubjectLessons.ts:81-83`,
`questions.ts:203-205`, `questions.ts:338-340`

## Expected behaviour

Correctly merge query parameters: `?limit=10&offset=10`.

## Impact

Clients following pagination `Link` headers receive errors.
SDK pagination helpers break.

## Fix

Use the `URL` API to properly parse and modify query parameters, or
strip existing query params before appending.
