# ADR 0007: Deliver assets via GCS and Mux with a streaming route


Status
- Accepted (historical record)


Date recorded
- 2025-12-31 (retroactive)


Retroactive note
- This ADR was created after the fact from existing code and documentation. The original decision date is not known.


Context
- Lesson assets live in Google Cloud Storage, while videos use Mux for streaming.
- The API needs to provide downloadable assets with consistent authorization and rate limiting.


Decision
- Implement a custom Next.js route to stream assets from GCS and resolve Mux video URLs.


Consequences
- Positive impacts:
  - Asset streaming is handled outside tRPC to support binary responses.
- Trade-offs:
  - Requires GCS credentials and Mux integration for video fallbacks.
  - Custom streaming routes require their own auth and header handling.

Alternatives considered
- Pre‑signed URLs served directly from GCS
- CDN-based delivery with separate auth layer


References
- `src/app/api/v0/lessons/[lesson]/assets/[type]/route.ts`
- `src/lib/handlers/assets/assets.ts`
- `src/lib/handlers/assets/helpers.ts`
- `src/lib/bulk-data/data-stores.ts`
