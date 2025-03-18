# Oak National API

This repository holds the front and backend code for the API. This readme is primarily for development and for developers to know how to run the project locally and how to manage the project online (such as where data is held, caveats, etc).

## Development

Required dependencies:

1. node@20
2. pnpm@8
3. Access to OWA hasura staging instance

Installation and development:

1. `pnpm install`
2. `pnpm dev`

Development server should be running on http://localhost:2727 and the interactive playground is at http://localhost:2727/playground

An API key is required to call RESTful endpoint.

If the `API_KEY` value is in your `.env` file, there is also a command line helper to run API requests:

```sh
bin/g /subject/maths
```

This can also be used to request against production:

```sh
bin/g prod /subjects/maths
```

## API keys

Currently these are managed by Oak through an admin tool (found in this repo: `src/pages/admin/index.tsx`).

Accounts are stored in a redis database on [upstash](https://console.upstash.com/login).

## Available subjects

The subjects and key stages available in the endpoints on the API are hard coded (automatically) into the project. This is generated using a build command (which can be updated locally), but the code is committed to the repository.

To update the subjects list (say if there's a new cohort of lessons and subjects):

1. Start the development server: `$ pnpm dev`
2. Then run the build script in a separate terminal (as it uses the server to generate the subjects:

```shell
$ pnpm run build-subjects
```

This will update the file `~/lib/keyStageAndSubjects.json` which will need to be committed to the repo.

### Errors

As a note, throwing errors using vanilla JavaScript should _only_ be used for development errors (specifically when they'll be caught and handled), as they include the stack and get sent back to the user.

In nearly all cases, the `TRPCError` should be thrown with the appropriate HTTP code.

For example, an internal error would throw as such:

```ts
throw new TRPCError({
 message: 'Unexpected answer type',
 code: 'INTERNAL_SERVER_ERROR',
});
```

A user error (such as an unknown subject is requested) is:

```ts
throw new TRPCError({
   message: `Invalid subject: ${res.subjectSlug}`,
   code: 'BAD_REQUEST',
 });
```

## Analytics / Logging

Currently the following data is connected to user accounts (in upstash):

1. Rate limit
2. Total request count
3. Last request timestamp

In datadog, under the `open-api.thenational.academy` service, each request is logged and includes the following key data:

1. Requesting `userId`
2. `url` requested (this is different from `path` which is always the `[...trpc]` path)
3. `query` which includes arguments passed (such as `year` on endpoints) and `trpc` arguments (that slot into the endpoint URL).

## Batch requests for video urls

In some cases, whilst we don't have the bulk download features up and running, a 3rd party may require direct Mux URLs to videos.

A script is available to generate this. You will need the following prerequisites:

1. `OAK_GRAPHQL_HOST` pointing to production Hasura (to ensure the latest data)
2. `MUX_TOKEN` with read access as some videos won't be available and the Mux API is required to both find the static renditions, but also (in future) render the static mp4 files when entirely missing
3. A JSON file containing an array of strings, those strings being the lesson slugs

Assuming your environment is in place, and assuming that your slugs are in `./slugs.json`, run the following command:

```sh
pnpx tsx bin/get-direct-video-links.ts ./slugs.json > results.csv
```

The results.csv file is a CSV (without a header) that contains the URL and the lesson slug. This is to help ensure that the order is aligned to the original list.

## Infrastructure

- TypeScript across nearly all code (exceptions being eslint config and next config)
- pnpm is used to manage dependencies
- The project uses Nextjs for routing
- trpc-server for types
- zod to define the types
- trpc-openapi to add the openapi metadata
- graphql and some direct sql is used against the Oak Web Application (OWA) hasura based database

# Bulk Download

The bulk download feature allows you to download all assets (videos, worksheets, slide decks, quizzes, etc.) for entire sequences, organized into tar archives.

## Using the Bulk Download Script

The prepare-bulk.ts script creates organized archives of Oak educational content for offline use.

### Prerequisites

1. Access to Oak's Google Cloud Storage (set via `GOOGLE_APPLICATION_CREDENTIALS_JSON` env variable)
2. Database access (set via `DATABASE_URL` env variable)
3. OWA Hasura access (for GraphQL queries)

### Running the Script

To generate bulk download packages:

```sh
pnpx tsx bin/prepare-bulk.ts
```

### Output Structure

The script generates a directory structure in the `out` folder organized by sequence:

```
out/
  └── {sequence-slug}/
      ├── sequence.json           # Metadata about the sequence
      ├── units.jsonl             # Information about each unit
      ├── lessons.jsonl           # Details about each lesson including asset references
      ├── {sequence-slug}-videos.tar       # Archive of all video files
      ├── {sequence-slug}-worksheets.tar   # Archive of all worksheets and answer sheets
      ├── {sequence-slug}-slide-decks.tar  # Archive of all presentation files
      ├── {sequence-slug}-quizzes.tar      # Archive of all starter and exit quizzes
      └── {sequence-slug}-resources.tar    # Archive of all supplementary resources
```

Each file inside the tar archives is named with the sequence slug prefix (e.g., `math-primary-lesson1.mp4`).

The lessons.jsonl file contains references to all assets for each lesson, using the format `{tar-filename}:{file-path-in-tar}`.

# Load testing

Required dependencies:

1. [Artillery](https://www.artillery.io/docs/get-started/get-artillery) installed globally

How to run:

1. Set env vars for target URL and auth token.
2. `pnpm load-test`

## Required env values

Complete the values in `.env.example` and rename to `.env`
