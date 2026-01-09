import * as z from 'zod/v4';

export const keyStageResponseSchema = z.array(
  z.object({
    slug: z.string({ description: 'The key stage slug identifier' }),
    title: z.string({ description: 'The key stage title' }),
  }),
);
