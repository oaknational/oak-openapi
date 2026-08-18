import * as z from 'zod/v4';
import { lessonSlugSchema } from '@/lib/handlers/commonTypes';

export const lessonSummaryRequestSchema = z.object({
  lesson: lessonSlugSchema,
});
