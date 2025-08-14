import z from 'zod';

export const keyStageResponseSchema = z.array(
  z.object({
    slug: z.string({ description: 'The key stage slug identifier' }),
    title: z.string({ description: 'The key stage title' }),
  }),
);
