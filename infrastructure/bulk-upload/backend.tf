terraform {
  cloud {
    organization = "oak-national-academy"
    workspaces {
      tags = ["repo:oak-openapi", "config:bulk-upload"]
    }
  }
}
