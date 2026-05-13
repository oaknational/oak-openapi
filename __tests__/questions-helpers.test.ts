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

test('images filter only keeps questions with question or answer images', () => {
  const imageObject = {
    secure_url:
      'https://oaknationalacademy-res.cloudinary.com/image/upload/example.png',
    url: 'http://oaknationalacademy-res.cloudinary.com/image/upload/example.png',
    width: 640,
    height: 480,
    context: {
      custom: {
        alt: 'Example diagram',
      },
    },
    metadata: {
      attribution: 'Example attribution',
    },
  };

  const result = questionsForQuiz(
    {
      starterQuiz: [
        {
          hint: '',
          active: false,
          feedback: '',
          questionId: 1,
          questionUid: 'question-with-question-image',
          questionType: QuestionTypeEnum.ShortAnswer,
          questionStem: [
            { type: 'text', text: 'What does the image show?' },
            { type: 'image', image_object: imageObject },
          ],
          answers: {
            'short-answer': [
              {
                answer: [{ type: 'text', text: 'A triangle' }],
                answer_is_default: true,
              },
            ],
          },
        },
        {
          hint: '',
          active: false,
          feedback: '',
          questionId: 2,
          questionUid: 'text-only-question',
          questionType: QuestionTypeEnum.ShortAnswer,
          questionStem: [{ type: 'text', text: 'What is 2 + 2?' }],
          answers: {
            'short-answer': [
              {
                answer: [{ type: 'text', text: '4' }],
                answer_is_default: true,
              },
            ],
          },
        },
      ],
      exitQuiz: [
        {
          hint: '',
          active: false,
          feedback: '',
          questionId: 3,
          questionUid: 'question-with-answer-image',
          questionType: QuestionTypeEnum.MultipleChoice,
          questionStem: [{ type: 'text', text: 'Choose the image.' }],
          answers: {
            'multiple-choice': [
              {
                answer: [{ type: 'image', image_object: imageObject }],
                answer_is_correct: true,
              },
            ],
          },
        },
      ],
    },
    'images',
  );

  expect(result.starterQuiz).toHaveLength(1);
  expect(result.starterQuiz[0].question).toBe('What does the image show?');
  expect(result.exitQuiz).toHaveLength(1);
  expect(result.exitQuiz[0].question).toBe('Choose the image.');
});
