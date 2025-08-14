import z from 'zod';
import {
  exitQuizSchema,
  starterQuizSchema,
} from '@/lib/handlers/questions/types';

export const questionForLessonsResponseSchema = z.object({
  starterQuiz: starterQuizSchema,
  exitQuiz: exitQuizSchema,
});
