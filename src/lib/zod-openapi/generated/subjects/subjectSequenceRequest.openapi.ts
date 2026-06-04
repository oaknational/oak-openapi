import * as z from 'zod/v4';

export const subjectSequenceRequestOpenAPISchema = z.object({
  slug: z.string().meta({
    description: 'The sequence slug identifier',
    example: 'art-secondary-aqa',
  }),
});
