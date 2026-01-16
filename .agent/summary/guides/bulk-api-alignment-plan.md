# Bulk vs API alignment plan

Version framing
- The public API is v0 (public alpha moving toward public beta); prioritize V0 critical fixes first.
- V1 improvements are deeper refinements after v0 stability goals; see `.agent/summary/analysis/versioned-improvements.md` for the split.

Goal
- Reduce surprises for integrators by aligning bulk exports and API responses, while preserving flexibility for offline use cases.

Guiding principles
- Keep current functionality working; changes should be additive or clearly documented.
- Prefer explicit documentation when strict alignment is not feasible.
- Maintain licensing and gating safeguards as the primary source of truth.

Decision points (to confirm with stakeholders)
- Should bulk lesson metadata follow the same gating rules as the API?
- Is the canonical lesson list `lessons.jsonl`, `{sequence}.json`, or both?
- Do we want a formal mapping between bulk outputs and API responses published for integrators?

Proposed phased approach

Phase 1: Documentation and clarity (low risk)
- Publish a mapping guide that explains bulk fields vs API endpoints and shapes.
- Add a short "consistency notes" section to bulk download documentation.
- Clearly state that bulk exports are snapshot-based and may include gated content metadata.

Phase 2: Output shape alignment (moderate effort)
- Ensure `lessons` are present in `{sequence}.json` even when assets are enabled, or document `lessons.jsonl` as the canonical source.
- Add a small manifest file to each bulk output describing included files and their schemas.

Phase 3: Gating alignment (policy-driven)
- Reuse `queryGate` logic in bulk scripts when generating lesson metadata.
- Alternatively, add a configurable flag: `BULK_APPLY_GATING=true` to allow opt-in alignment.

Phase 4: Validation and tests
- Add a smoke test that validates a sample sequence shows consistent results between bulk and API for a known allowlisted subject.
- Add a simple schema check for bulk outputs (JSON and JSONL) to detect regressions.

Risks and mitigations
- Risk: Tight alignment could reduce bulk completeness for offline analytics.
  - Mitigation: Make gating alignment opt-in or provide both gated and ungated exports.
- Risk: Changing bulk output structure could affect downstream users.
  - Mitigation: Version bulk output format and include a manifest.

Success criteria
- Integrators can locate equivalent information across bulk and API with minimal confusion.
- Bulk outputs consistently document what is gated and why.
- Bulk output structure remains stable or versioned when changes occur.

External evidence
- Bulk integrity examples live in `.agent/external-feedback-and-requests/from-mcp-semantic-search-work/15-bulk-download-examples.md`.
- External summary tables are in `.agent/external-feedback-and-requests/from-mcp-semantic-search-work/08-summary-and-coordination.md`.
