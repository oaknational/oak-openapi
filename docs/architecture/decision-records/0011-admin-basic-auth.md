# ADR 0011: Protect the admin API key tool with basic auth

Status
- Accepted (historical record)

Date recorded
- 2025-12-31 (retroactive)

Retroactive note
- This ADR was created after the fact from existing code and documentation. The original decision date is not known.

Context
- API keys are created through an admin UI and should be restricted to internal use.
- A lightweight authentication mechanism is sufficient for this internal tool.

Decision
- Protect `/admin/*` and `/api/admin/*` routes with HTTP Basic Auth via Next.js middleware.

Consequences
- Positive impacts:
  - Admin UI and key creation routes are gated behind middleware.
- Trade-offs:
  - Requires `AUTH_USERNAME` and `AUTH_PASSWORD` in deployed environments.

Alternatives considered
- Separate admin service with stronger auth
- OAuth or SSO integration

References
- `src/app/middleware.ts`
- `src/app/(pages)/admin/page.tsx`
- `src/app/api/admin/create-api-key/route.ts`
