import * as z from 'zod/v4';

export const subjectSequenceRequestOpenAPISchema = z.object({
  sequence: z.string().meta({
    description: 'The sequence slug identifier',
    example: 'english-secondary',
  }),
});
