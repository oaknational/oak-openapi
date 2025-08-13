import 'zod-openapi/extend';
import { z } from 'zod';
import { categorySchema, threadSchema } from '@/lib/handlers/units/types';

export const unitSummaryResponseOpenAPISchema = z
  .object({
    unitSlug: z
      .string()
      .openapi({
        example: 'simple-compound-and-adverbial-complex-sentences',
        description: 'The unit slug identifier',
      }),
    unitTitle: z
      .string()
      .openapi({
        example: 'Simple, compound and adverbial complex sentences',
        description: 'The unit title',
      }),
    yearSlug: z
      .string()
      .openapi({ example: 'year-3', description: 'The year identifier' }),
    year: z.union([z.number(), z.string({ description: 'All years' })]),
    phaseSlug: z.string(),
    subjectSlug: z
      .string()
      .openapi({
        example: 'english',
        description: 'The subject slug identifier',
      }),
    keyStageSlug: z
      .string()
      .openapi({
        example: 'ks2',
        description: 'The key stage slug identifier',
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
    ref: 'UnitSummaryResponseSchema',
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
  });
