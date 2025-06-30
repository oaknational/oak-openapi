import { z } from 'zod';

export const threadSchema = z.object({
  title: z.string(),
  slug: z.string(),
});

export const unitListSchema = z.array(
  z.object({
    unitTitle: z.string(),
    unitSlug: z.string(),
    unitOrder: z.number(),
  }),
);
