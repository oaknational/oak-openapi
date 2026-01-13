# ADR 0009: Use Sanity CMS for docs and landing content


Status
- Accepted (historical record)


Date recorded
- 2025-12-31 (retroactive)


Retroactive note
- This ADR was created after the fact from existing code and documentation. The original decision date is not known.


Context
- Documentation and landing pages require non‑developer editing and structured content.
- The team wants a CMS that integrates with Next.js and supports structured content types.


Decision
- Use Sanity CMS with GraphQL queries to fetch documentation and landing page content.


Consequences
- Positive impacts:
  - CMS configuration and schema types live in `src/cms`.
- Trade-offs:
  - Requires Sanity environment variables in deployed environments.
  - Docs availability depends on CMS uptime and credentials.

Alternatives considered
- Markdown/MDX stored in the repo
- A separate docs site


References
- `src/cms/*`
- `src/app/(pages)/docs/*`
- `src/app/(pages)/page.tsx`
