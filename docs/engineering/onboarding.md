# Onboarding (detailed)

Version framing
- The public API is v0 (public alpha moving toward public beta); prioritize V0 critical fixes first.
- V1 improvements are deeper refinements after v0 stability goals; see `docs/engineering/v0-v1-improvements.md` for the split.

Purpose
- Provide a clear path for new contributors to run the API locally, understand the repo structure, and validate changes.

Start here (short)
1) Read `README.md` for quickstart.
2) Follow the steps below to run locally.
3) Use `docs/engineering/working-on-repo.md` for day-to-day workflow.

Role-based onboarding paths
- Junior: start with `docs/engineering/first-contribution.md`, then `docs/engineering/working-on-repo.md`, and review the glossary in `docs/glossary.md`.
- Mid-level: read `docs/architecture/overview.md`, then `docs/architecture/architecture-map.md` for where to change code.
- Senior: review `docs/architecture/system-boundaries.md` and `docs/architecture/infrastructure-topology.md`, then skim ADRs.
- Want a fast-track orientation: start with `docs/architecture/fast-track-orientation.md`.

Prerequisites
- Node 20+
- pnpm 10+
- Access to OWA Hasura (staging or appropriate environment)

Access and credentials
- Request access to Hasura, Upstash, and GCS from the team or PM.
- If you do not have all credentials, expect some endpoints to fail locally.

Environment setup
1) Copy `.env.example` to `.env`.
2) Required for core API:
   - `OAK_GRAPHQL_HOST`
   - `OAK_GRAPHQL_SECRET`
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
3) Optional (feature-specific):
   - `PRISMA_ACCELERATE_DATABASE_URL` (transcript search)
   - `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `SANITY_AUTH_SECRET` (CMS docs)
   - `NEXT_PUBLIC_POSTHOG_API_KEY`, `NEXT_PUBLIC_POSTHOG_API_HOST` (analytics)
   - `AUTH_USERNAME`, `AUTH_PASSWORD` (admin basic auth)

Run locally
1) Install dependencies: `pnpm install`
2) Start dev server: `pnpm dev`
3) Verify:
   - API: `http://localhost:2727/api/v0/subjects`
   - Swagger UI: `http://localhost:2727/playground`

How to use the API
- See `docs/api/quickstart.md` for headers, sample requests, and the playground.

How to work on the repo
- See `docs/engineering/working-on-repo.md` for common workflows and codegen steps.

First contribution
- See `docs/engineering/first-contribution.md` for a safe first change path.

Working with API keys
- Admin UI: `http://localhost:2727/admin`
- Backend route: `src/app/api/admin/create-api-key/route.ts`

Common tasks
- Regenerate key stages/subjects: `pnpm build-subjects`
- Regenerate OpenAPI schemas: `pnpm generate:openapi`
- Run tests: `pnpm test`
- Lint: `pnpm lint`

Bulk download
- See `README_BULK_DOWNLOAD.md` for prerequisites and running `pnpm bulk`.
- Bulk output layout is described in `README_BULK_DOWNLOAD.md` and `docs/architecture/bulk-download.md`.
- If you run with `INCLUDE_ASSETS=true`, Node 22+ is required.

Docs and CMS
- CMS notes: `src/cms/README.md`
- Docs pages: `src/app/(pages)/docs`

Deep background (optional)
- `docs/README.md` (full docs index)
- `docs/architecture/decision-records/README.md` (ADRs)
- `.agent/summary/README.md` (technical summary index)
- `.agent/summary/analysis/versioned-improvements.md` (v0/v1 priorities)

Related docs
- `README.md` (repo overview and quickstart)
- `docs/engineering/README.md` (planning structure)
- `README_BULK_DOWNLOAD.md` (bulk download process)
- `src/cms/README.md` (CMS integration)
- `docs/architecture/README.md` (architecture overview)
