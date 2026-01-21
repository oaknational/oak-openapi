import * as z from 'zod/v4';

export const subjectSequenceRequestSchema = z.object({
  subject: z.string().describe('The slug identifier for the subject'),
});
