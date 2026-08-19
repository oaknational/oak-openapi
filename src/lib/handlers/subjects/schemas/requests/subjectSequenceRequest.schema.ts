import * as z from 'zod/v4';

export const subjectSequenceRequestSchema = z.object({
  sequence: z
    .string()
    .describe('The sequence slug identifier')
    .meta({ example: 'english-secondary-aqa' }),
});
