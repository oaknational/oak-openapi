import { questionsSchema } from '@/lib/handlers/questions/types';

export const questionsForProgrammeResponseOpenAPISchema = questionsSchema.meta({
  id: 'QuestionsForProgrammeResponseSchema',
  example: [
    {
      lessonTitle: '3D shapes can be composed from 2D nets',
      lessonSlug: '3d-shapes-can-be-composed-from-2d-nets',
      starterQuiz: [
        {
          question: 'Select all of the names of shapes that are polygons.',
          questionType: 'multiple-choice',
          answers: [
            { type: 'text', content: 'Cube', distractor: true },
            { type: 'text', content: 'Square', distractor: false },
            { type: 'text', content: 'Triangle', distractor: false },
          ],
        },
      ],
      exitQuiz: [
        {
          question: 'What is a net?',
          questionType: 'multiple-choice',
          answers: [
            {
              type: 'text',
              content: 'A 2D shape that folds into a 3D shape.',
              distractor: false,
            },
            { type: 'text', content: 'A type of cube.', distractor: true },
          ],
        },
      ],
    },
  ],
});
