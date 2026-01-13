# Infrastructure topology and operational constraints

Purpose
- Document how the app is hosted, what it depends on, and the constraints that shape operations.

Version framing
- The public API is v0 (public alpha moving toward public beta).
- V0 items focus on correctness and trust; V1 items are deeper refinements after v0 stability.

Topology (current)
```text
Clients
  |
  v
Next.js app (App Router + API routes)
  |
  +--> Hasura GraphQL/SQL (curriculum data)
  +--> Prisma Accelerate (transcript search)
  +--> Upstash Redis (API keys + rate limiting)
  +--> GCS (assets + bulk outputs)
  +--> Mux (video derivatives)
  +--> Sanity CMS (docs content)
  +--> PostHog (analytics)
  +--> Datadog (request logs)
```

Hosting and jobs
- App hosting is configured with Vercel-style headers (`vercel.json`); mirror these headers if hosted elsewhere.
- Bulk uploader job runs on GCP Cloud Run jobs, managed via Terraform in `infrastructure/bulk-upload`.

Environments (typical)
- Local development (uses `.env`).
- Staging (Hasura staging + staging storage).
- Production (live API and bulk outputs).

Operational constraints (current)
- API keys are required for most endpoints; key creation is gated behind admin basic auth.
- Rate limiting is enforced per API key using Upstash.
- Content gating uses allow/deny lists for licensing constraints.
- External dependencies (Hasura, GCS, Mux, Sanity, Upstash) must be available for full functionality.
- Bulk generation is resource intensive and uses GCS credentials for asset access.

V0/V1 alignment
- V0: document constraints in onboarding and provide clear local setup checks.
- V1: add explicit reliability targets (timeouts, retries, and SLO notes).

Related docs
- `docs/architecture/system-boundaries.md`
- `docs/architecture/data-sources.md`
- `infrastructure/README.md`
- `infrastructure/bulk-upload/README.md`
