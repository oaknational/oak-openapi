import 'zod-openapi/extend';
import { z } from 'zod';

export const subjectKeyStagesRequestOpenAPISchema = z.object({
  subject: z
    .string()
    .openapi({ description: 'Subject slug to search by', example: 'art' }),
});
