# ADR 0012: Apply content gating via allow/deny lists

Status
- Accepted (historical record)

Date recorded
- 2025-12-31 (retroactive)

Retroactive note
- This ADR was created after the fact from existing code and documentation. The original decision date is not known.

Context
- Licensing constraints require restricting access to certain subjects, units, or lessons.
- The API needs to prevent distribution of content outside current licensing scope.

Decision
- Implement content gating via allow/deny lists and gating helpers in `queryGate`.

Consequences
- Positive impacts:
  - Gating is enforced in multiple endpoints (lessons, assets, transcripts, questions, sequences).
- Trade-offs:
  - Allow/deny lists require ongoing maintenance and review.

Alternatives considered
- Centralized policy service
- License state stored in the primary data source

References
- `src/lib/queryGate.ts`
- `src/lib/queryGateData/*`
- `src/lib/blockedContent.ts`
- `src/lib/handlers/*`
