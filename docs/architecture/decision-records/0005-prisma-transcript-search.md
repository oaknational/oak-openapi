# ADR 0005: Use Prisma (Accelerate) for transcript search


Status
- Accepted (historical record)


Date recorded
- 2025-12-31 (retroactive)


Retroactive note
- This ADR was created after the fact from existing code and documentation. The original decision date is not known.


Context
- Transcript search requires full‑text querying on a dedicated dataset.
- The team needs a simple data access layer for this separate database.


Decision
- Use Prisma Client with the Accelerate extension for transcript search.
- Store transcript snippets in a dedicated schema and query via Prisma.


Consequences
- Positive impacts:
  - Provides a dedicated query layer for transcript search.
- Trade-offs:
  - Requires `PRISMA_ACCELERATE_DATABASE_URL` for runtime access.
  - Transcript search logic and schema are maintained separately from Hasura views.

Alternatives considered
- Hasura or GraphQL search endpoints
- External search service


References
- `schema.prisma`
- `src/lib/db.ts`
- `src/lib/handlers/searchTranscripts/searchTranscripts.ts`
