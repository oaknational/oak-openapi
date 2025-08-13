import 'zod-openapi/extend';
import { z } from 'zod';

export const unitSummaryRequestOpenAPISchema = z.object({
  unit: z
    .string()
    .openapi({
      example: 'simple-compound-and-adverbial-complex-sentences',
      description: 'The unit slug',
    }),
});
