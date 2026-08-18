import * as z from 'zod/v4';
import {
  keyStageSlugSchema,
  subjectSlugSchema,
} from '@/lib/handlers/commonTypes';

export const lessonSearchRequestSchema = z.object({
  q: z.string().meta({
    description: 'Search query text snippet',
    example: 'gothic',
  }),
  keyStage: keyStageSlugSchema.optional(),
  subject: subjectSlugSchema.optional(),
  unit: z
    .string()
    .describe('Optional unit slug to additionally filter by')
    .optional(),
});

export type LessonSearchRequestType = z.infer<typeof lessonSearchRequestSchema>;
