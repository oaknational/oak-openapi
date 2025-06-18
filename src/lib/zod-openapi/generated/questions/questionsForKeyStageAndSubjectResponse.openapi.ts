import 'zod-openapi/extend';
import { questionsSchema } from '@/lib/handlers/questions/types';

export const questionsForKeyStageAndSubjectResponseOpenAPISchema =
  questionsSchema.openapi({
    example: [
      {
        lessonSlug: 'predicting-the-size-of-a-product',
        lessonTitle: 'Predicting the size of a product',
        starterQuiz: [
          {
            question: 'Match the number to its written representation.',
            questionType: 'match',
            answers: [
              {
                matchOption: { type: 'text', content: 'seven tenths' },
                correctChoice: { type: 'text', content: '0.7' },
              },
              {
                matchOption: { type: 'text', content: 'nine tenths' },
                correctChoice: { type: 'text', content: '0.9' },
              },
              {
                matchOption: { type: 'text', content: 'seven ones' },
                correctChoice: { type: 'text', content: '7' },
              },
              {
                matchOption: { type: 'text', content: 'seven hundredths' },
                correctChoice: { type: 'text', content: '0.07' },
              },
              {
                matchOption: { type: 'text', content: 'nine hundredths' },
                correctChoice: { type: 'text', content: '0.09' },
              },
            ],
          },
        ],
        exitQuiz: [
          {
            question:
              'Use the fact that 9 \xD7 8 = 72, to match the expressions to their product.',
            questionType: 'match',
            answers: [
              {
                matchOption: { type: 'text', content: '9 \xD7 80' },
                correctChoice: { type: 'text', content: '720' },
              },
              {
                matchOption: { type: 'text', content: '9 \xD7 800 ' },
                correctChoice: { type: 'text', content: '7,200' },
              },
              {
                matchOption: { type: 'text', content: '9 \xD7 0.8' },
                correctChoice: { type: 'text', content: '7.2' },
              },
              {
                matchOption: { type: 'text', content: '9 \xD7 0' },
                correctChoice: { type: 'text', content: '0' },
              },
              {
                matchOption: { type: 'text', content: '9 \xD7 0.08' },
                correctChoice: { type: 'text', content: '0.72' },
              },
            ],
          },
        ],
      },
    ],
    ref: 'QuestionsForKeyStageAndSubjectResponseSchema',
  });
