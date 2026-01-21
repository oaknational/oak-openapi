import * as z from 'zod/v4';

export const subjectSequenceRequestOpenAPISchema = z.object({
  subject: z.string().meta({
    description: 'The slug identifier for the subject',
    example: 'art',
  }),
});
