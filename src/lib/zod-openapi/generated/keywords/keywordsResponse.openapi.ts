import 'zod-openapi';
import * as z from 'zod/v4';
export const keywordsResponseOpenAPISchema = z
  .array(
    z.object({
      keyword: z.string().describe('The keyword text').meta({
        example: 'animate',
      }),
      description: z.string().describe('A description of the keyword').meta({
        example: 'to make something move or change its appearance',
      }),
      keyStageSlug: z
        .string()
        .describe('The key stage slug associated with the keyword')
        .meta({
          example: 'ks2',
        }),
      subjectSlug: z
        .string()
        .describe('The subject slug associated with the keyword')
        .meta({
          example: 'computing',
        }),
      lessonSlugs: z
        .array(z.string())
        .describe('The different lesson slugs where this keyword is used')
        .meta({
          example: ['animating-text'],
        }),
    }),
  )
  .meta({
    id: 'KeywordsResponseSchema',
    example: [
      {
        keyword: 'animate',
        description: 'to make something move or change its appearance',
        keyStageSlug: 'ks2',
        subjectSlug: 'computing',
        lessonSlugs: ['animating-text'],
      },
      {
        keyword: 'animation',
        description:
          'a way of making pictures or objects look as if they are moving by showing them quickly one after another',
        keyStageSlug: 'ks2',
        subjectSlug: 'computing',
        lessonSlugs: [
          'introduction-to-animation',
          'programming-using-command-blocks',
        ],
      },
    ],
  });
