locals {
  workspace_prefix = "oak-openapi-project-"
}

resource "terraform_data" "workspace_validation" {
  lifecycle {
    precondition {
      condition     = startswith(terraform.workspace, local.workspace_prefix)
      error_message = "Workspace name \"${terraform.workspace}\" must begin with ${local.workspace_prefix}"
    }
  }
}

module "vercel" {
  source                           = "github.com/oaknational/oak-terraform-modules//modules/vercel_project?ref=v2.1.0"
  build_command                    = "pnpm build"
  build_type                       = "website"
  cloudflare_zone_domain           = var.cloudflare_zone_domain
  environment_variables            = local.environment_variables
  framework                        = "nextjs"
  project_visibility               = "public"
  git_repo                         = "oaknational/oak-openapi"
  install_command                  = "pnpm install"
  protection_bypass_for_automation = false

  domains = ["open-api.thenational.academy"]
}
