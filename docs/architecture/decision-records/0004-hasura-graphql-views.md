# ADR 0004: Use Hasura GraphQL views as the primary curriculum data source


Status
- Accepted (historical record)


Date recorded
- 2025-12-31 (retroactive)


Retroactive note
- This ADR was created after the fact from existing code and documentation. The original decision date is not known.


Context
- Curriculum data is maintained in OWA and exposed via Hasura.
- The API needs read-only access to published views and consistent schema names.


Decision
- Use `graphql-request` against Hasura GraphQL endpoints and published views.
- Use Hasura `run_sql` for specific query needs where GraphQL is not sufficient.


Consequences
- Positive impacts:
  - Provides a consistent, read-only interface to published curriculum data.
- Trade-offs:
  - GraphQL view versioning is embedded in query names.
  - Requires environment configuration for Hasura host and secret.

Alternatives considered
- Direct database connections
- Replicated data store or ETL pipeline


References
- `src/lib/owaClient.ts`
- `src/lib/handlers/*`
- `.env.example`
