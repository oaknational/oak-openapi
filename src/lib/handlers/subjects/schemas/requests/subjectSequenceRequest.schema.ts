import { z } from 'zod';

export const subjectSequenceRequestSchema = z.object({
  subject: z.string(),
});
