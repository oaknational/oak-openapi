# ADR 0002: Use tRPC with OpenAPI metadata for the public API


Status
- Accepted (historical record)


Date recorded
- 2025-12-31 (retroactive)


Retroactive note
- This ADR was created after the fact from existing code and documentation. The original decision date is not known.


Context
- The API requires strong typing, shared input/output schemas, and an OpenAPI document for external users.
- The team wants a single source of truth for types and documentation.


Decision
- Use tRPC for the API router and attach OpenAPI metadata with `trpc-to-openapi`.
- Serve the OpenAPI document and Swagger UI from the Next.js app.


Consequences
- Positive impacts:
  - Endpoint handlers define `openapi` metadata and Zod schemas.
  - The OpenAPI document is generated from the tRPC router.
  - REST-style endpoints are exposed at `/api/v0`.
- Trade-offs:
  - Adds dependency on tRPC and trpc-to-openapi compatibility.
  - Requires consistent OpenAPI metadata to keep docs accurate.

Alternatives considered
- Hand-written REST routes with manual OpenAPI spec
- OpenAPI-first tooling with code generation


References
- `src/lib/trpc.ts`
- `src/lib/router.ts`
- `src/app/api/v0/[...trpc]/route.ts`
- `src/lib/zod-openapi/schema/generateDocument.ts`
