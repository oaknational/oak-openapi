import 'zod-openapi/extend';
import { z } from 'zod';

export const subjectKeyStagesRequestOpenAPISchema = z.object({
  subject: z
    .string()
    .openapi({ description: 'The subject slug identifier', example: 'art' }),
});
