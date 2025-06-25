import z from 'zod';
import { questionZod } from '@/lib/handlers/questions/types';

export const questionForLessonsResponseSchema = z.object({
  starterQuiz: z.array(questionZod),
  exitQuiz: z.array(questionZod),
});
