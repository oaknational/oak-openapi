locals {
  application_name_gc = lower(replace(local.application_name, " ", "-"))
}

resource "google_cloud_run_v2_job" "this" {
  name = "ow-${local.env}-ldn-${local.application_name_gc}"

  location            = var.region
  deletion_protection = false

  template {
    template {
      containers {
        image = "europe-west2-docker.pkg.dev/oak-national-academy-ci-cd/oak-open-api/bulk-data:${var.tag_id}"

        env {
          name  = "OAK_GRAPHQL_HOST"
          value = var.graphql_host_url
        }

        env {
          name  = "OAK_GRAPHQL_SECRET"
          value = var.graphql_host_secret
        }

        resources {
          limits = {
            cpu    = "1000m"
            memory = "512Mi"
          }
        }
      }
      timeout = "600s"
    }
  }
}

resource "google_cloud_scheduler_job" "this" {
  count = local.env == "prod" ? 1 : 0

  name        = "ow-${local.env}-ldn-${local.application_name_gc}-cron"
  description = "Do a daily update of ${local.env} ${local.application_name}"
  schedule    = "30 2 * * *"
  time_zone   = "Europe/London"

  region = var.region

  http_target {
    http_method = "POST"
    uri = join("", [
      "https://",
      google_cloud_run_v2_job.this.location,
      "-run.googleapis.com/apis/run.googleapis.com/v1/namespaces/",
      google_cloud_run_v2_job.this.project,
      "/jobs/",
      google_cloud_run_v2_job.this.name,
      ":run"
    ])
    oauth_token {
      service_account_email = data.terraform_remote_state.google_project.outputs.project_config.service_accounts["openapi-bulk-uploader-${local.project_env}"]
      scope                 = "https://www.googleapis.com/auth/cloud-platform"
    }
  }
}