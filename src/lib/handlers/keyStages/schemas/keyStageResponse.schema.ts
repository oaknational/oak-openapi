import z from 'zod';

export const keyStageResponseSchema = z.array(
  z.object({
    slug: z.string(),
    title: z.string(),
  }),
);
