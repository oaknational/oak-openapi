# Bulk Uploader

A job that runs regularly to perform bulk uploads

## Set up a new Terraform Workspace

Follow the [instructions](https://www.notion.so/oaknationalacademy/Terraform-The-Oak-Guide-to-b3930c13433f48fa890968636f495098?pvs=4#c9a59558baed4fe3867a6bde498bc027) in the Terraform guide on how to do this.

The workspace prefix is `open-api-bulk-loader`.

Staging workspaces need to be placed in the `Staging` project in order to gain suitable permissions.

All required variables other than `tag_id` should be set in Terraform Cloud.

When applying the `tag_id` variable needs to be set, [see below](#Tag-Id).

## Doing a release

For now releases need to be done manually via terraform. Changing the `tag_id` variable will trigger the release.

First ensure you are in the correct workspace (the suffix is the environment name). The selected workspace is marked with an `*`:
```
terraform workspace list
```

If not the correct one you can select a different workspace with:
```
terraform workspace select open-api-bulk-loader-{env name}
```

And finally you can apply your changes:
```
terraform apply --var tag_id=?????
```

If it works correctly a single change should be requested:
```
Plan: 0 to add, 1 to change, 0 to destroy.
```

### Tag Id

As part of CI code is pushed to Google Cloud. It is tagged with a release tag that will either be the tag name, if it is a Git tag, or a date/time stamp otherwise. To see the release tag go to the end of the log for the [Publish Action](https://github.com/oaknational/oak-openapi/actions/workflows/build-bulk-data-image.yml) related to your branch.

## Running the job in staging

By default the job is not scheduled to run anywhere but the production environment. In order to run the job manually you need the following command.

```
gcloud --project oak-national-academy-staging run jobs execute --region europe-west2 ow-{env}-ldn-bulk-uploader
```
