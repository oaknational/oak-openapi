# Architecture visibility and target state

Version framing
- The public API is v0 (public alpha moving toward public beta); prioritize V0 critical fixes first.
- V1 improvements are deeper refinements after v0 stability goals; see [.agent/summary/analysis/versioned-improvements.md](.agent/summary/analysis/versioned-improvements.md) for the split.

Current state (implicit vs explicit)
- System boundaries are mostly implicit in the codebase (Next.js app plus external dependencies).
- Infrastructure topology is partially documented (Terraform notes and bulk uploader job docs).
- Operational constraints are scattered across code and README (API key, rate limits, gating) and not centralized.

Gaps
- No single, explicit source for system boundary, domain concerns, and ownership notes.
- No centralized topology view that shows hosting + external dependencies together.
- Operational constraints and environment differences are not consolidated.

Target state (what should be)
- A clear system boundary doc that defines in-scope vs out-of-scope concerns.
- A topology doc that lists hosting, external dependencies, and job infrastructure.
- A concise operational constraints section (rate limits, gating, required deps, env assumptions).
- Progressive disclosure path for onboarding (start here -> architecture -> deep dives).

How to get there
- Keep [`docs/architecture/system-boundaries.md`](../../../docs/architecture/system-boundaries.md), [`docs/architecture/infrastructure-topology.md`](../../../docs/architecture/infrastructure-topology.md), and [`docs/architecture/architecture-map.md`](../../../docs/architecture/architecture-map.md) updated as code changes.
- Add a "docs updated" check to [`docs/engineering/safe-change-checklist.md`](../../../docs/engineering/safe-change-checklist.md).
- Review these docs during v0 stabilization to capture any gaps that surface during fixes.
