// Generated from: src/cms/queries/documentationBySlugQuery/documentationBySlugQuery.gql
// using bin/zod-from-gql.ts
import * as z from 'zod/v4';
import { portableTextContentSchema } from '@/cms/schemaTypes/shared/cms/portableText.schema';

export const documentationBySlugQuerySchema = z.array(
  z.object({
    title: z.string().optional(),
    slug: z.object({
      current: z.string().optional(),
    }),
    navGroupType: z.object({
      slug: z.object({
        current: z.string().optional(),
      }),
      name: z.string().optional(),
    }),
    docsBlocksRaw: portableTextContentSchema,
  }),
);

export type documentationBySlugQuery = z.infer<
  typeof documentationBySlugQuerySchema
>;
