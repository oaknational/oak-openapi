import * as z from 'zod/v4';

export const subjectKeyStagesRequestSchema = z.object({
  subject: z.string({ description: 'The subject slug identifier' }),
});
