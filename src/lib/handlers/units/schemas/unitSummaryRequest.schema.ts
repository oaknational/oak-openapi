import { z } from 'zod';

export const unitSummaryRequestSchema = z.object({
  unit: z.string({ description: 'The unit slug' }),
});
