import * as z from 'zod/v4';
import { questionFilterSchema } from '../types';
import { lessonSlugSchema } from '@/lib/handlers/commonTypes';

export const questionForLessonsRequestSchema = z.object({
  lesson: lessonSlugSchema,
  filter: questionFilterSchema.optional(),
});
