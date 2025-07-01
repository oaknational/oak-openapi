import { z } from 'zod';
import { imageSchema } from './shared/cms/image.schema';
// import { blockTextSchema } from './shared/cms/blockText.schema';

export const curriculumApiLandingPageSchema = z.array(
  z.object({
    heroBlock: z.array(
      z.object({
        body: z.string(),
        titlePortableTextRaw: z.array(
          z.object({
            markDefs: z.array(z.unknown()),
            children: z.array(
              z.union([
                z.object({
                  _key: z.string(),
                  _type: z.string(),
                  marks: z.array(z.string()),
                  text: z.string(),
                }),
                z.object({
                  marks: z.array(z.unknown()),
                  text: z.string(),
                  _key: z.string(),
                  _type: z.string(),
                }),
              ]),
            ),
            _type: z.string(),
            style: z.string(),
            _key: z.string(),
          }),
        ),
        image: imageSchema,
      }),
    ),
    content: z.array(
      z.object({
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
      }),
    ),
    usingTheApiSection: z.object({
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
    }),
  }),
);

export type CurriculumApiLandingPage = z.infer<
  typeof curriculumApiLandingPageSchema
>;
