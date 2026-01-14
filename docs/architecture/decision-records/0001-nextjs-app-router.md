# ADR 0001: Adopt Next.js App Router for UI and API routes


Status
- Accepted (historical record)


Date recorded
- 2025-12-31 (retroactive)


Retroactive note
- This ADR was created after the fact from existing code and documentation. The original decision date is not known.


Context
- The project needs a single web application that serves both UI pages and API routes.
- The team needs SSR and a consistent routing model with minimal infrastructure overhead.


Decision
- Use the Next.js App Router (`src/app`) for UI pages and API route handlers.


Consequences
- Positive impacts:
  - UI pages and API routes live under the same routing system.
  - API handlers use `NextRequest`/`NextResponse` and Next.js conventions.
  - Middleware can be applied at the framework level.
- Trade-offs:
  - Ties routing and deployment to Next.js conventions and release cadence.
  - Requires familiarity with App Router patterns and file-based routing.

Alternatives considered
- Next.js Pages Router
- Separate API server (Express/Fastify) alongside a standalone frontend


References
- `src/app`
- `src/app/api`
- `next.config.mjs`
