import { z } from 'zod';

export const multipleChoiceLit = z.literal('multiple-choice');
export const shortAnswerLit = z.literal('short-answer');
export const matchAnswerLit = z.literal('match');
export const orderAnswerLit = z.literal('order');

export const availableQuestionTypes = z.union([
  multipleChoiceLit,
  shortAnswerLit,
  matchAnswerLit,
  orderAnswerLit,
]);

export const imageContent = z.object({
  url: z.string(),
  width: z.number(),
  height: z.number(),
  alt: z.string().optional(),
  text: z
    .string({
      description: 'Supplementary text for the image, if any',
    })
    .optional(),
  // RS disabled license for now until we have final answer on how we deal
  // with unknown/uncategorised licenses
  attribution: z.string().optional(),

  // license: z
  //   .object({
  //     source: z.string().optional(),
  //     attribution_required: z.boolean().optional(),
  //     usageRestrictions: z.string().optional(),
  //     usage_notes: z.string().optional(),
  //   })
  //   .optional(),
});

export const textAnswer = z.object({
  type: z.literal('text'),
  content: z.string(),
});

export const imageAnswer = z.object({
  type: z.literal('image'),
  content: imageContent,
});

export const multipleChoiceAnswer = z
  .object({ distractor: z.boolean() })
  .and(z.union([textAnswer, imageAnswer]));

export const shortAnswer = textAnswer;

export const matchAnswer = z.object({
  matchOption: textAnswer,
  correctChoice: textAnswer,
});

export const orderAnswer = z
  .object({
    order: z.number(),
  })
  .and(textAnswer);

export const questionZod = z
  .object({
    question: z.string(),
    questionType: availableQuestionTypes,
    questionImage: imageContent.optional(),
  })
  .and(
    z.discriminatedUnion('questionType', [
      z.object(
        {
          questionType: multipleChoiceLit,
          answers: z.array(multipleChoiceAnswer),
        },
        {
          description:
            'Multiple choice answer allows for one or more than one answer to be correct as defined by the distractor field being set to false',
        },
      ),
      z.object(
        {
          questionType: shortAnswerLit,
          answers: z.array(shortAnswer),
        },
        {
          description:
            'Short answers allow students to enter a free text answer, and the answers array contains a list of acceptable answers',
        },
      ),
      z.object(
        {
          questionType: matchAnswerLit,
          answers: z.array(matchAnswer),
        },
        {
          description:
            'The student is offered a list from the `match_option` field in the answers array, and must correctly match them to the `correct_choice` value',
        },
      ),
      z.object(
        {
          questionType: orderAnswerLit,
          answers: z.array(orderAnswer),
        },
        {
          description:
            'The student is offered a list of items to order, and must correctly order them according to the `order` field. When presenting the answer options to the student, you should randomise the order of the items',
        },
      ),
    ]),
  );

export const questionsSchema = z.array(
  z.object({
    lessonSlug: z.string(),
    lessonTitle: z.string(),
    // unitSlug: z.string(),
    starterQuiz: z.array(questionZod),
    exitQuiz: z.array(questionZod),
  }),
);

export type Question = z.infer<typeof questionZod>;
export type QuizKey = 'exitQuiz' | 'starterQuiz';
export type TextAnswer = z.infer<typeof textAnswer>;
export type MatchAnswer = z.infer<typeof matchAnswer>;
export type OrderAnswer = z.infer<typeof orderAnswer>;
export type MultipleChoiceAnswer = z.infer<typeof multipleChoiceAnswer>;
export type ImageDataSchemaType = z.infer<typeof imageContent>;
