# Possible enhancements (optional improvements)

Purpose
- Capture optional improvements that can be scheduled after v0 stabilization.

Version framing
- The public API is v0 (public alpha moving toward public beta).
- V0 items focus on correctness and trust; V1 items are deeper refinements after v0 stability.

Enhancement flow (simple view)
```text
Idea
  -> Evaluate impact
  -> Schedule in V1 (optional)
```

API and handler improvements
- Add a shared pagination helper for `Link` headers and limit/offset defaults.
- Standardize error responses with a shared error utility.
- Add caching hints for heavily used list endpoints if freshness allows.
- Add a shared custom-route wrapper for consistent CORS and headers.

OpenAPI and documentation
- Restore example schema validation in `__tests__/openapi-schema.test.ts`.
- Generate a static OpenAPI JSON file at build time.
- Add more endpoint examples for clearer docs.
- Provide a docs-only OpenAPI view without mutating the shared document.

Bulk download
- Add a dry-run mode to `bin/prepare-bulk.ts`.
- Add per-sequence manifests and checksums.
- Align bucket configuration across bulk scripts.
- Publish and keep the bulk/API mapping guide current.

Data access and safety
- Parameterize raw SQL for lesson text search.
- Move gating lists into a versioned, centralized config.
- Add response validation for external data sources.
- Standardize SQL access helpers to a single Hasura endpoint.
- Add timeouts and retries for GraphQL, Mux, and GCS calls.

Observability
- Emit structured logs with consistent fields (requestId, handler, userId).
- Ensure rate-limit headers are present on all routes.

Tooling and developer experience
- Add a small smoke test script for critical endpoints.
- Keep README dependency versions aligned with `package.json`.
- Plan major dependency upgrades as coordinated V1 workstreams.
- Treat Babel replacement and lodash reduction as lower-priority modernization.

Related docs
- `docs/engineering/v0-v1-improvements.md`
- `docs/engineering/dependency-upgrades.md`
