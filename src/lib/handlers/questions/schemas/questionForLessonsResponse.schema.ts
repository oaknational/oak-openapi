import * as z from 'zod/v4';
import {
  exitQuizSchema,
  starterQuizSchema,
} from '@/lib/handlers/questions/types';

export const questionForLessonsResponseSchema = z.object({
  starterQuiz: starterQuizSchema,
  exitQuiz: exitQuizSchema,
});
