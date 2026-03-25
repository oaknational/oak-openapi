import 'zod-openapi';
import * as z from 'zod/v4';

export const keywordsResponseOpenAPISchema = z
  .array(
    z.object({
      keyword: z
        .string()
        .meta({ example: 'non-finite clause' })
        .describe('The keyword text'),
      description: z
        .string()
        .meta({
          example:
            'a type of subordinate clause that can start with a verb in the progressive tense',
        })
        .describe('A description of the keyword'),
      keyStageSlug: z
        .string()
        .meta({ example: 'ks2' })
        .describe('The key stage slug associated with this keyword'),
      subjectSlug: z
        .string()
        .meta({ example: 'science' })
        .describe('The subject slug associated with this keyword'),
      lessonSlugs: z
        .array(z.string())
        .meta({
          example: [
            'a-new-sentence-structure-the-non-finite-complex-sentence',
            'using-the-comma-rules-in-non-finite-complex-sentences',
            'a-new-subordinate-clause-the-non-finite-ing-clause',
          ],
        })
        .describe('The different lesson slugs where this keyword is used'),
    }),
  )
  .meta({
    ref: 'KeyStageSubjectKeywordsResponseSchema',
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
