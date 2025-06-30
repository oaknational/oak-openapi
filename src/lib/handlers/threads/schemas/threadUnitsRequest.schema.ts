import { z } from 'zod';

export const threadUnitsRequestSchema = z.object({
  threadSlug: z.string(),
});
