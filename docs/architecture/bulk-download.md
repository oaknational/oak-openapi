# Bulk download pipeline

Purpose
- Describe how bulk outputs are generated, packaged, and served.

Version framing
- The public API is v0 (public alpha moving toward public beta).
- V0 items focus on correctness and trust; V1 items are deeper refinements after v0 stability.

Pipeline overview
```text
bin/prepare-bulk.ts
  |
  +--> Hasura GraphQL/SQL (curriculum data)
  |
  +--> Optional assets (GCS downloads)
  |
  v
out/{sequence}/
  - {sequence}.json
  - lessons.jsonl (when assets enabled)
  - asset tar files
  |
  v
Upload to GCS
  |
  v
/api/bulk -> zip + stream selected outputs
```

Asset handling flow
```text
prepare-bulk.ts
  |
  v
assets.ts -> tar archives
  |
  v
videos.tsv queue
  |
  v
bulk-download-videos.sh
  |
  v
Upload tar files to GCS
```

Environment notes
- `OAK_GRAPHQL_HOST` and `OAK_GRAPHQL_SECRET` are required for curriculum data.
- `GOOGLE_APPLICATION_CREDENTIALS_JSON` is required for local GCS access (Cloud Run can use default credentials).
- `INCLUDE_ASSETS=true` enables asset packaging and requires Node 22+.
- `BUCKET_NAME` overrides the upload bucket for bulk outputs.
- `BULK_DATA_BUCKET` controls the download API bucket (defaults to `oak-prod-ldn-bulk-uploader`).

Bulk vs API alignment
- Bulk exports are snapshot-style and may include lesson metadata that the live API gates.
- API responses are shaped for specific use cases (grouped lists, filtered endpoints).
- Assets in bulk are references into tar archives, while the API provides per-lesson URLs.

V0/V1 alignment
- V0: document canonical lesson outputs and align bulk/API gating expectations.
- V0: fix the bulk video packaging sentinel handling for reliable tar creation.
- V1: add manifests, checksums, and optional gating alignment for bulk runs.

Related ADRs
- `docs/architecture/decision-records/0008-bulk-download-pipeline.md`
- `docs/architecture/decision-records/0007-asset-delivery-gcs-mux.md`

Related docs
- `README_BULK_DOWNLOAD.md`
- `docs/architecture/content-gating.md`
