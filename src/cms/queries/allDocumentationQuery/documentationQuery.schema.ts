import * as z from 'zod/v4';
import { portableTextContentSchema } from '../../schemaTypes/shared/cms/portableText.schema';

export const documentationQuerySchema = z.array(
  z.object({
    title: z.string(),
    navGroupType: z.object({
      slug: z.object({ current: z.string() }),
      name: z.string(),
    }),
    contentRaw: portableTextContentSchema,
  }),
);
export type DocumentationQuery = z.infer<typeof documentationQuerySchema>;
