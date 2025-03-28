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

To run the script, use (for a single sequence `science-secondary`):

```
$ NODE_OPTIONS="--no-deprecation" tsx bin/prepare-bulk.ts science-secondary
```

**Note** currently the code is modified to stop after the first sequence. This is only to prevent running out of disk space.

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

### prepare-bulk

This is the main script that performs the downloads all the unit and lesson data. All the metadata (string based from the database) is added to `units.jsonl` and `lessons.jsonl` (note: these are JSON with _lines_).

Then if the assets are available for the lesson (through the gateway logic), all the assets are downloaded form Google Could Storage and added to individual tarballs (listed earlier).

Video download URLs are appended to a file called `videos.tsv` which is monitored by `bulk-download-videos.sh`. Once all the videos have been added to this file, an entry with the following line is added to indicate to the downloading script the list is complete and the individual mp4 files should be tar'ed up into a single file:

```
complete\tnop\t{sequenceSlug}
```

The `nop` has no use.

### bulk-download-videos

This is a shell script that monitors the `videos.tsv` file always reading the first line of the file. Typically this will be the URL of a download, the filename it should be saved as and the directory (the sequence slug) to save to.

This is in a separate script because of deep rooted bugs in Node that can cause uncatchable errors when network requests fail in a particular (usually unrepeatable) manner.

## TODO

The following parts are still needing to be completed:

- [ ] Send across final artefacts to Google Storage for long term storage and availability
- [ ] Ideally reduce the repeated code (around downloading PDFs from google storage)
- [ ] Tests
- [ ] Possibly other bits