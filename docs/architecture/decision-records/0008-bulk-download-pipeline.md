# ADR 0008: Provide a bulk download pipeline for offline data


Status
- Accepted (historical record)


Date recorded
- 2025-12-31 (retroactive)


Retroactive note
- This ADR was created after the fact from existing code and documentation. The original decision date is not known.


Context
- Some integrators need offline or batch access to curriculum data and assets.
- Bulk exports reduce API load and provide a predictable snapshot.


Decision
- Provide a bulk download pipeline using Node scripts to assemble JSON and asset archives.
- Upload bulk outputs to GCS for distribution.


Consequences
- Positive impacts:
  - Output includes JSON plus optional tar archives for assets.
- Trade-offs:
  - Bulk generation is a long‑running process with additional operational steps.
  - Long-running jobs benefit from scheduling and monitoring discipline.

Alternatives considered
- On‑demand bulk export endpoints
- Scheduled data warehouse exports


References
- `bin/prepare-bulk.ts`
- `src/lib/bulk-data/*`
- `bin/bulk-download-videos.sh`
- `README_BULK_DOWNLOAD.md`
