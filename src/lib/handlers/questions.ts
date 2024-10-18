import { protectedProcedure } from '~/lib/protect';
import { router } from '~/lib/trpc';
import { keyStageSlugs, subjectSlugs } from 'lib/keyStageAndSubjects';
import { QuestionTypeEnum, getClient, gql, lessonView } from 'lib/owaClient';
import type {
  LessonView,
  Lesson,
  Question as DBQuestion,
  ImageAnswerStem,
  TextType,
  Match as DBMatch,
  OrderAnswer as DBOrder,
  ShortAnswer as DBShortAnswer,
  MultipleChoiceAnswer as DBMultipleChoiceAnswer,
} from 'lib/owaClient';
import { z } from 'zod';
import { baseUrl } from '../baseUrl';

const multipleChoiceLit = z.literal('multiple-choice');
const shortAnswerLit = z.literal('short-answer');
const matchAnswerLit = z.literal('match');
const orderAnswerLit = z.literal('order');

const availableQuestionTypes = z.union([
  multipleChoiceLit,
  shortAnswerLit,
  matchAnswerLit,
  orderAnswerLit,
]);

const imageAnswerContent = z.object({
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

  // license: z
  //   .object({
  //     attribution: z.string().optional(),
  //     source: z.string().optional(),
  //     attribution_required: z.boolean().optional(),
  //     usageRestrictions: z.string().optional(),
  //     usage_notes: z.string().optional(),
  //   })
  //   .optional(),
});

const textAnswer = z.object({
  type: z.literal('text'),
  content: z.string(),
});

const imageAnswer = z.object({
  type: z.literal('image'),
  content: imageAnswerContent,
});

const multipleChoiceAnswer = z
  .object({ distractor: z.boolean() })
  .and(z.union([textAnswer, imageAnswer]));

const shortAnswer = textAnswer;

const matchAnswer = z.object({
  matchOption: textAnswer,
  correctChoice: textAnswer,
});

const orderAnswer = z
  .object({
    order: z.number(),
  })
  .and(textAnswer);

const questionZod = z
  .object({
    question: z.string(),
    questionType: availableQuestionTypes,
  })
  .and(
    z.union([
      z.object(
        {
          questionType: multipleChoiceLit,
          answers: z.array(multipleChoiceAnswer),
        },
        {
          description:
            'Multiple choice answer allows for one or more than one answer to be correct as defined by the distractor field being set to false',
        }
      ),
      z.object(
        {
          questionType: shortAnswerLit,
          answers: z.array(shortAnswer),
        },
        {
          description:
            'Short answers allow students to enter a free text answer, and the answers array contains a list of acceptable answers',
        }
      ),
      z.object(
        {
          questionType: matchAnswerLit,
          answers: z.array(matchAnswer),
        },
        {
          description:
            'The student is offered a list from the `match_option` field in the answers array, and must correctly match them to the `correct_choice` value',
        }
      ),
      z.object(
        {
          questionType: orderAnswerLit,
          answers: z.array(orderAnswer),
        },
        {
          description:
            'The student is offered a list of items to order, and must correctly order them according to the `order` field. When presenting the answer options to the student, you should randomise the order of the items',
        }
      ),
    ])
  );

type Question = z.infer<typeof questionZod>;
type QuizKey = 'exitQuiz' | 'starterQuiz';
type TextAnswer = z.infer<typeof textAnswer>;
type MatchAnswer = z.infer<typeof matchAnswer>;
type OrderAnswer = z.infer<typeof orderAnswer>;
type MultipleChoiceAnswer = z.infer<typeof multipleChoiceAnswer>;
type ImageDataSchemaType = z.infer<typeof imageAnswerContent>;

function emptyQuizResults() {
  const result: { [key in QuizKey]: Question[] } = {
    starterQuiz: [],
    exitQuiz: [],
  };
  return result;
}

export function formatShortAnswer(answer: DBShortAnswer): TextAnswer {
  // sample slug: solving-equations-with-surds
  if (answer.answer[0].type === 'text') {
    return {
      type: answer.answer[0].type,
      content: answer.answer[0].text,
    };
  }

  throw new Error('Unexpected answer type');
}

export function formatMatchAnswer(answer: DBMatch): MatchAnswer {
  // sample slug: the-theme-of-family-in-grandads-island
  const matchOption = answer.match_option.filter((_) => _.type === 'text')[0];
  const correctChoice = answer.correct_choice.filter(
    (_) => _.type === 'text'
  )[0];

  return {
    matchOption: {
      type: matchOption.type,
      content: matchOption.text,
    },
    correctChoice: {
      type: correctChoice.type,
      content: correctChoice.text,
    },
  };
}

