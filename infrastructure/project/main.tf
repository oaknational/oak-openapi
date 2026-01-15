locals {
  workspace_prefix = "oak-openapi-project-"

  build_type = replace(terraform.workspace, local.workspace_prefix, "")

  build_config = local.builds[local.build_type]
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
  source                           = "github.com/oaknational/oak-terraform-modules//modules/vercel_project?ref=v1.3.7"
  build_command                    = try(local.build_config.build_command, null)
  build_type                       = local.build_config.build_type
  cloudflare_zone_domain           = var.cloudflare_zone_domain
  domains                          = try(local.build_config.domains, [])
  environment_variables            = try(local.build_config.environment_variables, [])
  framework                        = local.build_config.framework
  git_repo                         = "oaknational/oak-openapi"
  install_command                  = "pnpm install"
  project_visibility               = "public"
  protection_bypass_for_automation = false
  skew_protection                  = try(local.build_config.skew_protection, null)
}