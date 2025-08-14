import { z } from 'zod';

export const subjectKeyStagesRequestSchema = z.object({
  subject: z.string({ description: 'The subject slug identifier' }),
});
