import { z } from 'zod';

export const imageSchema = z.object({
  image: z.object({
    asset: z.object({ url: z.string(), altText: z.string() }),
  }),
});

export type CMSImage = z.infer<typeof imageSchema>;
