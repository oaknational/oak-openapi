resource "google_storage_bucket" "this" {
  name          = "oak-${local.env}-ldn-${local.application_name_gc}"
  location      = var.region
  force_destroy = !(local.env == "prod")

  versioning {
    enabled = false
  }
}
