locals {
  required_env_keys = {
    website = {
      shared  = ["AUTH_USERNAME", "NEXT_PUBLIC_OAK_ASSETS_HOST", "NEXT_PUBLIC_OAK_ASSETS_PATH", "NEXT_PUBLIC_POSTHOG_API_HOST", "NEXT_PUBLIC_POSTHOG_API_KEY", "NEXT_PUBLIC_SANITY_DATASET", "NEXT_PUBLIC_SANITY_PROJECT_ID", "UPSTASH_REDIS_REST_URL"]
      prod    = ["NEXT_PUBLIC_POSTHOG_KEY", "OAK_GRAPHQL_HOST", "PRODUCTION_API_URL"]
      preview = ["OAK_GRAPHQL_HOST"]
    }

    storybook = {
      shared  = []
      prod    = []
      preview = []
    }
  }

  required_sensitive_env_keys = {
    website = {
      shared  = ["AUTH_PASSWORD", "GOOGLE_APPLICATION_CREDENTIALS_JSON", "OAK_API_AUTH_TOKEN", "OAK_GRAPHQL_SECRET", "SANITY_AUTH_SECRET", "UPSTASH_REDIS_REST_TOKEN"]
      prod    = ["PRISMA_ACCELERATE_DATABASE_URL_PROD"]
      preview = ["PRISMA_ACCELERATE_DATABASE_URL_PREVIEW"]
    }
    storybook = {
      shared  = []
      prod    = []
      preview = []
    }
  }

  required_current_env           = local.required_env_keys[local.build_type]
  required_current_sensitive_env = local.required_sensitive_env_keys[local.build_type]

  env_groups = {
    shared  = ["production", "preview"]
    prod    = ["production"]
    preview = ["preview"]
  }

  non_sensitive_vars = flatten([
    for group, target in local.env_groups : [
      for key, value in var.env_vars[group] : {
        key       = key
        value     = value
        target    = target
        sensitive = false
      }
    ]
  ])

  sensitive_env_vars = {
    shared = {
      AUTH_PASSWORD                       = var.AUTH_PASSWORD
      GOOGLE_APPLICATION_CREDENTIALS_JSON = var.GOOGLE_APPLICATION_CREDENTIALS_JSON
      OAK_API_AUTH_TOKEN                  = var.OAK_API_AUTH_TOKEN
      OAK_GRAPHQL_SECRET                  = var.OAK_GRAPHQL_SECRET
      SANITY_AUTH_SECRET                  = var.SANITY_AUTH_SECRET
      UPSTASH_REDIS_REST_TOKEN            = var.UPSTASH_REDIS_REST_TOKEN
    }
    prod = {
      PRISMA_ACCELERATE_DATABASE_URL = var.PRISMA_ACCELERATE_DATABASE_URL_PROD
    }
    preview = {
      PRISMA_ACCELERATE_DATABASE_URL = var.PRISMA_ACCELERATE_DATABASE_URL_PREVIEW
    }
  }

  sensitive_vars = flatten([
    for group, target in local.env_groups : [
      for key, value in local.sensitive_env_vars[group] : {
        key       = key
        value     = value
        target    = target
        sensitive = true
      } if value != null
    ]
  ])

  environment_variables = concat(local.non_sensitive_vars, local.sensitive_vars)
}
