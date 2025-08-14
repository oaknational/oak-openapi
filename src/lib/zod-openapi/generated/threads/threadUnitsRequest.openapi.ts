import 'zod-openapi/extend';
import { z } from 'zod';

export const threadUnitsRequestOpenAPISchema = z
  .object({
    threadSlug: z
      .string()
      .openapi({ example: 'number-multiplication-and-division' }),
  })
  .openapi({ example: { threadSlug: 'number-multiplication-and-division' } });
