# Possible enhancements (optional improvements)

Version framing
- The public API is v0 (public alpha moving toward public beta); prioritize V0 critical fixes first.
- V1 improvements are deeper refinements after v0 stability goals; see `.agent/summary/analysis/versioned-improvements.md` for the split.

These are lower-urgency improvements that can increase maintainability, UX, or observability.

## API and handler improvements
- Add a shared pagination helper to generate `Link` headers and handle `limit/offset` defaults consistently.
- Standardize error responses with a shared error utility so client errors are uniform across handlers.
- Add endpoint-level caching hints for heavily used list endpoints (e.g., subjects, key stages) if data freshness allows.
- Add a shared custom-route wrapper to apply CORS and common headers for non-tRPC routes (assets, bulk, admin).

## OpenAPI and documentation
- Restore example schema validation in `__tests__/openapi-schema.test.ts` by fixing the OpenAPI example generation mismatch.
- Generate a public, static OpenAPI JSON file during build for faster docs rendering in production.
- Add examples to endpoints that currently return empty or minimal examples to improve developer experience.
- Provide a docs-only view of the OpenAPI document rather than mutating the shared in-memory object.

## Bulk download
- Add a dry-run mode to `bin/prepare-bulk.ts` to show counts and output sizes without downloading assets.
- Track per-sequence progress and status in a JSON manifest, useful for resumable runs.
- Add checksums for generated archives and JSON outputs to improve integrity checks.
- Align bucket configuration across `prepare-bulk` and `bulk-download-videos.sh` via explicit env vars.
- Provide a mapping guide that explains how bulk JSON fields and groupings correspond to API endpoint responses.

## Data access and safety
- Replace raw SQL string concatenation in `searchByTextSimilarity` with parameterized queries.
- Move gating lists from JSON to a central configuration with versioning and audit notes.
- Add light validation on GraphQL responses before mapping to response schemas to catch upstream data regressions early.
- Standardize SQL access helpers to a single Hasura endpoint for easier ops and debugging.
- Add timeout/retry policies for external calls (Hasura, Mux, GCS) where user-facing endpoints depend on them.

## Observability
- Emit structured logs with consistent fields (requestId, handler, userId) for all endpoints.
- Track rate-limit headers on asset and bulk responses to match other API endpoints.

## Tooling and developer experience
- Add a "smoke test" script that calls a few endpoints with a test key and validates status codes.
- Align README dependency versions with `package.json` to avoid confusion for new contributors.
- Plan dependency upgrades in two tracks (v0 patch/minor and v1 majors) to reduce release risk; see `.agent/summary/analysis/dependency-outdated-analysis.md`.
- Treat Babel replacement and lodash reduction as lower‑priority modernization tasks; see `.agent/summary/analysis/v1-upgrade-roadmap.md`.
