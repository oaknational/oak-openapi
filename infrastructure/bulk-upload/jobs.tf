module "job" {
  source = "github.com/oaknational/oak-terraform-modules//modules/gcp_job?ref=v2.0.4"

  name_parts = {
    domain = "ow"
    app    = local.application_name_gc
  }

  env          = local.env
  docker_image = "europe-west2-docker.pkg.dev/oak-national-academy-ci-cd/oak-open-api/bulk-data:${var.tag_id}"

  service_account_email = data.terraform_remote_state.google_project.outputs.project_config.service_accounts["openapi-bulk-uploader-${local.project_env}"]

  environment_variables = [
    {
      name  = "OAK_GRAPHQL_HOST"
      value = var.graphql_host_url
    },
    {
      name  = "OAK_GRAPHQL_SECRET"
      value = var.graphql_host_secret
    },
    {
      name  = "OAK_AUTH_TYPE"
      value = var.oak-auth-type
    },
    {
      name  = "HASURA_ROLE"
      value = var.hasura-role
    },
    {
      name  = "BUCKET_NAME"
      value = google_storage_bucket.this.name
    }
  ]

  memory_allocation = 2

  schedule = local.env == "prod" ? {
    crons = ["30 2 * * *"]
  } : null
}
