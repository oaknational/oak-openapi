locals {
  workspace_prefix         = "open-api-bulk-loader-"
  project_workspace_prefix = "gcp-project-superuser-"
}

locals {
  env = replace(terraform.workspace, local.workspace_prefix, "")

  project_env = (
    local.env == "prod"
    ?
    "prod"
    :
    "staging"
  )
}

data "terraform_remote_state" "google_project" {
  lifecycle {
    precondition {
      condition     = startswith(terraform.workspace, local.workspace_prefix)
      error_message = "Workspace name \"${terraform.workspace}\" must begin with ${local.workspace_prefix}"
    }
  }

  backend = "remote"
  config = {
    organization = "oak-national-academy"
    workspaces = {
      name = "${local.project_workspace_prefix}${local.project_env}"
    }
  }
}

provider "google" {
  project = data.terraform_remote_state.google_project.outputs.project_id
}

locals {
  application_name    = "Bulk Uploader"
  application_name_gc = lower(replace(local.application_name, " ", "-"))
}
