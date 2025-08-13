import 'zod-openapi/extend';
import z from 'zod';
import { questionZod } from '@/lib/handlers/questions/types';

export const questionForLessonsResponseOpenAPISchema = z
  .object({
    starterQuiz: z.array(questionZod),
    exitQuiz: z.array(questionZod),
  })
  .openapi({
    ref: 'QuestionForLessonsResponseSchema',
    example: {
      starterQuiz: [
        {
          question: 'Tick the sentence with the correct punctuation.',
          questionType: 'multiple-choice',
          answers: [
            { distractor: true, type: 'text', content: 'the baby cried' },
            { distractor: true, type: 'text', content: 'The baby cried' },
            { distractor: false, type: 'text', content: 'The baby cried.' },
            { distractor: true, type: 'text', content: 'the baby cried.' },
          ],
        },
      ],
      exitQuiz: [
        {
          question: 'Which word is a verb?',
          questionType: 'multiple-choice',
          answers: [
            { distractor: true, type: 'text', content: 'shops' },
            { distractor: true, type: 'text', content: 'Jun' },
            { distractor: true, type: 'text', content: 'I' },
            { distractor: false, type: 'text', content: 'shout' },
          ],
        },
      ],
    },
  });
