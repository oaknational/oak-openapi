import { z } from 'zod';
import { imageSchema, cta, raw } from './shared/cms/image.schema';

const curriculumApiLandingPageContentBlockSchema = z.object({
  titleRaw: raw,
  bodyRaw: raw,
  image: imageSchema,
  cta: cta.nullable(),
});

const curriculumApiLandingPageUsingTheApiSectionSchema = z.object({
  mainBlock: z.object({
    titleRaw: raw,
    cta,
    image: imageSchema,
  }),
  siblingBlocks: z.array(
    z.object({
      titleRaw: raw,
      cta,
      bodyRaw: raw,
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
