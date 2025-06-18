import 'zod-openapi/extend';
import { z } from 'zod';

export const unitSummaryRequestOpenAPISchema = z
  .object({
    unit: z.string({ description: 'The unit slug' }),
  })
  .openapi({
    example: { unit: 'simple-compound-and-adverbial-complex-sentences' },
    ref: 'UnitSummaryRequestSchema',
  });
