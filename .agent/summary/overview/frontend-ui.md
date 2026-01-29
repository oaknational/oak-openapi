# Frontend UI

Version framing
- The public API is v0 (public alpha moving toward public beta); prioritize V0 critical fixes first.
- V1 improvements are deeper refinements after v0 stability goals; see [.agent/summary/analysis/versioned-improvements.md](.agent/summary/analysis/versioned-improvements.md) for the split.

App Router pages
- Landing page: `src/app/(pages)/page.tsx` renders CMS-driven landing content.
- Docs: `src/app/(pages)/docs/*` uses CMS data plus OpenAPI endpoint metadata.
- Playground: `src/app/(pages)/playground` hosts Swagger UI.
- Bulk download flow: `src/app/(pages)/bulk-download` and `/bulk-download/success`.
- Admin: `src/app/(pages)/admin/page.tsx` for API key creation.

Component system
- Uses `@oaknational/oak-components` and `styled-components` (`src/context/StyleContext.tsx`).
- Shared UI in `src/components` (Nav, Footer, docs components, bulk download widgets, landing page sections).
- Styled-components SSR setup in `src/lib/registry.tsx`.

Styling and assets
- Swagger UI and playground overrides in `src/app/(pages)/playground/playground.css` (see README styling notes).
- Static assets under `public/images`.
