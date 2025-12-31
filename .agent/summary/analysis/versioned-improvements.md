# Versioned improvements: V0 critical fixes vs V1 improvements

Version framing
- The public API is v0 (public alpha moving toward public beta); prioritize V0 critical fixes first.
- V1 improvements are deeper refinements after v0 stability goals; see `.agent/summary/analysis/versioned-improvements.md` for the split.

Context
- The public API is considered v0 (public alpha moving toward public beta), regardless of `package.json` version.
- This split is intended to keep critical stability and trust fixes in v0, while reserving bigger refinements for v1.

## V0 critical fixes (stability, correctness, and trust)
These are the items that most directly affect client reliability, licensing safety, and data correctness.

1) Pagination next links
- Fix `Link` header URL construction to avoid invalid URLs and broken pagination.
- Source: `.agent/summary/analysis/gap-analysis.md` item 1.

2) Transcript search ordering
- Correct the ID/slug ordering mismatch so results are reliably ranked.
- Source: `.agent/summary/analysis/gap-analysis.md` item 2.

3) Swagger/Docs document mutation
- Avoid mutating the shared OpenAPI document in `/swagger.json` to keep docs consistent.
- Source: `.agent/summary/analysis/gap-analysis.md` item 3.

4) Year filtering on sequence assets
- Apply the year filter in `/sequences/{sequence}/assets` (or document its absence clearly).
- Source: `.agent/summary/analysis/gap-analysis.md` item 4.

5) Bulk video packaging sentinel flow
- Fix the uninitialized variable in `bulk-download-videos.sh` so tar creation and cleanup are reliable.
- Source: `.agent/summary/analysis/gap-analysis.md` item 5.

6) Lesson search SQL safety
- Parameterize the raw SQL in lesson search to reduce injection/malformed query exposure.
- Source: `.agent/summary/analysis/gap-analysis.md` item 6.

7) Rate-limit headers on asset/bulk routes
- Ensure custom routes return rate-limit headers (and CORS if needed) consistently.
- Source: `.agent/summary/analysis/gap-analysis.md` item 7.

8) Bulk API method handling
- Restrict bulk download API to POST or guard JSON parsing by method.
- Source: `.agent/summary/analysis/gap-analysis.md` item 8.

9) Content gating consistency
- Consolidate gating logic or clearly align endpoints to reduce inconsistent behavior across lessons/assets/transcripts/questions.
- Source: `.agent/summary/analysis/gap-analysis.md` item 9.

10) Bulk lessons output consistency
- Ensure lessons are present in `{sequence}.json` when assets are enabled, or document a single canonical lessons format.
- Source: `.agent/summary/analysis/gap-analysis.md` item 10.

11) Bulk vs API gating/shape divergence
- Document the differences or align gating for bulk lesson metadata to prevent surprises for integrators.
- Source: `.agent/summary/analysis/gap-analysis.md` item 11.

12) Priority upgrade: Zod 4 + zod-openapi 4.x
- High priority even though it is a major upgrade; keep `zod-openapi` on the latest 4.x.
- See `.agent/summary/analysis/dependency-outdated-analysis.md` and `.agent/summary/analysis/v0-dependency-upgrade-checklist.md`.

V0 dependency maintenance (low-risk updates)
- Apply patch/minor dependency updates that are low risk and help keep tooling and runtime stable.
- See `.agent/summary/analysis/dependency-outdated-analysis.md` for the suggested V0-safe list.

## V1 improvements (refinements and optional upgrades)
These are valuable but less urgent items that improve maintainability, DX, and observability.

API/DX consistency
- Shared pagination helper for `Link` headers and default handling.
- Custom-route wrapper for consistent headers and CORS.

OpenAPI/docs quality
- Restore example schema validation in OpenAPI tests.
- Produce a static OpenAPI JSON artifact at build time.
- Provide a docs-only OpenAPI view without mutating the shared document.

Data access and resilience
- Standardize SQL helpers to a single Hasura endpoint.
- Add timeouts/retries for external calls (Hasura, Mux, GCS).
- Expand Zod output validation where raw data is returned.

Bulk pipeline enhancements
- Dry-run mode, manifest files, and checksums for bulk outputs.
- Align bucket configuration across bulk scripts via env vars.
- Publish a mapping guide (already drafted) for bulk vs API usage.

Dependency upgrade track (major changes)
- Plan major dependency upgrades (Next, Prisma, Sanity, Storybook, Vitest, Vite) as coordinated v1 workstreams.
- See `.agent/summary/analysis/dependency-outdated-analysis.md` for the detailed grouping.

Modernization (lower priority)
- Evaluate replacing Babel in schema generation scripts with a more modern tool where it fits.
- Reduce lodash usage by replacing it with targeted utilities or native equivalents.
- See `.agent/summary/analysis/v1-upgrade-roadmap.md` for the grouped plan.

Observability and testing
- Structured logging with consistent fields and request IDs.
- Smoke tests to validate critical endpoints and bulk outputs.

Notes
- The v0 list prioritizes trust and correctness for integrators. The v1 list focuses on polish, scale, and long-term maintainability.
