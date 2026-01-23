# Architecture overview

Purpose
- Summarize system boundaries, core components, and primary flows.

Version framing
- The public API is v0 (public alpha moving toward public beta).
- V0 items focus on correctness and trust; V1 items are deeper refinements after v0 stability.

Want a fast-track?
- Jump to [docs/architecture/fast-track-orientation.md](docs/architecture/fast-track-orientation.md) for a quick path to advanced concepts.

System boundary
- Single Next.js application that serves UI pages, API endpoints, and documentation.
- Bulk download pipeline runs as scripts and stores outputs in cloud storage.

High-level flow (system context)
```text
Clients (API users, web users)
  |
  v
Next.js App (UI + API routes)
  | \
  |  \-> Docs + Playground (Sanity content + OpenAPI)
  |
  v
tRPC Router (OpenAPI metadata + Zod schemas)
  |
  v
Data sources:
  - Hasura GraphQL/SQL (curriculum views)
  - Prisma/Postgres (transcript search)
  - Upstash Redis (API keys + rate limits)
  - GCS/Mux (assets + bulk outputs)
  - Sanity CMS (docs content)
```

Core components
- App Router UI in `src/app` for landing pages, docs, playground, bulk download, and admin.
- Public API in `src/lib/handlers` exposed through tRPC OpenAPI routes.
- OpenAPI document generation via Zod schemas and `trpc-to-openapi`.
- Bulk generation scripts under `bin/` that write JSON and asset archives to GCS.

Key architectural decisions
- Next.js App Router for UI and API routes: [docs/architecture/decision-records/0001-nextjs-app-router.md](docs/architecture/decision-records/0001-nextjs-app-router.md).
- tRPC + OpenAPI metadata for API: [docs/architecture/decision-records/0002-trpc-openapi.md](docs/architecture/decision-records/0002-trpc-openapi.md).
- Zod schemas and OpenAPI generation: [docs/architecture/decision-records/0003-zod-openapi-generation.md](docs/architecture/decision-records/0003-zod-openapi-generation.md).
- Hasura views as the primary curriculum source: [docs/architecture/decision-records/0004-hasura-graphql-views.md](docs/architecture/decision-records/0004-hasura-graphql-views.md).
- Prisma for transcript search: [docs/architecture/decision-records/0005-prisma-transcript-search.md](docs/architecture/decision-records/0005-prisma-transcript-search.md).
- Upstash Redis for API keys and rate limits: [docs/architecture/decision-records/0006-upstash-redis-rate-limits.md](docs/architecture/decision-records/0006-upstash-redis-rate-limits.md).
- GCS/Mux for asset delivery: [docs/architecture/decision-records/0007-asset-delivery-gcs-mux.md](docs/architecture/decision-records/0007-asset-delivery-gcs-mux.md).
- Bulk download pipeline: [docs/architecture/decision-records/0008-bulk-download-pipeline.md](docs/architecture/decision-records/0008-bulk-download-pipeline.md).
- Sanity CMS for docs: [docs/architecture/decision-records/0009-sanity-cms-docs.md](docs/architecture/decision-records/0009-sanity-cms-docs.md).
- Styled-components + Oak design system: [docs/architecture/decision-records/0010-styled-components-oak-components.md](docs/architecture/decision-records/0010-styled-components-oak-components.md).
- Admin basic auth: [docs/architecture/decision-records/0011-admin-basic-auth.md](docs/architecture/decision-records/0011-admin-basic-auth.md).
- Content gating allow/deny lists: [docs/architecture/decision-records/0012-content-gating-allowlists.md](docs/architecture/decision-records/0012-content-gating-allowlists.md).

V0/V1 alignment
- V0 priority: fix correctness and trust issues in API behavior, gating, and bulk alignment.
- V1 priority: refactors for maintainability, shared helpers, and deeper modernization.

Related docs
- [docs/architecture/runtime-architecture.md](docs/architecture/runtime-architecture.md)
- [docs/architecture/data-sources.md](docs/architecture/data-sources.md)
- [docs/architecture/openapi-generation.md](docs/architecture/openapi-generation.md)
- [docs/architecture/content-gating.md](docs/architecture/content-gating.md)
- [docs/architecture/bulk-download.md](docs/architecture/bulk-download.md)
- [docs/architecture/system-boundaries.md](docs/architecture/system-boundaries.md)
- [docs/architecture/infrastructure-topology.md](docs/architecture/infrastructure-topology.md)
- [docs/architecture/architecture-map.md](docs/architecture/architecture-map.md)
