# System boundaries and architectural domains

Purpose
- Make the system boundary explicit and describe the major architectural concerns.

Version framing
- The public API is v0 (public alpha moving toward public beta).
- V0 items focus on correctness and trust; V1 items are deeper refinements after v0 stability.

System boundary (in scope)
- Next.js application that serves UI pages, API routes, docs, and the API playground.
- Public API handlers and OpenAPI generation.
- Admin tooling for API keys.
- Bulk download API and bulk generation scripts.
- Infrastructure code for the bulk uploader job.

System boundary (out of scope)
- Content authoring and publishing systems (owned by OWA).
- Asset storage and delivery infrastructure (owned by GCS and Mux).
- External data stores (Hasura, Postgres, Upstash, Sanity).
- Client applications that consume the API.

Architectural domains and concerns
- Public API surface: endpoint behavior, pagination, error shaping.
  - Code: `src/lib/handlers`, `src/lib/router.ts`, `src/app/api/v0/[...trpc]/route.ts`.
- Auth and rate limits: API key validation and quotas.
  - Code: `src/lib/apikeys.ts`, `src/lib/rateLimit.ts`, `src/lib/protect.ts`.
- Data access and contracts: GraphQL/SQL, Prisma, and mapping to API responses.
  - Code: `src/lib/owaClient.ts`, `src/lib/db.ts`, `src/lib/handlers/*`.
- Content gating: licensing allow/deny lists and enforcement.
  - Code: `src/lib/queryGate.ts`, `src/lib/queryGateData/*`.
- Docs and OpenAPI: OpenAPI generation and docs coupling.
  - Code: `src/lib/zod-openapi/*`, `src/app/(pages)/docs/*`, `src/app/api/v0/swagger.json/route.ts`.
- Bulk pipeline: export scripts, asset packaging, and download API.
  - Code: `bin/prepare-bulk.ts`, `src/lib/bulk-data/*`, `src/app/api/bulk/route.ts`.
- UI and UX: landing pages, playground, and admin tools.
  - Code: `src/app/(pages)/*`, `src/components/*`.

System context diagram
```text
                +---------------------------+
                |       Oak OpenAPI         |
                | UI + Docs + API + Admin   |
                | tRPC + OpenAPI + Gating   |
                +---------------------------+
                   |    |     |     |    |
                 Hasura Upstash GCS  Mux Sanity
                    |
                 Prisma DB
```

V0/V1 alignment
- V0: document and align boundaries across docs, onboarding, and ADRs.
- V1: add owner/SLA notes per domain and tighten operational constraints.

Related docs
- `docs/architecture/overview.md`
- `docs/architecture/infrastructure-topology.md`
- `docs/architecture/architecture-map.md`
