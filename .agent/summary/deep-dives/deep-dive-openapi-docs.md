# Deep dive: OpenAPI generation + docs coupling

Version framing
- The public API is v0 (public alpha moving toward public beta); prioritize V0 critical fixes first.
- V1 improvements are deeper refinements after v0 stability goals; see [.agent/summary/analysis/versioned-improvements.md](.agent/summary/analysis/versioned-improvements.md) for the split.

Scope
- OpenAPI document generation, schema/example workflows, and documentation rendering.
- Swagger playground behavior and coupling between docs and OpenAPI metadata.

Primary entrypoints
- `src/lib/zod-openapi/schema/generateDocument.ts`
- `src/app/api/v0/swagger.json/route.ts`
- `src/lib/endpoint-docs/getEndpointDocs.ts`
- `bin/zod-openapi-schema-gen/*`
- `src/app/(pages)/docs/*`

Document generation flow
```
Handlers (tRPC + Zod schemas)
  |
  v
trpc-to-openapi generateOpenApiDocument
  |
  v
openApiDocument (singleton in module)
  |
  +--> /api/v0/swagger.json (Swagger UI)
  |
  +--> Docs pages (endpoint grouping + examples)
```

Schema/example generation workflow
```
Handler schemas + examples
  |
  v
bin/zod-openapi-schema-gen/addExamplesToZodSchema.mjs
  |
  v
src/lib/zod-openapi/generated/* (OpenAPI-ready Zod schemas)
  |
  v
Handlers import generated schemas
```

Docs rendering flow
```
Docs route (/docs/...)
  |
  v
Sanity CMS query (page content)
  |
  +--> openApiDocument parsing (endpoint metadata)
  |
  v
MainDocsContent (docs + endpoint blocks)
```

Key components
- `generateOpenApiDocument` uses tRPC router metadata to emit OpenAPI paths, tags, and schemas.
- Generated schemas are augmented with examples and output descriptions from `src/lib/endpoint-docs/outputDescriptions.json`.
- Docs pages use `getEndpointContent` to group and format OpenAPI endpoints by tag.

Findings (high-impact)
- Swagger JSON route mutates the shared `openApiDocument` by removing tags for docs-only grouping. If `/swagger.json` is hit before docs, tags needed for docs may be missing.
  - Evidence: `src/app/api/v0/swagger.json/route.ts`, `src/lib/endpoint-docs/getEndpointDocs.ts`.

Findings (medium/low)
- Example schema validation is disabled in `__tests__/openapi-schema.test.ts` due to a mismatch between examples and generated schemas.
  - Evidence: `__tests__/openapi-schema.test.ts`.
- The OpenAPI document is generated at module load; changes to schemas or tags require server restart in dev and a full deploy in prod.
- Request schema generation requires inline Zod declarations; this constraint can be easy to miss and can silently degrade OpenAPI examples.
  - Evidence: [bin/zod-openapi-schema-gen/README.md](bin/zod-openapi-schema-gen/README.md).

Recommendations

V0/V1 alignment
- V0: prioritize fixes that improve correctness, safety, and client trust.
- V1: schedule deeper refactors and enhancements after V0 stability goals are met.

- Clone `openApiDocument` inside the Swagger JSON route to avoid cross-route mutations.
- Add a docs-only filtered view of OpenAPI paths/tags rather than mutating the source.
- Restore example schema validation by aligning example generation with `trpc-to-openapi` output.
- Consider generating a static OpenAPI JSON as part of build for more predictable docs rendering.

Evidence list
- `src/lib/zod-openapi/schema/generateDocument.ts`
- `src/app/api/v0/swagger.json/route.ts`
- `src/lib/endpoint-docs/getEndpointDocs.ts`
- `bin/zod-openapi-schema-gen/addExamplesToZodSchema.mjs`
- [bin/zod-openapi-schema-gen/README.md](bin/zod-openapi-schema-gen/README.md)
- `__tests__/openapi-schema.test.ts`
- `src/app/(pages)/docs/*`