export function formatOrderAnswer(answer: DBOrder): OrderAnswer {
  // sample slug: ordering-negative-integers
  const content = answer.answer[0].text;

  return {
    type: 'text',
    content,
    order: answer.correct_order,
  };
}

function formatMultipleChoiceAnswer(
  answer: DBMultipleChoiceAnswer
): MultipleChoiceAnswer {
  // sample slug: solving-equations-with-surds

  if (answer.answer[0].type === 'text') {
    return {
      type: 'text',
      content: answer.answer[0].text,
      distractor: !answer.answer_is_correct,
    };
  }

  // next two declarations are cast in TypeScript because TS doesn't
  // know that _.type = 'image' always returns an ImageAnswerStem
  // (or undefined, which we handle)
  const image = answer.answer.find(
    (_) => _.type === 'image'
  ) as ImageAnswerStem;

  if (image) {
    const text = answer.answer.find((_) => _.type === 'text') as TextType;

    const content: ImageDataSchemaType = {
      url: image.image_object.secure_url || image.image_object.url || '',
      width: image.image_object.width || 0,
      height: image.image_object.height || 0,
      alt: image.image_object.context?.custom?.alt || undefined,
      text: text?.text || undefined,
      // license: image.image_object.metadata || undefined,
    };

    const res = {
      type: answer.answer[0].type,
      content,
      distractor: !answer.answer_is_correct,
    };

    // RS disabled license for now until we have final answer on how we deal
    // with unknown/uncategorised licenses (and)

    // if (res.content.license) {
    //   if (res.content.license?.attribution_required) {
    //     res.content.license.attribution_required =
    //       res.content.license.attribution_required ===
    //       ('yes' as unknown as boolean);
    //   }
    // }

    return res;
  }

  throw new Error('Unexpected answer type');
}

function formatQuestion(question: DBQuestion): Question | undefined {
  const questionText = question.questionStem
    .filter((_) => _.type === 'text')
    .map((_) => _.text)
    .join(' ');

  // TypeScript really doesn't like DRY. This code could…should be able to reuse
  // the `questionType`, but TS parser can't handle it, so it's exploded out like this

  if (question.questionType === QuestionTypeEnum.MultipleChoice) {
    return {
      question: questionText,
      questionType: QuestionTypeEnum.MultipleChoice,
      answers: question.answers[QuestionTypeEnum.MultipleChoice].map(
        formatMultipleChoiceAnswer
      ),
    };
  }

  if (question.questionType === QuestionTypeEnum.ShortAnswer) {
    return {
      question: questionText,
      questionType: QuestionTypeEnum.ShortAnswer,
      answers:
        question.answers[QuestionTypeEnum.ShortAnswer].map(formatShortAnswer),
    };
  }

  if (question.questionType === QuestionTypeEnum.Match) {
    return {
      question: questionText,
      questionType: QuestionTypeEnum.Match,
      answers: question.answers[QuestionTypeEnum.Match].map(formatMatchAnswer),
    };
  }

  if (question.questionType === QuestionTypeEnum.Order) {
    return {
      question: questionText,
      questionType: QuestionTypeEnum.Order,
      answers: question.answers[QuestionTypeEnum.Order].map(formatOrderAnswer),
    };
  }
}

function questionsForQuiz(lesson: Lesson): { [key in QuizKey]: Question[] } {
  const result = emptyQuizResults();
  for (const quiz of ['starterQuiz', 'exitQuiz'] as QuizKey[]) {
    let lessonContent;

    // seems verbose, but TS won't let me access `lesson` with an arbitrary string
    if (quiz === 'starterQuiz') {
      lessonContent = lesson.starterQuiz;
    } else {
      lessonContent = lesson.exitQuiz;
    }

    if (!lessonContent) {
      continue;
    }

    const questions: Question[] = [];
    for (const question of lessonContent) {
      if (!question.answers) {
        continue;
      }

      // filter out questions where the answers contain an image
      if (question.questionType === QuestionTypeEnum.MultipleChoice) {
        // images only appear in multiple choice questions (validated by checking db)
        const hasImageAnswer = question.answers[question.questionType].some(
          (answer) => answer.answer.some((a) => a.type === 'image')
        );

        if (hasImageAnswer) {
          continue;
        }
      }

      const res = formatQuestion(question);
      if (res) {
        questions.push(res);
      }
    }

    result[quiz] = questions;
  }
  return result;
}

