# Deep dive: bulk download pipeline reliability

Version framing
- The public API is v0 (public alpha moving toward public beta); prioritize V0 critical fixes first.
- V1 improvements are deeper refinements after v0 stability goals; see [.agent/summary/analysis/versioned-improvements.md](.agent/summary/analysis/versioned-improvements.md) for the split.

Scope
- Bulk data generation script, asset packaging, and download/transfer pipeline.
- Reliability, correctness, and operational considerations.

Primary files
- `bin/prepare-bulk.ts`
- `src/lib/bulk-data/*`
- `bin/bulk-download-videos.sh`
- [README_BULK_DOWNLOAD.md](README_BULK_DOWNLOAD.md)

Pipeline flow
```
prepare-bulk.ts
  |
  v
Get subjects -> sequences -> units -> lessons (GraphQL + SQL)
  |
  v
If INCLUDE_ASSETS:
  - build tar packs
  - enqueue video downloads to videos.tsv
  - stream assets into tar files
  |
  v
Write out/{sequence}/ (json + optional jsonl/tar files)
  |
  v
Upload to GCS (if BUCKET_NAME set)
  |
  v
bulk-download-videos.sh
  - download videos
  - tar videos
  - upload to GCS
```

Reliability findings (high-impact)
- Video packaging script uses an uninitialized variable in the "complete" path, which can prevent tar creation and cleanup.
  - Evidence: `bin/bulk-download-videos.sh`.

Reliability findings (medium)
- When assets are included, lesson data is written to `lessons.jsonl` but not collected into the `lessons` array used in `{sequence}.json`, which can leave `lessons` empty in the main JSON output.
  - Evidence: `bin/prepare-bulk.ts`.
- Error handling attempts to remove a sequence directory with `fs.rmdir` (non-recursive), which may fail if partial files exist.
  - Evidence: `bin/prepare-bulk.ts`.
- The video download script currently uploads to a hard-coded bucket (`gs://oak_bulk_data_store`) rather than using environment configuration.
  - Evidence: `bin/bulk-download-videos.sh`.

Reliability findings (low)
- Node version check compares `process.version` as a string, which can behave unexpectedly across versions.
- Tar streams are not wrapped in retry logic; partial failures can leave incomplete archives.

Consistency with individual endpoints
- Bulk export includes lesson metadata for all sequences returned by Hasura subject-phase views, while some API endpoints apply gating (subject/unit/lesson blocks). This can lead to bulk data containing lessons that the API would not return in real-time queries.
- Asset gating is applied only to assets (not to lesson metadata), so bulk downloads may include lesson text for blocked subjects or units even when assets are withheld.
- The shapes and grouping in bulk outputs (per-sequence JSON, units/lessons lists) differ from API response shapes (grouped by year/unit or filtered by subject/sequence), which can be unexpected for integrators expecting a one-to-one mapping.

Recommendations

V0/V1 alignment
- V0: prioritize fixes that improve correctness, safety, and client trust.
- V1: schedule deeper refactors and enhancements after V0 stability goals are met.

- Fix the "complete" branch in `bulk-download-videos.sh` to use a properly initialized output directory variable.
- Decide on a single canonical format for lesson data when assets are included and align JSON output with README.
- Use recursive directory cleanup on failure or a safer cleanup strategy.
- Parameterize the video upload bucket to align with `BUCKET_NAME` or an explicit env var.
- Consider an explicit compatibility note or mapping guide that explains how bulk exports relate to API endpoints (including gating differences).

Testing notes
- There are no automated tests currently covering bulk data output structure or asset packaging.

Evidence list
- `bin/prepare-bulk.ts`
- `src/lib/bulk-data/assets.ts`
- `src/lib/bulk-data/data-stores.ts`
- `src/lib/bulk-data/get-data.ts`
- `src/lib/bulk-data/utils.ts`
- `bin/bulk-download-videos.sh`
- [README_BULK_DOWNLOAD.md](README_BULK_DOWNLOAD.md)
