# Bulk Download Process

The bulk download process will generate a static copy of all the assets that are used to drive Oak National's content.

The final content structure is:

```
out/
  └── {sequence-slug}/
      ├── sequence.json           # metadata about the sequence
      ├── units.jsonl             # information about each unit
      ├── lessons.jsonl           # details about each lesson including asset references
      ├── {sequence-slug}-videos.tar       # all lesson video files
      ├── {sequence-slug}-worksheets.tar   # all worksheets and answer sheets
      ├── {sequence-slug}-slide-decks.tar  # all PPTX slides
      ├── {sequence-slug}-quizzes.tar      # all starter and exit quizzes
      └── {sequence-slug}-resources.tar    # supplementary resources
```

Inside the tarballs, the files are named as `{lesson-slug}.{ext}`, for example `

TODO add transcripts as the separate resource

## System overview

A (currently) single threaded process will gather all the subjects and phases in cycle 2 that are live. Each sequence is then processed.

Processing involves collecting every unit, writing this to `units.jsonl`

## Prerequisites

1. Access to Oak's Google Cloud Storage (set via `GOOGLE_APPLICATION_CREDENTIALS_JSON` env variable)
2. Database access (set via `DATABASE_URL` env variable)
3. OWA Hasura access (for GraphQL queries via `OAK_GRAPHQL_HOST`)

Typically the database url will point to the [local proxied](https://www.notion.so/oaknationalacademy/Using-a-remote-proxy-with-Hasura-instances-a08746d2d79a4c0f9ad28be4ae502ffa?pvs=4) database.

## Key software

1. `bin/papare-bulk.ts`
2. `bin/bulk-download-videos.sh`

## Timings

For a single sequence

- 10 min to tar videos
- 2 hours to download
-