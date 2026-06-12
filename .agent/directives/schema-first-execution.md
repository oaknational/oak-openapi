# Schema-First (OpenAPI output) Directive

> **Status**: Mandatory. Applies to public API shapes, OpenAPI generation, and
> documentation that depends on the OpenAPI output.

## Cardinal intent

The OpenAPI document generated from the router + Zod schemas is the single
source of truth for the public API contract. Runtime behaviour and
documentation must reflect the same shapes and constraints, and any change to
the contract should be made in the Zod schemas and regenerated.

## Required flow

1. **Define** request/response shapes in the Zod schemas used by handlers.
2. **Generate** OpenAPI-ready schemas and examples with `pnpm generate:openapi`.
3. **Generate** the OpenAPI document at runtime from the tRPC router and Zod
   schemas (see `src/lib/zod-openapi/schema/generateDocument.ts`).
4. **Consume** the OpenAPI document in Swagger UI and docs pages without
   mutating the source in place.
4. **Document** any behaviour changes or breaking changes in the docs.

## Prohibited practices

- Hand-editing generated OpenAPI output or treating it as authoritative if it
  does not match the Zod schemas.
- Duplicating API shapes in docs or scripts without referencing the OpenAPI
  output or Zod schemas.
- Mutating the shared OpenAPI object in route handlers (use a copy if needed).

## Expectations

- Keep the OpenAPI document, docs, and handlers in sync.
- Regenerate OpenAPI-ready schemas when schemas or examples change.
  changes.

## Compliance

- If a change cannot keep OpenAPI output and runtime behaviour aligned, flag it
  and add a plan item for reconciliation.
