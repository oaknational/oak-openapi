import * as z from 'zod/v4';

export const subjectSequenceRequestSchema = z.object({
  slug: z.string().describe('The sequence slug identifier'),
});
