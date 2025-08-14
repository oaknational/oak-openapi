import { z } from 'zod';

export const threadSchema = z.object({
  title: z.string().openapi({ description: 'The thread title' }),
  slug: z.string().openapi({ description: 'The thread slug identifier' }),
});

export const unitListSchema = z.array(
  z.object({
    unitTitle: z.string().openapi({ description: 'The unit title' }),
    unitSlug: z.string().openapi({ description: 'The unit slug identifier' }),
    unitOrder: z
      .number()
      .openapi({ description: 'The position of the unit within the thread' }),
  }),
);
