import { z } from 'zod';
import { categorySchema, threadSchema } from '@/lib/handlers/units/types';

export const unitSummaryResponseSchema = z.object({
  unitSlug: z.string(),
  unitTitle: z.string(),
  yearSlug: z.string(),
  year: z.union([z.number(), z.string({ description: 'All years' })]),
  phaseSlug: z.string(),
  subjectSlug: z.string(),
  keyStageSlug: z.string(),
  notes: z.string().optional(),
  description: z.string().optional(),
  priorKnowledgeRequirements: z.array(z.string()),
  nationalCurriculumContent: z.array(z.string()),
  whyThisWhyNow: z.string().optional(),
  threads: z.array(threadSchema).optional(),
  categories: z.array(categorySchema).optional(),
  unitLessons: z.array(
    z.object({
      lessonSlug: z.string(),
      lessonTitle: z.string(),
      lessonOrder: z.number().optional(),
      state: z.enum(['published', 'new'], {
        description:
          "If the state is 'published' then it is also available on the /lessons/* endpoints. If the state is 'new' then it's not available yet.",
      }),
    }),
  ),
});
