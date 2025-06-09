import { z } from 'zod';
import { imageSchema } from './shared/cms/image.schema';
import { blockTextSchema } from './shared/cms/blockText.schema';

export const curriculumApiLandingPageSchema = z.object({
  data: z.object({
    allCurriculumApiLandingPage: z.array(
      z.object({
        title: z.string(),
        content: z.array(
          z.object({
            textAndMedia: z.object({
              title: z.string(),
              bodyRaw: blockTextSchema,
              image: imageSchema,
            }),
          }),
        ),
      }),
    ),
  }),
  extensions: z.object({ sanitySyncTags: z.array(z.string()) }),
});

export type CurriculumApiLandingPage = z.infer<
  typeof curriculumApiLandingPageSchema
>;
