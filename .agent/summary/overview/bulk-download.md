# Bulk download pipeline

Version framing
- The public API is v0 (public alpha moving toward public beta); prioritize V0 critical fixes first.
- V1 improvements are deeper refinements after v0 stability goals; see `.agent/summary/analysis/versioned-improvements.md` for the split.

Bulk data generation (script)
- Main script: `bin/prepare-bulk.ts` (see `README_BULK_DOWNLOAD.md`).
- Produces `out/{sequence-slug}/` with `{sequence-slug}.json` plus optional tar archives for videos, worksheets, slide decks, quizzes, and resources.
- Uses OWA GraphQL/SQL for sequence, unit, and lesson data; writes `lessons.jsonl` during processing.
- Optional asset processing is gated by `INCLUDE_ASSETS=true` and uses subject/unit gating from `src/lib/queryGate.ts`.

Asset handling
- Assets are fetched from GCS and packaged with `tar-stream` in `src/lib/bulk-data/assets.ts`.
- Video downloads are queued to `videos.tsv` and processed asynchronously by `bin/bulk-download-videos.sh`.
- The video script monitors `videos.tsv`, downloads videos, tars them, uploads to GCS, and cleans up local output.

Bulk download API and UI
- `src/app/api/bulk/route.ts` builds a zip of selected subject JSON files from GCS and streams it to the client.
- Bulk download UI lives in `src/app/(pages)/bulk-download` and `src/components/bulkDownload/*`.

Environment and storage
- GCS auth via `GOOGLE_APPLICATION_CREDENTIALS_JSON` (or default credentials).
- Bucket selection via `BUCKET_NAME` (upload) and `BULK_DATA_BUCKET` (download API).
