import z from 'zod';

export const subjectRequestSchema = z.object({
  subject: z.string({ description: 'The slug identifier for the subject' }),
});
