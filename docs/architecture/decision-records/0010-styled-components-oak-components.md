# ADR 0010: Use styled-components with the Oak component library

Status
- Accepted (historical record)

Date recorded
- 2025-12-31 (retroactive)

Retroactive note
- This ADR was created after the fact from existing code and documentation. The original decision date is not known.

Context
- The API UI and docs should align with Oak design standards.
- The project needs SSR-friendly styling.

Decision
- Use `@oaknational/oak-components` and `styled-components`, with SSR support via a registry.

Consequences
- Positive impacts:
  - Keeps the API UI aligned with Oak design standards.
  - Styling is managed through Oak components and styled-components.
- Trade-offs:
  - Requires styled-components SSR setup in Next.js.

Alternatives considered
- CSS Modules
- Utility-first CSS frameworks

References
- `src/context/StyleContext.tsx`
- `src/lib/registry.tsx`
- `src/components/*`
