import * as z from 'zod/v4';

export const threadUnitsRequestOpenAPISchema = z
  .object({
    threadSlug: z
      .string()
      .meta({ example: 'number-multiplication-and-division' }),
  })
  .meta({ example: { threadSlug: 'number-multiplication-and-division' } });
