# Gap analysis (high-impact, immediate issues)

Purpose
- Track v0-critical issues that affect correctness, trust, or stability.

Version framing
- The public API is v0 (public alpha moving toward public beta).
- V0 items focus on correctness and trust; V1 items are deeper refinements after v0 stability.

Tags
- area=correctness,trust,bulk,gating
- track=v0
- source=internal
- endpoints=multi

Triage flow (simple view)
```text
Finding
  -> V0 fix (correctness/safety)
  -> V1 backlog (refactor/optimization)
```

Findings (v0-critical)
1) Pagination `Link` header URL construction is invalid in some handlers.
2) Transcript search results appear to be ordered by slug instead of ID.
3) Swagger JSON route mutates the shared OpenAPI document.
4) Sequence assets ignore `year` filtering.
5) Bulk video packaging script uses an uninitialized variable in the sentinel branch.
6) Lesson text search builds raw SQL from user input.
7) Asset download route sets rate-limit headers on request headers instead of response headers.
8) Bulk download API accepts GET/HEAD but always parses JSON.
9) Content gating rules are fragmented across endpoints.
10) Bulk output JSON may omit lesson data when assets are enabled.
11) Bulk export and API endpoints can diverge in gating and shape.

Notes
- Each item has a concrete fix path in the architecture and deep-dive notes.
- These items should be addressed before V1 refactors whenever possible.

Related docs
- `docs/engineering/v0-v1-improvements.md`
- `docs/architecture/runtime-architecture.md`
- `docs/architecture/openapi-generation.md`
- `docs/architecture/content-gating.md`
- `docs/architecture/bulk-download.md`
- `.agent/summary/analysis/internal-external-crosswalk.md`
- `.agent/external-feedback-and-requests/from-mcp-semantic-search-work/08-summary-and-coordination.md`
