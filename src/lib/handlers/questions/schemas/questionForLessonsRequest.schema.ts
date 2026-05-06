import * as z from 'zod/v4';
import { questionFilterSchema } from '../types';

export const questionForLessonsRequestSchema = z.object({
  lesson: z.string().describe('The lesson slug identifier'),
  filter: questionFilterSchema.optional(),
});
