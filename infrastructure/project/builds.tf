locals {
  builds = {
    website = {
      description   = "Oak OpenApi Website"
      domains       = ["open-api.thenational.academy"]
      build_command = "pnpm build"
      build_type    = "website"
      framework     = "nextjs"
      environment_variables = [
        for ev in local.environment_variables : ev
        if ev.value != null && ev.value != ""
      ]
    },

    storybook = {
      description     = "Oak OpenApi Storybook"
      build_command   = "pnpm build-storybook"
      build_type      = "storybook"
      framework       = "storybook"
      skew_protection = "1 day"
    }
  }
}