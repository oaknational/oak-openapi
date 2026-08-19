import * as z from 'zod/v4';
import { lessonSlugSchema } from '@/lib/handlers/commonTypes';

export const transcriptRequestSchema = z.object({
  lesson: lessonSlugSchema,
});
