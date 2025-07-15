import { z } from 'zod';

export const navItemSchema = z.object({
  title: z.string(),
  href: z.string(),
});

export type NavItem = z.infer<typeof navItemSchema>;

export const navGroup = z.object({
  title: z.string(),
  pages: z.array(navItemSchema),
});

export type NavGroup = z.infer<typeof navGroup>;

export const curriculumApiDocsNavSchema = z.array(navGroup);
export type CurriculumApiDocsNav = z.infer<typeof curriculumApiDocsNavSchema>;
