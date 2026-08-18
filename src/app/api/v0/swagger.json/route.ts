import { openApiDocument } from '@/lib/zod-openapi/schema/generateDocument';

export const GET = () => {
  return Response.json(openApiDocument);
};
