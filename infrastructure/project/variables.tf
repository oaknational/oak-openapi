variable "cloudflare_zone_domain" {
  description = "Domain name for the zone"
  type        = string
  default     = "thenational.academy"
}

variable "env_vars" {
  type = object({
    shared = object({
      AUTH_USERNAME                 = string
      NEXT_PUBLIC_OAK_ASSETS_HOST   = string
      NEXT_PUBLIC_OAK_ASSETS_PATH   = string
      NEXT_PUBLIC_POSTHOG_API_HOST  = string
      NEXT_PUBLIC_POSTHOG_API_KEY   = string
      NEXT_PUBLIC_SANITY_DATASET    = string
      NEXT_PUBLIC_SANITY_PROJECT_ID = string
      UPSTASH_REDIS_REST_URL        = string
    })
    prod = object({
      NEXT_PUBLIC_POSTHOG_KEY = string
      OAK_GRAPHQL_HOST        = string
      PRODUCTION_API_URL      = string
    })
    preview = object({
      OAK_GRAPHQL_HOST = string
    })
  })
}

variable "AUTH_PASSWORD" {
  description = "Auth Password"
  type        = string
  sensitive   = true
  nullable    = false
}

variable "GOOGLE_APPLICATION_CREDENTIALS_JSON" {
  description = "Google application credentials"
  type        = string
  sensitive   = true
  nullable    = false
}

variable "OAK_API_AUTH_TOKEN" {
  description = "Oak API auth token"
  type        = string
  sensitive   = true
  nullable    = false
}

variable "OAK_GRAPHQL_SECRET_PREVIEW" {
  description = "Oak Graphql Secret for preview"
  type        = string
  sensitive   = true
  nullable    = false
}
variable "OAK_GRAPHQL_SECRET_PROD" {
  description = "Oak Graphql Secret for prod"
  type        = string
  sensitive   = true
  nullable    = false
}

variable "PRISMA_ACCELERATE_DATABASE_URL_PREVIEW" {
  description = "Prisma accelerate database url for preview environment"
  type        = string
  sensitive   = true
  nullable    = false
}

variable "PRISMA_ACCELERATE_DATABASE_URL_PROD" {
  description = "Prisma accelerate database for production environment"
  type        = string
  sensitive   = true
  nullable    = false
}

variable "SANITY_AUTH_SECRET" {
  description = "Sanity Auth secret"
  type        = string
  sensitive   = true
  nullable    = false
}

variable "UPSTASH_REDIS_REST_TOKEN" {
  description = "Upstash Redis rest token"
  type        = string
  sensitive   = true
  nullable    = false
}