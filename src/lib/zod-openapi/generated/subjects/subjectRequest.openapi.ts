import 'zod-openapi/extend';
import z from 'zod';

export const subjectRequestOpenAPISchema = z.object({
  subject: z.string().openapi({
    description: 'The slug identifier for the subject',
    example: 'art',
  }),
});
