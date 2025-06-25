import { z } from 'zod';
import { navItemsSchema } from './shared/components/NavItems.schema';

const nestedSchema = z.array(
  z.object({
    title: z.string(),
    slug: z.string(),
    children: z.array(z.object({ title: z.string(), slug: z.string() })),
  }),
);

export const curriculumApiDocsNavSchema = z.object({
  nestedData: nestedSchema,
  items: navItemsSchema,
});

export type CurriculumApiDocsNav = z.infer<typeof curriculumApiDocsNavSchema>;
