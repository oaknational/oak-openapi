import * as z from 'zod/v4';

export const subjectKeyStagesRequestSchema = z.object({
  subject: z.string().describe('The subject slug identifier'),
});
