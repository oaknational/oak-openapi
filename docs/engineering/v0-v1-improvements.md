# V0 and V1 improvements

Purpose
- Separate immediate v0 fixes from deeper v1 improvements so sequencing stays clear.

Version framing
- The public API is v0 (public alpha moving toward public beta).
- V0 items focus on correctness and trust; V1 items are deeper refinements after v0 stability.

Tags
- area=planning,stability,modernisation
- track=mixed
- source=internal
- endpoints=multi

Two-track view (simple flow)
```text
V0 Stabilization
  -> correctness + safety fixes
  -> targeted dependency updates (incl. Zod 4)
  -> consistent API behavior

V1 Improvements
  -> refactors and modernization
  -> tooling upgrades
  -> deeper DX enhancements
```

V0 critical fixes (stability, correctness, trust)
1) Fix pagination `Link` header URL construction.
2) Correct transcript search ordering.
3) Avoid mutating the shared OpenAPI document in `/swagger.json`.
4) Apply `year` filtering in `/sequences/{sequence}/assets` or document its absence.
5) Fix the bulk video packaging sentinel handling.
6) Replace raw SQL string building in lesson search with parameterized queries.
7) Ensure rate-limit headers are returned on asset and bulk routes.
8) Restrict bulk download API to POST or guard JSON parsing by method.
9) Align content gating behavior across endpoints.
10) Ensure lessons are consistently included in bulk outputs or document the canonical format.
11) Clarify or align bulk vs API gating and shape differences.
12) Priority upgrade: Zod 4 and latest zod-openapi 4.x.

V0 dependency maintenance (low-risk)
- Apply patch/minor updates in small batches with smoke tests.
- Keep a short upgrade log to track changes.

V1 improvements (refinements and modernization)
- Shared pagination and custom-route helpers for consistent headers/CORS.
- Static OpenAPI artifact and restored example validation.
- Consolidated SQL helpers and external call timeouts/retries.
- Bulk pipeline enhancements (manifests, checksums, gating alignment options).
- Major dependency upgrades for framework, tooling, CMS, and data stack.
- Lower-priority modernization: Babel replacement and lodash reduction.

External items not yet captured (summary)
V0 candidates
- Lessons pagination bug (missing lessons in unfiltered pagination).
- Unit summary `unitLessons` truncation.
- Binary asset responses documented as JSON (should be binary).
- Transcript endpoint returns empty 200 for missing transcripts.
- Search excludes `financial-education`.
- Quiz endpoints omit image-based questions without metadata.
- KS4 science access via sequences only (needs documentation or change).
- Bulk data integrity issues (null titles, missing lesson records).

V1 candidates
- `/ontology` endpoint and structural pattern documentation.
- Programme variants, tier/exam board context, and identifier consistency.
- `semantic_summary` and `rerank_summary` fields.
- `/schemas` bundle for validator reuse.
- Thread metadata enhancements and maths-specific additions.
- OpenAPI metadata upgrades (summaries, examples, behaviour tags, canonical URLs, timestamps).

Related docs
- [docs/engineering/gap-analysis.md](docs/engineering/gap-analysis.md)
- [docs/engineering/enhancements.md](docs/engineering/enhancements.md)
- [docs/engineering/dependency-upgrades.md](docs/engineering/dependency-upgrades.md)
- [.agent/summary/analysis/internal-external-crosswalk.md](.agent/summary/analysis/internal-external-crosswalk.md)
- [.agent/external-feedback-and-requests/from-mcp-semantic-search-work/08-summary-and-coordination.md](.agent/external-feedback-and-requests/from-mcp-semantic-search-work/08-summary-and-coordination.md)
