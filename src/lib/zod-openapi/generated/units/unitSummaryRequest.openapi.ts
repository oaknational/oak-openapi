import * as z from 'zod/v4';

export const unitSummaryRequestOpenAPISchema = z.object({
  unit: z.string().meta({
    description: 'The unit slug',
    example: 'simple-compound-and-adverbial-complex-sentences',
  }),
});
