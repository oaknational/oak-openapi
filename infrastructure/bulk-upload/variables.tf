variable "region" {
  description = "The Google Cloud region to deploy in (use Google Cloud names)"
  type        = string
  nullable    = false
  default     = "europe-west2"
}

variable "graphql_host_url" {
  description = "The URL of the GraphQL endpoint"
  type        = string
  nullable    = false
}

variable "graphql_host_secret" {
  description = "The connection credentials for the GraphQL"
  type        = string
  nullable    = false
}

variable "tag_id" {
  description = "The tag id of the docker image"
  type        = string
  nullable    = false
}
