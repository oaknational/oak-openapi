# ADR 0003: Use Zod schemas with generated OpenAPI artifacts


Status
- Accepted (historical record)


Date recorded
- 2025-12-31 (retroactive)


Retroactive note
- This ADR was created after the fact from existing code and documentation. The original decision date is not known.


Context
- The API needs runtime validation and a reliable way to generate OpenAPI schemas and examples.
- The team wants a consistent schema authoring pattern across handlers.


Decision
- Use Zod for input/output schemas and `zod-openapi` for OpenAPI metadata.
- Generate OpenAPI-ready schemas with a custom script that attaches examples.


Consequences
- Positive impacts:
  - Request/response schemas live alongside handlers and example JSON files.
- Trade-offs:
  - OpenAPI generation depends on the schema generation script and example files.
  - Custom schema generation tooling needs maintenance over time.

Alternatives considered
- JSON Schema only
- TypeScript types without runtime validation


References
- `src/lib/handlers/**/schemas/*`
- `src/lib/handlers/**/examples/*`
- `src/lib/zod-openapi/generated/*`
- `bin/zod-openapi-schema-gen/*`
