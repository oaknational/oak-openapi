# V0 and V1 improvements

Purpose
- Separate immediate v0 fixes from deeper v1 improvements so sequencing stays clear.

Version framing
- The public API is v0 (public alpha moving toward public beta).
- V0 items focus on correctness and trust; V1 items are deeper refinements after v0 stability.

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

Related docs
- `docs/engineering/gap-analysis.md`
- `docs/engineering/enhancements.md`
- `docs/engineering/dependency-upgrades.md`
