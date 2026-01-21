import * as z from 'zod/v4';

export const subjectKeyStagesRequestOpenAPISchema = z.object({
  subject: z
    .string()
    .meta({ description: 'The subject slug identifier', example: 'art' }),
});
