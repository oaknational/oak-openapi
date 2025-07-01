import { z } from 'zod';

export const navItemSchema = z.object({
  title: z.string(),
  href: z.string(),
});

export const navItemsSchema = z.array(
  z.object({
    title: z.string(),
    href: z.string(),
  }),
);
export type NavItem = z.infer<typeof navItemSchema>;
export type NavItems = z.infer<typeof navItemsSchema>;
