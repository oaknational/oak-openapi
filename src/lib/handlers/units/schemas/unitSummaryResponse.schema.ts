import * as z from 'zod/v4';
import { categorySchema, threadSchema } from '@/lib/handlers/units/types';

export const unitSummaryResponseSchema = z.object({
  unitSlug: z.string({ description: 'The unit slug identifier' }),
  unitTitle: z.string({ description: 'The unit title' }),
  yearSlug: z.string({
    description: 'The slug identifier for the year to which the unit belongs',
  }),
  year: z.union([z.number(), z.string({ description: 'All years' })], {
    description: 'The year to which the unit belongs',
  }),
  phaseSlug: z.string({
    description: 'The slug identifier for the phase to which the unit belongs',
  }),
  subjectSlug: z.string({ description: 'The subject identifier' }),
  keyStageSlug: z.string({
    description:
      'The slug identifier for the the key stage to which the unit belongs',
  }),
  notes: z.string({ description: 'Unit summary notes' }).optional(),
  description: z
    .string({
      description:
        'A short description of the unit. Not yet available for all subjects.',
    })
    .optional(),
  priorKnowledgeRequirements: z.array(z.string(), {
    description: 'The prior knowledge required for the unit',
  }),
  nationalCurriculumContent: z.array(z.string(), {
    description:
      'National curriculum attainment statements covered in this unit',
  }),
  whyThisWhyNow: z
    .string({
      description:
        'An explanation of where the unit sits within the sequence and why it has been placed there.',
    })
    .optional(),
  threads: z
    .array(threadSchema, {
      description: 'The threads that are associated with the unit',
    })
    .optional(),
  categories: z
    .array(categorySchema, {
      description:
        'The categories (if any) that are assigned to the unit. If the unit does not have any categories, this property is omitted.',
    })
    .optional(),
  unitLessons: z.array(
    z.object(
      {
        lessonSlug: z.string({ description: 'The lesson slug identifier' }),
        lessonTitle: z.string({ description: 'The title for the lesson' }),
        lessonOrder: z
          .number({
            description: 'Indicates the ordering of the lesson',
          })
          .optional(),
        state: z.enum(['published', 'new'], {
          description:
            "If the state is 'published' then it is also available on the /lessons/* endpoints. If the state is 'new' then it's not available yet.",
        }),
      },
      { description: 'All the lessons contained in the unit' },
    ),
  ),
});
