import 'zod-openapi/extend';
import { z } from 'zod';

export const unitSummaryRequestOpenAPISchema = z.object({
  unit: z.string().openapi({
    description: 'The unit slug',
    example: 'simple-compound-and-adverbial-complex-sentences',
  }),
});
