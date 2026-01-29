# Architecture map (concerns to code)

Purpose
- Help contributors find the right place to make changes.

Version framing
- The public API is v0 (public alpha moving toward public beta).
- V0 items focus on correctness and trust; V1 items are deeper refinements after v0 stability.

Repo map (high-level)
```text
src/
  app/            # App Router pages + API routes
  lib/            # API handlers, data access, OpenAPI, gating
  cms/            # Sanity client, schemas, queries
  components/     # UI components
bin/              # bulk and schema scripts
docs/             # architecture + engineering docs
infrastructure/   # Terraform (bulk uploader job)
```

Concern map
- API handlers and routing: `src/lib/handlers/*`, `src/lib/router.ts`, `src/app/api/v0/[...trpc]/route.ts`.
- OpenAPI generation: `src/lib/zod-openapi/*`, `bin/zod-openapi-schema-gen/*`.
- Docs rendering: `src/app/(pages)/docs/*`, `src/cms/*`.
- Auth and rate limiting: `src/lib/apikeys.ts`, `src/lib/rateLimit.ts`, `src/lib/protect.ts`.
- Content gating: `src/lib/queryGate.ts`, `src/lib/queryGateData/*`, `src/lib/blockedContent.ts`.
- Assets: `src/lib/handlers/assets/*`, `src/app/api/v0/lessons/[lesson]/assets/[type]/route.ts`.
- Bulk download: `bin/prepare-bulk.ts`, `src/lib/bulk-data/*`, `src/app/api/bulk/route.ts`.
- Admin tooling: `src/app/(pages)/admin/page.tsx`, `src/app/api/admin/*`, `src/app/middleware.ts`.
- UI and styling: `src/app/(pages)/*`, `src/components/*`, `src/context/StyleContext.tsx`.

Common change patterns
```text
Add or update an endpoint
  -> handler in src/lib/handlers/*
  -> router entry in src/lib/router.ts
  -> schema + example updates (generated schemas)
  -> pnpm generate:openapi
  -> update docs or examples if needed
```

```text
Update docs content
  -> UI docs pages: src/app/(pages)/docs/*
  -> CMS content: src/cms/* (Sanity queries)
  -> OpenAPI docs: src/lib/endpoint-docs/*
```

Related docs
- [docs/architecture/system-boundaries.md](docs/architecture/system-boundaries.md)
- [docs/architecture/openapi-generation.md](docs/architecture/openapi-generation.md)
- [docs/engineering/working-on-repo.md](docs/engineering/working-on-repo.md)
- [docs/architecture/decision-records/README.md](docs/architecture/decision-records/README.md)
