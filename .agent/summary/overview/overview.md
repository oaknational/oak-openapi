# Overview

Version framing
- The public API is v0 (public alpha moving toward public beta); prioritize V0 critical fixes first.
- V1 improvements are deeper refinements after v0 stability goals; see `.agent/summary/analysis/versioned-improvements.md` for the split.

Purpose
- Oak OpenAPI is a Next.js app that serves a REST-like API (via tRPC + OpenAPI), a Swagger playground, and documentation pages for Oak National curriculum data.
- It also includes scripts and infrastructure for producing bulk-downloadable curriculum datasets and assets.

High-level architecture
- App Router UI in `src/app` for landing pages, docs, bulk download, playground, and admin.
- API layer in `src/lib/handlers` (tRPC routers), exported through `src/lib/router.ts` and `src/app/api/v0/[...trpc]/route.ts`.
- OpenAPI document is generated from Zod schemas and tRPC metadata and served at `/api/v0/swagger.json`.
- Data sources include OWA Hasura GraphQL views, Prisma/Postgres for transcript search, Upstash Redis for API keys and rate limits, Sanity CMS for docs content, and GCS/Mux for assets.

Repo layout (top-level)
- `src/app`: Next.js App Router pages and API routes.
- `src/lib`: tRPC setup, handlers, OpenAPI generation, bulk-data helpers, integrations.
- `src/cms`: Sanity client, schemas, and queries.
- `src/components`: UI components for landing, docs, and bulk download.
- `bin`: scripts for bulk data preparation, OpenAPI/Zod generation, and support tooling.
- `infrastructure`: Terraform for bulk uploader and project config.
- `__tests__`: Vitest test suite and load testing config.

Dev setup (from repo docs and config)
- Node >= 20 (Dockerfile uses 22), pnpm >= 10 (README mentions pnpm@8 but package.json enforces >= 10).
- `pnpm dev` runs on port 2727.
- `pnpm build-subjects` regenerates `src/lib/keyStageAndSubjects.json` using live API data.
