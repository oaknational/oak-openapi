import { z } from 'zod';

export const imageSchema = z.object({
  isPresentational: z.boolean().optional(),
  asset: z.object({ _id: z.string().optional(), url: z.string() }),
});

export type CMSImage = z.infer<typeof imageSchema>;
