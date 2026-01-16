# ADR 0006: Use Upstash Redis for API keys and rate limiting


Status
- Accepted (historical record)


Date recorded
- 2025-12-31 (retroactive)


Retroactive note
- This ADR was created after the fact from existing code and documentation. The original decision date is not known.


Context
- The API requires API key storage, request tracking, and per‑user rate limiting.
- A managed Redis service simplifies operations and integration.


Decision
- Use Upstash Redis for API key storage and request counters.
- Use `@upstash/ratelimit` for sliding window rate limits.


Consequences
- Positive impacts:
  - Rate limit headers are attached to responses for client visibility.
- Trade-offs:
  - Requires Upstash environment variables in production and development.
  - Adds dependency on Upstash service availability.

Alternatives considered
- Store API keys in a database table
- Apply rate limiting at the edge or via an API gateway


References
- `src/lib/redis.ts`
- `src/lib/apikeys.ts`
- `src/lib/rateLimit.ts`
- `src/lib/protect.ts`
