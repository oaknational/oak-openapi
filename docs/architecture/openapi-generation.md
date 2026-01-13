# OpenAPI generation and docs coupling

Purpose
- Explain how OpenAPI schemas are generated and how docs and Swagger UI use them.

Version framing
- The public API is v0 (public alpha moving toward public beta).
- V0 items focus on correctness and trust; V1 items are deeper refinements after v0 stability.

Generation flow
```text
tRPC handlers + Zod schemas
  |
  v
trpc-to-openapi (metadata + schemas)
  |
  v
openApiDocument (module singleton)
  |
  +--> /api/v0/swagger.json (Swagger UI)
  |
  +--> Docs pages (endpoint grouping + examples)
```

Schema/example workflow
```text
Schema + examples in handlers
  |
  v
bin/zod-openapi-schema-gen/addExamplesToZodSchema.mjs
  |
  v
src/lib/zod-openapi/generated/*
  |
  v
Handlers import generated schemas
```

Docs rendering flow
```text
Docs route (/docs/...)
  |
  v
Sanity CMS query (page content)
  |
  +--> openApiDocument parsing (endpoint metadata)
  |
  v
Render docs + endpoint blocks
```

Key components
- `src/lib/zod-openapi/schema/generateDocument.ts` builds the OpenAPI document.
- `src/app/api/v0/swagger.json/route.ts` serves Swagger JSON.
- `src/lib/endpoint-docs/getEndpointDocs.ts` groups endpoints for docs pages.

V0/V1 alignment
- V0: avoid mutating the shared `openApiDocument` in `/swagger.json` to keep docs consistent.
- V0: restore example validation and align examples with generated schemas.
- V1: consider generating a static OpenAPI artifact at build time.

Related ADRs
- `docs/architecture/decision-records/0002-trpc-openapi.md`
- `docs/architecture/decision-records/0003-zod-openapi-generation.md`

Related docs
- `docs/architecture/runtime-architecture.md`
- `docs/architecture/overview.md`
