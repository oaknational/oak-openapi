import 'zod-openapi/extend';
import { z } from 'zod';

export const threadUnitsRequestOpenAPISchema = z.object({
  threadSlug: z.string().openapi({
    description: 'The thread identifier for a given unit',
    example: 'number-multiplication-and-division',
  }),
});
