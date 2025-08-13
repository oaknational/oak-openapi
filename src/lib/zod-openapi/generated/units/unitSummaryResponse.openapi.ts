import 'zod-openapi/extend';
import { z } from 'zod';
import { categorySchema, threadSchema } from '@/lib/handlers/units/types';

export const unitSummaryResponseOpenAPISchema = z
  .object({
    unitSlug: z
      .string()
      .openapi({
        description: 'The unit slug identifier',
        example: 'simple-compound-and-adverbial-complex-sentences',
      }),
    unitTitle: z
      .string()
      .openapi({
        description: 'The unit title',
        example: 'Simple, compound and adverbial complex sentences',
      }),
    yearSlug: z
      .string()
      .openapi({ description: 'The year identifier', example: 'year-3' }),
    year: z.union([z.number(), z.string({ description: 'All years' })]),
    phaseSlug: z.string(),
    subjectSlug: z
      .string()
      .openapi({
        description: 'The subject slug identifier',
        example: 'english',
      }),
    keyStageSlug: z
      .string()
      .openapi({
        description: 'The key stage slug identifier',
        example: 'ks2',
      }),
    notes: z.string().optional(),
    description: z.string().optional(),
    priorKnowledgeRequirements: z
      .array(z.string())
      .openapi({ description: 'A list of undefineds' }),
    nationalCurriculumContent: z
      .array(z.string())
      .openapi({ description: 'A list of undefineds' }),
    whyThisWhyNow: z.string().optional(),
    threads: z.array(threadSchema).optional(),
    categories: z.array(categorySchema).optional(),
    unitLessons: z
      .array(
        z.object({
          lessonSlug: z.string(),
          lessonTitle: z.string(),
          lessonOrder: z.number().optional(),
          state: z.enum(['published', 'new'], {
            description:
              "If the state is 'published' then it is also available on the /lessons/* endpoints. If the state is 'new' then it's not available yet.",
          }),
        }),
      )
      .openapi({
        description:
          'A list of lesson slugs, lesson titles, lesson orders,  and states',
      }),
  })
  .openapi({
    example: {
      unitSlug: 'simple-compound-and-adverbial-complex-sentences',
      unitTitle: 'Simple, compound and adverbial complex sentences',
      yearSlug: 'year-3',
      year: 3,
      phaseSlug: 'primary',
      subjectSlug: 'english',
      keyStageSlug: 'ks2',
      priorKnowledgeRequirements: [
        'A simple sentence is about one idea and makes complete sense.',
        'Any simple sentence contains one verb and at least one noun.',
        'Two simple sentences can be joined with a co-ordinating conjunction to form a compound sentence.',
      ],
      nationalCurriculumContent: [
        'Ask relevant questions to extend their understanding and knowledge',
        'Articulate and justify answers, arguments and opinions',
        'Speak audibly and fluently with an increasing command of Standard English',
      ],
      threads: [
        {
          slug: 'developing-grammatical-knowledge',
          title: 'Developing grammatical knowledge',
          order: 10,
        },
      ],
      unitLessons: [
        {
          lessonSlug: 'four-types-of-simple-sentence',
          lessonTitle: 'Four types of simple sentence',
          lessonOrder: 1,
          state: 'published',
        },
        {
          lessonSlug: 'three-ways-for-co-ordination-in-compound-sentences',
          lessonTitle: 'Three ways for co-ordination in compound sentences',
          lessonOrder: 2,
          state: 'new',
        },
      ],
    },
    ref: 'UnitSummaryResponseSchema',
  });
