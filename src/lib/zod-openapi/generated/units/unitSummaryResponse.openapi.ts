import 'zod-openapi';
import * as z from 'zod/v4';
import { categorySchema, threadSchema } from '@/lib/handlers/units/types';
import { unitProgrammeFactorsSchema } from '@/lib/handlers/unitProgrammeFactors';
export const unitSummaryResponseOpenAPISchema = z
  .object({
    unitSlug: z.string().describe('The unit slug identifier').meta({
      example: 'programming-subroutines',
    }),
    unitTitle: z.string().describe('The unit title').meta({
      example: 'Programming subroutines',
    }),
    yearSlug: z
      .string()
      .describe('The slug identifier for the year to which the unit belongs')
      .meta({
        example: 'year-10',
      }),
    year: z
      .union([z.number(), z.string().describe('All years')])
      .describe('The year to which the unit belongs')
      .meta({
        example: 10,
      }),
    phaseSlug: z
      .string()
      .describe('The slug identifier for the phase to which the unit belongs')
      .meta({
        example: 'secondary',
      }),
    subjectSlug: z.string().describe('The subject identifier').meta({
      example: 'computing',
    }),
    keyStageSlug: z
      .string()
      .describe(
        'The slug identifier for the the key stage to which the unit belongs',
      )
      .meta({
        example: 'ks4',
      }),
    notes: z.string().describe('Unit summary notes').optional(),
    description: z
      .string()
      .describe(
        'A short description of the unit. Not yet available for all subjects.',
      )
      .optional(),
    priorKnowledgeRequirements: z
      .array(z.string())
      .describe('The prior knowledge required for the unit')
      .meta({
        example: [
          'Variables can be used to store values in a program.',
          'Selection can be used to choose between paths in a program.',
          'Iteration can be used to repeat a set of instructions.',
        ],
      }),
    nationalCurriculumContent: z
      .array(z.string())
      .describe(
        'National curriculum attainment statements covered in this unit',
      )
      .meta({
        example: [
          'Use two or more programming languages, at least one of which is textual, to solve a variety of computational problems.',
          'Make appropriate use of data structures.',
          'Design and develop modular programs.',
        ],
      }),
    whyThisWhyNow: z
      .string()
      .describe(
        'An explanation of where the unit sits within the sequence and why it has been placed there.',
      )
      .optional(),
    threads: z
      .array(threadSchema)
      .describe('The threads that are associated with the unit')
      .optional(),
    categories: z
      .array(categorySchema)
      .describe(
        'The categories (if any) that are assigned to the unit. If the unit does not have any categories, this property is omitted.',
      )
      .optional(),
    programmeFactors: unitProgrammeFactorsSchema
      .describe(
        'The programme-factor values that identify which variant of this unit is returned. Omitted when the unit has no programme factors.',
      )
      .optional()
      .meta({
        example: {
          examBoard: {
            slug: 'aqa',
            title: 'AQA',
          },
          pathway: {
            slug: 'gcse',
            title: 'GCSE',
          },
        },
      }),
    unitOptionsGroup: z
      .string()
      .optional()
      .describe(
        `If the unit is unit variant, then this is the unit's "parent" unit slug`,
      ),
    unitLessons: z
      .array(
        z
          .object({
            lessonSlug: z.string().describe('The lesson slug identifier').meta({
              example: 'structured-programs',
            }),
            lessonTitle: z.string().describe('The title for the lesson').meta({
              example: 'Structured programs',
            }),
            lessonOrder: z
              .number()
              .describe('Indicates the ordering of the lesson')
              .optional()
              .meta({
                example: 1,
              }),
            state: z
              .enum(['published', 'new'])
              .describe(
                "If the state is 'published' then it is also available on the /lessons/* endpoints. If the state is 'new' then it's not available yet.",
              )
              .meta({
                example: 'published',
              }),
          })
          .describe('All the lessons contained in the unit'),
      )
      .meta({
        example: [
          {
            lessonSlug: 'structured-programs',
            lessonTitle: 'Structured programs',
            lessonOrder: 1,
            state: 'published',
          },
          {
            lessonSlug: 'subroutines-with-parameters',
            lessonTitle: 'Subroutines with parameters',
            lessonOrder: 2,
            state: 'new',
          },
        ],
      }),
  })
  .meta({
    id: 'UnitSummaryResponseSchema',
    example: {
      unitSlug: 'programming-subroutines',
      unitTitle: 'Programming subroutines',
      yearSlug: 'year-10',
      year: 10,
      phaseSlug: 'secondary',
      subjectSlug: 'computing',
      keyStageSlug: 'ks4',
      priorKnowledgeRequirements: [
        'Variables can be used to store values in a program.',
        'Selection can be used to choose between paths in a program.',
        'Iteration can be used to repeat a set of instructions.',
      ],
      nationalCurriculumContent: [
        'Use two or more programming languages, at least one of which is textual, to solve a variety of computational problems.',
        'Make appropriate use of data structures.',
        'Design and develop modular programs.',
      ],
      programmeFactors: {
        examBoard: {
          slug: 'aqa',
          title: 'AQA',
        },
        pathway: {
          slug: 'gcse',
          title: 'GCSE',
        },
      },
      unitLessons: [
        {
          lessonSlug: 'structured-programs',
          lessonTitle: 'Structured programs',
          lessonOrder: 1,
          state: 'published',
        },
        {
          lessonSlug: 'subroutines-with-parameters',
          lessonTitle: 'Subroutines with parameters',
          lessonOrder: 2,
          state: 'new',
        },
      ],
    },
  });
