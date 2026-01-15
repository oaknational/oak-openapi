variable "cloudflare_zone_domain" {
  description = "Domain name for the zone"
  type        = string
  default     = "thenational.academy"
}

variable "env_vars" {
  type = object({
    shared = optional(object({
      AUTH_USERNAME                 = optional(string)
      NEXT_PUBLIC_OAK_ASSETS_HOST   = optional(string)
      NEXT_PUBLIC_OAK_ASSETS_PATH   = optional(string)
      NEXT_PUBLIC_POSTHOG_API_HOST  = optional(string)
      NEXT_PUBLIC_POSTHOG_API_KEY   = optional(string)
      NEXT_PUBLIC_SANITY_DATASET    = optional(string)
      NEXT_PUBLIC_SANITY_PROJECT_ID = optional(string)
      UPSTASH_REDIS_REST_URL        = optional(string)
    }))
    prod = optional(object({
      NEXT_PUBLIC_POSTHOG_KEY = optional(string)
      OAK_GRAPHQL_HOST        = optional(string)
      PRODUCTION_API_URL      = optional(string)
    }))
    preview = optional(object({
      OAK_GRAPHQL_HOST = optional(string)
    }))
  })
  validation {
    condition = alltrue([
      for gk, gv in local.required_current_env : alltrue([
        toset(keys({ for k, v in var.env_vars[gk] : k => v if v != null && v != "" })) == toset(gv)
      ])
    ])
    error_message = "Environment variables don't match requirements for '${local.build_type}' build. Required: ${jsonencode(local.required_current_env)}"
  }
}

variable "AUTH_PASSWORD" {
  description = "Auth Password"
  type        = string
  sensitive   = true
  default     = null


  validation {
    condition = contains(local.required_current_sensitive_env.shared, "AUTH_PASSWORD") ? var.AUTH_PASSWORD != null : var.AUTH_PASSWORD == null

    error_message = contains(local.required_current_sensitive_env.shared, "AUTH_PASSWORD") ? "Missing AUTH_PASSWORD for '${local.build_type}' build." : "AUTH_PASSWORD is set but not required for '${local.build_type}' build."
  }
}

variable "GOOGLE_APPLICATION_CREDENTIALS_JSON" {
  description = "Google application credentials"
  type        = string
  sensitive   = true
  default     = null


  validation {
    condition = contains(local.required_current_sensitive_env.shared, "GOOGLE_APPLICATION_CREDENTIALS_JSON") ? var.GOOGLE_APPLICATION_CREDENTIALS_JSON != null : var.GOOGLE_APPLICATION_CREDENTIALS_JSON == null

    error_message = contains(local.required_current_sensitive_env.shared, "GOOGLE_APPLICATION_CREDENTIALS_JSON") ? "Missing GOOGLE_APPLICATION_CREDENTIALS_JSON for '${local.build_type}' build." : "GOOGLE_APPLICATION_CREDENTIALS_JSON is set but not required for '${local.build_type}' build."
  }
}

variable "OAK_API_AUTH_TOKEN" {
  description = "Oak API auth token"
  type        = string
  sensitive   = true
  default     = null


  validation {
    condition = contains(local.required_current_sensitive_env.shared, "OAK_API_AUTH_TOKEN") ? var.OAK_API_AUTH_TOKEN != null : var.OAK_API_AUTH_TOKEN == null

    error_message = contains(local.required_current_sensitive_env.shared, "OAK_API_AUTH_TOKEN") ? "Missing OAK_API_AUTH_TOKEN for '${local.build_type}' build." : "OAK_API_AUTH_TOKEN is set but not required for '${local.build_type}' build."
  }
}

variable "OAK_GRAPHQL_SECRET" {
  description = "Oak Graphql Secret"
  type        = string
  sensitive   = true
  default     = null


  validation {
    condition = contains(local.required_current_sensitive_env.shared, "OAK_GRAPHQL_SECRET") ? var.OAK_GRAPHQL_SECRET != null : var.OAK_GRAPHQL_SECRET == null

    error_message = contains(local.required_current_sensitive_env.shared, "OAK_GRAPHQL_SECRET") ? "Missing OAK_GRAPHQL_SECRET for '${local.build_type}' build." : "OAK_GRAPHQL_SECRET is set but not required for '${local.build_type}' build."
  }
}
variable "PRISMA_ACCELERATE_DATABASE_URL_PREVIEW" {
  description = "Prisma accelerate database url for preview environment"
  type        = string
  sensitive   = true
  default     = null


  validation {
    condition = contains(local.required_current_sensitive_env.preview, "PRISMA_ACCELERATE_DATABASE_URL_PREVIEW") ? var.PRISMA_ACCELERATE_DATABASE_URL_PREVIEW != null : var.PRISMA_ACCELERATE_DATABASE_URL_PREVIEW == null

    error_message = contains(local.required_current_sensitive_env.preview, "PRISMA_ACCELERATE_DATABASE_URL_PREVIEW") ? "Missing PRISMA_ACCELERATE_DATABASE_URL_PREVIEW for '${local.build_type}' build." : "PRISMA_ACCELERATE_DATABASE_URL_PREVIEW is set but not required for '${local.build_type}' build."
  }
}

variable "PRISMA_ACCELERATE_DATABASE_URL_PROD" {
  description = "Prisma accelerate databasa for production environment"
  type        = string
  sensitive   = true
  default     = null

  validation {
    condition = contains(local.required_current_sensitive_env.prod, "PRISMA_ACCELERATE_DATABASE_URL_PROD") ? var.PRISMA_ACCELERATE_DATABASE_URL_PROD != null : var.PRISMA_ACCELERATE_DATABASE_URL_PROD == null

    error_message = contains(local.required_current_sensitive_env.prod, "PRISMA_ACCELERATE_DATABASE_URL_PROD") ? "Missing PRISMA_ACCELERATE_DATABASE_URL_PROD for '${local.build_type}' build." : "PRISMA_ACCELERATE_DATABASE_URL_PROD is set but not required for '${local.build_type}' build."
  }
}

variable "SANITY_AUTH_SECRET" {
  description = "Sanity Auth secret"
  type        = string
  sensitive   = true
  default     = null


  validation {
    condition = contains(local.required_current_sensitive_env.shared, "SANITY_AUTH_SECRET") ? var.SANITY_AUTH_SECRET != null : var.SANITY_AUTH_SECRET == null

    error_message = contains(local.required_current_sensitive_env.shared, "SANITY_AUTH_SECRET") ? "Missing SANITY_AUTH_SECRET for '${local.build_type}' build." : "SANITY_AUTH_SECRET is set but not required for '${local.build_type}' build."
  }
}

variable "UPSTASH_REDIS_REST_TOKEN" {
  description = "Upstash Redis rest token"
  type        = string
  sensitive   = true
  default     = null


  validation {
    condition = contains(local.required_current_sensitive_env.shared, "UPSTASH_REDIS_REST_TOKEN") ? var.UPSTASH_REDIS_REST_TOKEN != null : var.UPSTASH_REDIS_REST_TOKEN == null

    error_message = contains(local.required_current_sensitive_env.shared, "UPSTASH_REDIS_REST_TOKEN") ? "Missing UPSTASH_REDIS_REST_TOKEN for '${local.build_type}' build." : "UPSTASH_REDIS_REST_TOKEN is set but not required for '${local.build_type}' build."
  }
}