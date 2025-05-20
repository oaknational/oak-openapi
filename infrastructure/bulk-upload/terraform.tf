terraform {

  required_version = ">= 1.5.7"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "6.19.0"
    }
  }

  cloud {
    organization = "oak-national-academy"
    workspaces {
      tags = ["repo:oak-openapi", "config:bulk-upload"]
    }
  }
}

