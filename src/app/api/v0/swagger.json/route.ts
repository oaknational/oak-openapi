import { openApiDocument } from '@/lib/zod-openapi/schema/generateDocument';

export const GET = () => {
  // we use additional tags for the `/docs` endpoint documentation,
  // but we don't want to expose them in the OpenAPI playground.
  if (openApiDocument.paths) {
    const remove = [
      'unit-and-curriculum-data',
      'lesson-data',
      'quiz-questions',
    ];
    const paths = Object.keys(openApiDocument.paths);
    for (const path of paths) {
      const operation = openApiDocument.paths[path].get;

      if (operation && operation.tags) {
        // Sort tags alphabetically
        operation.tags = operation.tags.filter((_) => !remove.includes(_));
      }
    }
  }

  return Response.json(openApiDocument);
};
