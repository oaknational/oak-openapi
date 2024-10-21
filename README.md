# Oak open api front end

## Adding new API keys

Currently this is handled manually:

1. Sign into [upstash](https://console.upstash.com/login)
2. Visit the [data browser](https://console.upstash.com/redis/8fc6603d-e796-4ef2-9c3b-d594fd8733fc?tab=data-browser)
3. Generate and copy a [UUID v4](https://www.uuidgenerator.net/version4)
4. Scroll to the end of the dataset, noting the last id and create a new object in the form of:

```json
{
   "name": "$friendly_name",
   "id": $n,
   "key": "$uuid"
}
```

5. Finally, ensure you hit save - the keys are loaded on demand in the openapi software.

## Development

Required dependencies:

1. node@20
2. pnpm@8
3. Access to OWA hasura staging instance

Installation and development:

1. `pnpm install`
2. `pnpm dev`

Development server should be running on http://localhost:2727

An API key is required to call RESTful endpoint.

## Infrastructure

- TypeScript across nearly all code (exceptions being eslint config and next config)
- pnpm is used to manage dependencies
- The project uses Nextjs for routing
- trpc-server for types
- zod to define the types
- trpc-openapi to add the openapi metadata
- graphql and some direct sql is used against the Oak Web Application (OWA) hasura based database

# Load testing

Required dependencies:

1. [Artillery](https://www.artillery.io/docs/get-started/get-artillery) installed globally

How to run:

1. Set env vars for target URL and auth token.
2. `pnpm load-test`

## Required env values

Complete the values in `.env.example` and rename to `.env`
