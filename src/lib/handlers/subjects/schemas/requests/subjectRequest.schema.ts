import * as z from 'zod/v4';

export const subjectRequestSchema = z.object({
  subject: z.string({ description: 'The slug identifier for the subject' }),
});
