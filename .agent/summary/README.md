# Summary notes

Version framing
- The public API is v0 (public alpha moving toward public beta); prioritize V0 critical fixes first.
- V1 improvements are deeper refinements after v0 stability goals; see [`.agent/summary/analysis/versioned-improvements.md`](analysis/versioned-improvements.md) for the split.

This folder contains a living, file-by-file summary of the oak-openapi repo.

How to use this summary:
- Start with [index.md](index.md) to find the topic file you want.
- Each file focuses on a single concern (architecture, data, CMS, etc.).
- If code or docs change, update the specific summary file and then update [index.md](index.md).
- See [`.agent/summary/deep-dives/deep-dive.md`](deep-dives/deep-dive.md) for instructions, diagrams, explanations, and examples.
- Gap analysis and enhancement analysis live in [`.agent/summary/analysis/`](analysis/).

Directory layout
- `overview/`: high-level system description and architecture.
- `deep-dives/`: deep analysis reports and todo plan.
- `analysis/`: gaps, enhancements, and versioned improvement plans.
- `guides/`: mapping and alignment guides for integrators.

Scope and freshness:
- Facts reflect a repository read-through, not a running system.
- If a detail in code disagrees with a note here, the code wins and this summary should be updated.
