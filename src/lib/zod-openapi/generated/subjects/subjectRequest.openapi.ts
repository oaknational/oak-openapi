import 'zod-openapi/extend';
import z from 'zod';

export const subjectRequestOpenAPISchema = z.object({
  subject: z
    .string()
    .openapi({ description: 'Subject slug to search by', example: 'art' }),
});
