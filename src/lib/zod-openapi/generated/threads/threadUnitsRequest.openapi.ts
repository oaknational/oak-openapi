import 'zod-openapi/extend';
import { z } from 'zod';

export const threadUnitsRequestOpenAPISchema = z
  .object({
    threadSlug: z.string(),
  })
  .openapi({
    example: { threadSlug: 'a-midsummer-nights-dream-72' },
    ref: 'ThreadUnitsRequestSchema',
  });
