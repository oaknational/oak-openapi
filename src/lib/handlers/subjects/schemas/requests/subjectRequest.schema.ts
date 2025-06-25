import z from 'zod';

export const subjectRequestSchema = z.object({
  subject: z.string(),
});
