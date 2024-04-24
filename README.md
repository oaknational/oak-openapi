# Oak open api front end

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

## Required env values

Complete the values in `.env.example` and rename to `.env`
