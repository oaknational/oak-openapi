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
      .openapi({
        description:
          'The slug identifier for the year to which the unit belongs',
        example: 'year-3',
      }),
    year: z
      .union([z.number(), z.string({ description: 'All years' })])
      .openapi({
        description: 'The year to which the unit belongs',
        example: 3,
      }),
    phaseSlug: z
      .string()
      .openapi({
        description:
          'The slug identifier for the phase to which the unit belongs',
        example: 'primary',
      }),
    subjectSlug: z
      .string()
      .openapi({ description: 'The subject identifier', example: 'english' }),
    keyStageSlug: z
      .string()
      .openapi({
        description:
          'The slug identifier for the the key stage to which the unit belongs',
        example: 'ks2',
      }),
    notes: z
      .string()
      .openapi({ description: 'Unit summary notes', example: undefined })
      .optional(),
    description: z
      .string()
      .openapi({
        description:
          'A short description of the unit. Not yet available for all subjects.',
        example: undefined,
      })
      .optional(),
    priorKnowledgeRequirements: z
      .array(z.string())
      .openapi({
        description: 'The prior knowledge required for the unit',
        example: [
          'A simple sentence is about one idea and makes complete sense.',
          'Any simple sentence contains one verb and at least one noun.',
          'Two simple sentences can be joined with a co-ordinating conjunction to form a compound sentence.',
        ],
      }),
    nationalCurriculumContent: z
      .array(z.string())
      .openapi({
        description:
          'National curriculum attainment statements covered in this unit',
        example: [
          'Ask relevant questions to extend their understanding and knowledge',
          'Articulate and justify answers, arguments and opinions',
          'Speak audibly and fluently with an increasing command of Standard English',
        ],
      }),
    whyThisWhyNow: z
      .string()
      .openapi({
        description:
          'An explanation of where the unit sits within the sequence and why it has been placed there.',
        example: undefined,
      })
      .optional(),
    threads: z
      .array(threadSchema)
      .openapi({
        description: 'The threads that are associated with the unit',
        example: [
          {
            slug: 'developing-grammatical-knowledge',
            title: 'Developing grammatical knowledge',
            order: 10,
          },
        ],
      })
      .optional(),
    categories: z
      .array(categorySchema)
      .openapi({
        description:
          'The categories (if any) that are assigned to the unit. If the unit does not have any categories, this property is omitted.',
        example: undefined,
      })
      .optional(),
    unitLessons: z.array(
      z
        .object({
          lessonSlug: z
            .string()
            .openapi({
              description: 'The lesson slug identifier',
              example: 'four-types-of-simple-sentence',
            }),
          lessonTitle: z
            .string()
            .openapi({
              description: 'The title for the lesson',
              example: 'Four types of simple sentence',
            }),
          lessonOrder: z
            .number()
            .openapi({
              description: 'Indicates the ordering of the lesson',
              example: 1,
            })
            .optional(),
          state: z
            .enum(['published', 'new'])
            .openapi({
              description:
                "If the state is 'published' then it is also available on the /lessons/* endpoints. If the state is 'new' then it's not available yet.",
              example: 'published',
            }),
        })
        .openapi({ description: 'All the lessons contained in the unit' }),
    ),
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
