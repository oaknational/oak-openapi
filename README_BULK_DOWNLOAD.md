# Bulk Download Process

The bulk download process will generate a static copy of all the assets that are used to drive Oak National's content.

The data is organised by subject & phase, for example: Maths, Primary - making a "sequence-slug" of `maths-primary`.

## Related docs

- [docs/architecture/bulk-download.md](docs/architecture/bulk-download.md) (bulk download architecture)
- [docs/engineering/README.md](docs/engineering/README.md) (planning structure)
- [docs/engineering/onboarding.md](docs/engineering/onboarding.md) (local setup and common tasks)

The final content structure of the build process is:

```
out/
  └── {sequence-slug}/
      └── {sequence-slug}.json             # metadata about the sequence
```

To run the script, use (for a single sequence `science-secondary`):

```
$ pnpm bulk science-secondary
```

The additional assets can be collected but require a lot of compute power and a lot of time (in the region of 10+ hours for the entire curriculum). If the assets are optionally included (via env values below) the directory output is as follows:


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

Inside the tarballs, the files are named as `{lesson-slug}.{ext}`, and a referenced inside the `lessons` property of the `{sequence-slug}.json`.

## Release process

1. Pushing new docker images to GCP
2. If staging, jump to (4)
3. Tag release on main
4. Run terraform tagging
5. Manually triggering GCP Cloud Run

### Pushing new dockers image to GCP

All new pull requests automatically push a new docker image to GCP. This can be seen in the [Publish github action](https://github.com/oaknational/oak-openapi/actions/workflows/build-bulk-data-image.yml).

A pushed image can only be used to generate the bulk data once it's been tagged by Terraform.

To find the correct tag for the preview deploy, open the the deploy job for "Publish", and open the "Release Tag":

![](https://raw.githubusercontent.com/oaknational/oak-openapi/refs/heads/main/.github/assets/SCR-20250603-lcmc.png)

### Releasing a production image

All PRs are released as staging. To release a production docker image to then tag requires [a new release](https://github.com/oaknational/oak-openapi/releases/new) on Github.

Please follow the semver versioning, ideally tracking the version shown on the API playground.

Once the release is published, it will trigger the deploy job that you can then tag in Terraform. The version tag is the version you used in the Github release process.

### Run terraform tagging

Once you've configured Terraform, and you've collected the version tag from the build, on the command line navigate to `./infrastructure/bulk-data`.

Now select the appropriate workspace:

```sh
$ terraform workspace select open-api-bulk-loader-$STAGE
```

Then tag the version (where `$VERSION` is the version tag from the docker image):

```sh
$ terraform apply --var tag_id=$VERSION
```

You'll be given a Terraform URL to follow the deployment, and prompted if you want to release the image from the command line.

Once the image is tagged with Terraform, you have the option to manually trigger the cloud run process.

The cloud run process also runs automatically every day at 2am, but it's recommend to manually run the process once to ensure there's no issues.

### Manually triggering GCP Cloud Run

Navigate to GCP's Cloud Run jobs tab (note that by default the "services" tab is selected).

The job name is `ow-$STAGE-ldn-bulk-uploader` and changes depending on the project context (i.e. `$STAGE` is `beta` on the `oak-national-academy-staging` project, and `prod` on the production environment).

Click through to the job, and with the latest release selected (sorted by "Creation time") then click the "Execute":

![](https://raw.githubusercontent.com/oaknational/oak-openapi/refs/heads/main/.github/assets/SCR-20250603-lgoe.png)

If all is successful, you should get a green tick after approximately 3-4 minutes and the artefacts have been sent to the appropriate GCP storage bucket.

Staging sends to `oak-beta-ldn-bulk-uploader`, and production to `oak-prod-ldn-bulk-uploader`.



### To configure Terraform

Move to the `./infrastructure/bulk-data` directory, then run:

```sh
$ brew install tfenv
$ tfenv use 1.12.1 # note that this version could change in future
$ terraform login
```

Once the log in is complete, you need to select the workspace, test you have access first (whilst still in `./infrastructure/bulk-data` directory):

```sh
$ terraform workspace list
```

You should see:

```
open-api-bulk-loader-beta
open-api-bulk-loader-prod
```

If you don't see these contact the Oak Ops team to ensure you have the [correct workspace](https://app.terraform.io/app/oak-national-academy/workspaces) access.

To perform a staging release the workspace is `open-api-bulk-loader-beta`, otherwise production is `open-api-bulk-loader-prod`. Now select the workspace:

```sh
$ terraform workspace select open-api-bulk-loader-prod
```

Now the environment is ready to tag a release for Terraform to use.

## Development

### Prerequisites

1. Access to Oak's Google Cloud Storage (set via `GOOGLE_APPLICATION_CREDENTIALS_JSON` env variable)
2. OWA Hasura access (for GraphQL queries via `OAK_GRAPHQL_HOST`)
3. Node 22+ if `INCLUDE_ASSETS=true` (asset packaging)

### Required env values:

- GOOGLE_APPLICATION_CREDENTIALS_JSON: Google Cloud credentials
- OAK_GRAPHQL_HOST: GraphQL host URL
- OAK_GRAPHQL_SECRET: Authentication key for GraphQL API

### Optional env value:

- INCLUDE_ASSETS: Flag for processing assets - defaults to `false`
- BUCKET_NAME: if included, this will send the assets to a specific GCP bucket (the Cloud Run GCP does not need this)

### Key software

1. `bin/prepare-bulk.ts`
2. `src/lib/bulk-data/*` - libs for the bulk download
3. `bin/bulk-download-videos.sh` (optional and only used with assets)

#### prepare-bulk

This is the main script that performs the downloads all the unit and lesson data. All the text based data (string based from the database) is added to `{sequence-slug}.json` (including transcripts).

Then if the assets are included (`INCLUDE_ASSETS=true`) during the build _and_ available for the lesson (through the gateway logic), all the assets are downloaded from Google Cloud Storage and added to individual tarballs (listed earlier).

Video download URLs are appended to a file called `videos.tsv` which is monitored by `bulk-download-videos.sh`. Once all the videos have been added to this file, an entry with the following line is added to indicate to the downloading script the list is complete and the individual mp4 files should be tar'ed up into a single file:

```
complete\tnop\t{sequenceSlug}
```

The `nop` has no use.

#### bulk-download-videos

This is a shell script that monitors the `videos.tsv` file always reading the first line of the file. Typically this will be the URL of a download, the filename it should be saved as and the directory (the sequence slug) to save to.

This is in a separate script because of deep-rooted bugs in Node that can cause uncatchable errors when network requests fail in a particular (usually unrepeatable) manner.
