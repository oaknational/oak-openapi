import { z } from 'zod';
import { imageSchema } from './shared/cms/image.schema';

const curriculumApiLandingPageContentBlockSchema = z.object({
  textAndMedia: z.object({
    title: z.string(),
    bodyRaw: z.array(
      z.object({
        _key: z.string(),
        markDefs: z.array(z.unknown()),
        children: z.array(
          z.object({
            _type: z.string(),
            marks: z.array(z.unknown()),
            text: z.string(),
            _key: z.string(),
          }),
        ),
        _type: z.string(),
        style: z.string(),
      }),
    ),
    image: imageSchema,
    alignMedia: z.string(),
  }),
});

const curriculumApiLandingPageUsingTheApiSectionSchema = z.object({
  mainBlock: z.object({
    title: z.string(),
    buttonLink: z.null(),
    image: imageSchema.nullable(),
  }),
  siblingBlocks: z.array(
    z.object({
      title: z.string(),
      buttonLink: z.object({ external: z.string() }),
      body: z.string(),
    }),
  ),
});

const curriculumApiLandingPageSchema = z.array(
  z.object({
    content: z.array(curriculumApiLandingPageContentBlockSchema),
    usingTheApiSection: curriculumApiLandingPageUsingTheApiSectionSchema,
  }),
);

export type CurriculumApiLandingPageContentBlock = z.infer<
  typeof curriculumApiLandingPageContentBlockSchema
>;
export type CurriculumApiLandingPageUsingTheApiSection = z.infer<
  typeof curriculumApiLandingPageUsingTheApiSectionSchema
>;

export type CurriculumApiLandingPage = z.infer<
  typeof curriculumApiLandingPageSchema
>;