export const getQuestions = router({
  getQuestionsForLessons: protectedProcedure
    .meta({
      openapi: {
        method: 'GET',
        tags: ['lessons', 'questions'],
        path: '/lessons/{lesson}/quiz',
        description:
          'This endpoint returns the quiz questions and answers (and indicates which answers are correct and which are distractors) for a given lesson',
        example: {
          request: {
            lesson: 'joining-using-and',
          },
          response: [
            {
              question: 'What is a main clause?',
              questionType: 'multiple-choice',
              answers: [
                {
                  answer: 'a list of nouns',
                  distractor: true,
                },
                {
                  answer:
                    'a group of words that contains a verb and makes complete sense',
                  distractor: false,
                },
                {
                  answer: 'a word class',
                  distractor: true,
                },
                {
                  answer: 'a group of words with no verb',
                  distractor: true,
                },
              ],
            },
          ],
        },
      },
    })
    .input(
      z.object({
        lesson: z.string(),
      })
    )
    .output(
      z.object({
        starterQuiz: z.array(questionZod),
        exitQuiz: z.array(questionZod),
      })
    )
    .query(async ({ input }) => {
      const slug = decodeURIComponent(input.lesson);

      const client = getClient();

      const query = gql`
        query ($slug: String!) {
          ${lessonView}(
            where: {
              lessonSlug: { _eq: $slug }
              isLegacy: { _eq: false }
            }
          ) {
            exitQuiz
            starterQuiz
          }
        }
      `;

      const res: LessonView = await client.request(query, {
        slug,
      });

      const result: { [key in QuizKey]: Question[] } = {
        starterQuiz: [],
        exitQuiz: [],
      };

      const data = res[lessonView];

      if (data.length === 0) {
        return result;
      }

      const lesson = data[0];

      if (!lesson) {
        return result;
      }

      return questionsForQuiz(lesson);
    }),
  getQuestionsForKeyStageAndSubject: protectedProcedure
    .meta({
      openapi: {
        tags: ['questions'],
        method: 'GET',
        path: '/key-stages/{keyStage}/subject/{subject}/questions',
        description:
          'This endpoint returns all the quiz questions and answers (and indicates which answers are correct and which are distractors), grouped by lesson, for a given key stage and subject',
        example: {
          response: [
            {
              lessonSlug: 'joining-using-and',
              lessonTitle: "Joining using 'and'",
              questions: [
                {
                  question: 'Which word is a verb?',
                  answers: [
                    {
                      answer: 'shops',
                      distractor: true,
                    },
                    {
                      answer: 'Jun',
                      distractor: true,
                    },
                    {
                      answer: 'I',
                      distractor: true,
                    },
                    {
                      answer: 'shout',
                      distractor: false,
                    },
                  ],
                },
              ],
            },
          ],
        },
      },
    })
    .input(
      z.object({
        keyStage: z.enum(keyStageSlugs as [string], {
          description:
            "Key stage slug to filter by, e.g. 'ks2' - note that casing is important here, and should be lowercase",
        }),
        subject: z.enum(subjectSlugs as [string], {
          description:
            "Subject slug to search by, e.g. 'science' - note that casing is important here",
        }),
        offset: z.number().optional().default(0),
        limit: z
          .number({
            description: 'Limit the number of results returned, max 100',
          })
          .lte(100)
          .optional()
          .default(10),
      })
    )
    .output(
      z.array(
        z.object({
          lessonSlug: z.string(),
          lessonTitle: z.string(),
          starterQuiz: z.array(questionZod),
          exitQuiz: z.array(questionZod),
        })
      )
    )
    .query(async ({ input, ctx }) => {
      const keyStage = decodeURIComponent(input.keyStage);
      const subject = decodeURIComponent(input.subject);

      const offset = input.offset;
      const limit = input.limit;

      const client = getClient();

      const query = gql`
        query (
          $keyStage: String!
          $subject: String!
          $offset: Int!
          $limit: Int!
        ) {
          ${lessonView}(
            where: {
              keyStageSlug: { _eq: $keyStage }
              subjectSlug: { _eq: $subject }
              isLegacy: { _eq: false }
            }
            offset: $offset
            limit: $limit
          ) {
            lessonTitle
            lessonSlug
            exitQuiz
            starterQuiz
          }
        }
      `;

      const res: LessonView = await client.request(query, {
        keyStage,
        subject,
        offset,
        limit,
      });

      const data = res[lessonView];

      if (data.length === 0) {
        return [];
      }

      let next = null;
      if (data.length === limit) {
        next = `${baseUrl}${ctx.req.url}?offset=${
          offset + limit
        }&limit=${limit}`;
        ctx.res.setHeader('link', `<${next}>; rel="next"`);
      }

      const lessons = [];

      for (const { exitQuiz, starterQuiz, lessonSlug, lessonTitle } of data) {
        if (!lessonSlug || !lessonTitle) {
          continue;
        }

        if (!exitQuiz && !starterQuiz) {
          continue;
        }

        const results = questionsForQuiz({ exitQuiz, starterQuiz });

        lessons.push({
          lessonTitle,
          lessonSlug,
          ...results,
        });
      }

      return lessons;
    }),
});
