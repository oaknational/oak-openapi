# API quickstart

Purpose
- Get a working request in minutes and understand the required auth headers.

Base URLs
- Local dev: `http://localhost:2727`
- Production: ask the team for the base URL and API key.

Authentication
- Most endpoints require an API key.
- Use the header: `Authorization: Bearer <API_KEY>`.

First request (subjects list)
```sh
curl -H "Authorization: Bearer $API_KEY" \
  http://localhost:2727/api/v0/subjects
```

Lesson summary (lesson slug)
- Replace `{lesson}` with a lesson slug.
```sh
curl -H "Authorization: Bearer $API_KEY" \
  http://localhost:2727/api/v0/lessons/{lesson}/summary
```

Bulk download request (POST)
```sh
curl -X POST -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"subjects":["maths"]}' \
  http://localhost:2727/api/bulk
```

Swagger UI
- Browse the generated OpenAPI docs at `http://localhost:2727/playground`.

Errors and rate limits
- Errors follow tRPC error codes (see `README.md` for examples).
- Rate-limit headers are returned on tRPC routes.

Related docs
- `docs/architecture/openapi-generation.md`
- `docs/engineering/onboarding.md`
