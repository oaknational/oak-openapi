import { z } from 'zod';

export const subjectSequenceRequestSchema = z.object({
  subject: z.string({ description: 'The slug identifier for the subject' }),
});
