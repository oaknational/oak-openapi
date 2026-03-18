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
      keyStage: z
        .string()
        .meta({ example: 'ks2' })
        .describe('The key stage slug associated with this keyword'),
      subject: z
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
        keyword: 'non-finite clause',
        description:
          'a type of subordinate clause that can start with a verb in the progressive tense',
        lessonSlugs: [
          'a-new-sentence-structure-the-non-finite-complex-sentence',
          'using-the-comma-rules-in-non-finite-complex-sentences',
          'a-new-subordinate-clause-the-non-finite-ing-clause',
        ],
      },
      {
        keyword: 'main clause',
        description:
          'a group of words that contains a verb and makes complete sense',
        lessonSlugs: [
          'a-new-sentence-structure-the-non-finite-complex-sentence',
          'using-the-comma-rules-in-non-finite-complex-sentences',
        ],
      },
    ],
  });
