import { z } from 'zod';
import { portableTextContentSchema } from './shared/cms/portableText.schema';

export const documentationContentPageBlockSchema = z.object({
  title: z.string(),
  slug: z.object({ text: z.string() }),
  navGroupType: z.object({
    slug: z.object({ text: z.string() }),
    name: z.string(),
  }),
  docsBlocksRaw: portableTextContentSchema,
});

export type DocumentationContentPageBlock = z.infer<
  typeof documentationContentPageBlockSchema
>;
export const curriculumApiDocumentationPageSchema = z.object({
  allApiContentPage: z.array(documentationContentPageBlockSchema),
});
export type CurriculumAPIDocumentationPage = z.infer<
  typeof curriculumApiDocumentationPageSchema
>;
