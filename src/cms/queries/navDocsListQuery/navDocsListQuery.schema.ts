import { z } from 'zod';

export const navDocsListGroupSchema = z.object({
  title: z.string(),
  slug: z.object({ text: z.string() }),
});

export type NavDocsListGroup = z.infer<typeof navDocsListGroupSchema>;

export const navDocsListPageSchema = z.object({
  title: z.string(),
  slug: z.object({ text: z.string() }),
  parentGroup: z.object({ slug: z.object({ text: z.string() }) }),
  order: z.number(),
});

export type NavDocsListPage = z.infer<typeof navDocsListPageSchema>;

export const navDocsListQuerySchema = z.object({
  groups: z.array(navDocsListGroupSchema),
  pages: z.array(navDocsListPageSchema),
});

export type NavDocsListQuery = z.infer<typeof navDocsListQuerySchema>;
