import * as z from 'zod/v4';

export const unitSummaryRequestSchema = z.object({
  unit: z.string().describe('The unit slug'),
});
