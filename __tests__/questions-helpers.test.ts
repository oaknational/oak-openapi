import { expect, test } from 'vitest';
import { QuestionTypeEnum } from '@/lib/owaClient';
import { questionsForQuiz } from '@/lib/handlers/questions/helpers';

test('match questions preserve questionImage', () => {
  const result = questionsForQuiz({
    starterQuiz: [
      {
        hint: '',
        active: false,
        feedback: '',
        questionId: 1,
        questionUid: 'question-1',
        questionType: QuestionTypeEnum.Match,
        questionStem: [
          {
            type: 'text',
            text: 'Match each label to its length.',
          },
          {
            type: 'image',
            image_object: {
              secure_url:
                'https://oaknationalacademy-res.cloudinary.com/image/upload/example.png',
              url: 'http://oaknationalacademy-res.cloudinary.com/image/upload/example.png',
              width: 640,
              height: 480,
              context: {
                custom: {
                  alt: 'Example triangle diagram',
                },
              },
              metadata: {
                attribution: 'Example attribution',
              },
            },
          },
        ],
        answers: {
          match: [
            {
              match_option: [{ type: 'text', text: 'a' }],
              correct_choice: [{ type: 'text', text: '4 cm' }],
            },
          ],
        },
      },
    ],
    exitQuiz: [],
  });

  expect(result.starterQuiz).toEqual([
    {
      question: 'Match each label to its length.',
      questionType: 'match',
      questionImage: {
        url: 'https://cloudinary-res.thenational.academy/image/upload/example.png',
        width: 640,
        height: 480,
        alt: 'Example triangle diagram',
        attribution: 'Example attribution',
      },
      answers: [
        {
          matchOption: {
            type: 'text',
            content: 'a',
          },
          correctChoice: {
            type: 'text',
            content: '4 cm',
          },
        },
      ],
    },
  ]);
});
