import z from 'zod';
import { questionZod } from '../types';

export const questionForLessonsResponseSchema = z.object({
  starterQuiz: z.array(questionZod),
  exitQuiz: z.array(questionZod),
});
