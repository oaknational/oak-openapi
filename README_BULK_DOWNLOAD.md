# Bulk Download Process

The bulk download process will generate a static copy of all the assets that are used to drive Oak National's content.

The final content structure is:

```
out/
  └── {sequence-slug}/
      ├── {sequence-slug}.json             # metadata about the sequence
      ├── {sequence-slug}-videos.tar       # all lesson video files
      ├── {sequence-slug}-worksheets.tar   # all worksheets and answer sheets
      ├── {sequence-slug}-slide-decks.tar  # all PPTX slides
      ├── {sequence-slug}-quizzes.tar      # all starter and exit quizzes
      └── {sequence-slug}-resources.tar    # supplementary resources
```

Note that the tarballs are optional and don't build by default.

Inside the tarballs, the files are named as `{lesson-slug}.{ext}`.

To run the script, use (for a single sequence `science-secondary`):

```
$ pnpm bulk science-secondary
```

## System overview

A (currently) single threaded process will gather all the subjects and phases in cycle 2 that are live. Each sequence is then processed.

## Prerequisites

1. Access to Oak's Google Cloud Storage (set via `GOOGLE_APPLICATION_CREDENTIALS_JSON` env variable)
2. OWA Hasura access (for GraphQL queries via `OAK_GRAPHQL_HOST`)

## Required env values:

- GOOGLE_APPLICATION_CREDENTIALS_JSON: Google Cloud credentials
- OAK_GRAPHQL_HOST: GraphQL host URL
- OAK_GRAPHQL_SECRET: Authentication key for GraphQL API

## Optional env value:

- BUCKET_NAME: Storage bucket name - defaults to `oak_bulk_data_store`
- INCLUDE_ASSETS: Flag for processing assets - defaults to `false`

## Key software

1. `bin/papare-bulk.ts`
2. `bin/bulk-download-videos.sh` (optional)

### prepare-bulk

This is the main script that performs the downloads all the unit and lesson data. All the text based data (string based from the database) is added to `{sequence-slug}.json` (including transcripts).

Once complete, each file is uploaded to the Google Storage bucket.

Then if the assets are included (`INCLUDE_ASSETS=true`) during the build _and_ available for the lesson (through the gateway logic), all the assets are downloaded form Google Could Storage and added to individual tarballs (listed earlier).

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

- [ ] Additional unit tests and inline/runtime tests