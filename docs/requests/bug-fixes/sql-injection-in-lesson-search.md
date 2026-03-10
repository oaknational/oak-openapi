---
type: bug-fix
status: draft
audience: Oak Curriculum API team
severity: critical
size: 3
---

# SQL injection risk in lesson search

**Severity**: Critical
**Size**: 3
**Endpoints**: `GET /search/lessons`
**Internal ref**: [v0-v1-improvements.md — V0-004](../../engineering/v0-v1-improvements.md#v0-004-lesson-search-builds-sql-from-user-input)

## Problem

The lesson search endpoint sanitises user input by replacing `'` with `''`
then interpolates directly into a raw SQL string. This is not a robust
defence against SQL injection in a public-facing API endpoint.

**Code reference**: `lesson.ts:142-163`

## Expected behaviour

Use parameterised queries or prepared statements via Hasura/Prisma.

## Impact

Security vulnerability in a public API endpoint that accepts arbitrary
user input.

## Verification and backwards compatibility

Parameterised queries are a drop-in replacement for string-interpolated
SQL. The fix changes the query construction mechanism, not the query
semantics. No consumer-visible behaviour change. A codebase-wide audit
for other raw SQL construction patterns (`$queryRaw`, `$executeRaw`,
direct SQL string interpolation) is recommended alongside this fix.
