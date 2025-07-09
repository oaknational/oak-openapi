import { z } from 'zod';
import { portableTextContentSchema } from '@/cms/schemaTypes/shared/cms/portableText.schema';

export const documentationBySlugQuerySchema = z.array(
  z.object({
    title: z.string(),
    slug: z.object({
      text: z.string(),
    }),
    navGroupType: z.object({
      slug: z.object({ text: z.string() }),
      name: z.string(),
    }),
    contentRaw: portableTextContentSchema,
  }),
);
export type documentationBySlugQuery = z.infer<
  typeof documentationBySlugQuerySchema
>;
