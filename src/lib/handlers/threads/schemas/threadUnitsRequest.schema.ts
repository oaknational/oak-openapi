import { z } from 'zod';

export const threadUnitsRequestSchema = z.object({
  threadSlug: z.string({
    description: 'The thread identifier for a given unit',
  }),
});
