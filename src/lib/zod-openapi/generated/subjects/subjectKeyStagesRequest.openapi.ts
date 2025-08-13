import 'zod-openapi/extend';
import { z } from 'zod';

export const subjectKeyStagesRequestOpenAPISchema = z.object({
  subject: z
    .string()
    .openapi({ example: 'art', description: 'Subject slug to search by' }),
});
