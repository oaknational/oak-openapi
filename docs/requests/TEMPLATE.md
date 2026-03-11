---
type: bug-fix | feature-request
status: draft
audience: Oak Curriculum API team
severity: critical | high | medium | low  # bug-fixes only
priority: high | medium | low             # feature-requests only
size: <fibonacci number or TBD>
depends-on:                                # optional — list cross-request dependencies
  - <other-request-filename> (<brief reason>)
---

# Title

**Severity**: (bug-fixes only)
**Size**: (repeat from frontmatter for quick scanning)
**Endpoints**: (affected endpoints)
**Internal ref**: [v0-v1-improvements.md — V0-0XX](../../engineering/v0-v1-improvements.md#<replace-with-anchor>)

## Feasibility (feature-requests only)

The API team can only expose existing data, they cannot create new data. All requests must be constrained by the existing data in either the OpenAPI specification, the bulk data schema, or the URLs of the live website <https://www.thenational.academy>.

You MUST verify all links in all documents.

- **Realistic**: Yes/No — why this is a real problem
- **Achievable**: Yes/No — why existing data supports it
- **Data source**: Which schema/endpoint/file provides the data

## Problem

What is broken or missing, and why it matters to consumers.

## Evidence

Include one or more of:

- code reference in this repo;
- schema reference in this repo; or
- reproducible request/response example.

Items MUST include real examples from code or results. Do not include examples that are not directly taken from the codebase or an actual request/response. Verify all examples are valid and up to date. Items without examples MUST NOT be recorded.

## Suggested approach / Expected behaviour

How to fix it or what the solution looks like.

## Impact

What improves for consumers when this is resolved.

**Backwards compatibility**: Statement about whether this is additive,
breaking, or requires migration.

## Related

- Internal refs: links to v0-v1-improvements.md sections
