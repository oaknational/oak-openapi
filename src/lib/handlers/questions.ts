import { protectedProcedure } from '~/lib/auth';
import { router } from '~/lib/trpc';
import { keyStageSlugs, subjectSlugs } from 'lib/keyStageAndSubjects';
import {
  LessonView,
  QuestionType,
  getClient,
  gql,
  lessonView,
} from 'lib/owaClient';
import { z } from 'zod';
import { baseUrl } from '../baseUrl';

export const questionTypesEnum = z.enum([
  'text',
  'match',
  'explanatory-text',
  'order',
  'short-answer',
  'multiple-choice',
]);

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
      z.array(
        z.object({
          question: z.string(),
          questionType: questionTypesEnum,
          answers: z.array(
            z.object({ answer: z.string(), distractor: z.boolean() })
          ),
        })
      )
    )
    .query(async ({ input }) => {
      const slug = decodeURIComponent(input.lesson);

      const client = getClient();

      const query = gql`
        query ($slug: String!) {
          ${lessonView}(
            where: {
              lessonSlug: { _eq: $slug }
              exitQuiz: { _neq: "null" }
              isLegacy: { _eq: false }
            }
          ) {
            exitQuiz
          }
        }
      `;

      const res: LessonView = await client.request(query, {
        slug,
      });

      const data = res[lessonView];

      if (data.length === 0) {
        return [];
      }

      const lesson = data[0];

      if (!lesson || !lesson.exitQuiz) {
        return [];
      }

      const questions = [];
      for (const question of lesson.exitQuiz) {
        // FIXME expose more question types
        // Note that the entire answer structure is different depending on the question type
        if (question.questionType !== QuestionType.MultipleChoice) {
          continue;
        }

        const answers = question.answers[question.questionType];

        if (!answers) {
          continue;
        }

        questions.push({
          question: question.questionStem
            .filter((_) => _.type === 'text')
            .map((_) => _.text)
            .join(' '),
          questionType: question.questionType,
          answers: answers.map((answer) => ({
            answer: answer.answer
              .filter((_) => _.type === 'text')
              .map((_) => _.text)
              .join(' '),
            distractor: !answer.answer_is_correct,
          })),
        });
      }

      return questions;
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
          questions: z.array(
            z.object({
              question: z.string(),
              answers: z.array(
                z.object({ answer: z.string(), distractor: z.boolean() })
              ),
            })
          ),
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
              exitQuiz: { _neq: "null" }
              isLegacy: { _eq: false }
            }
            offset: $offset
            limit: $limit
          ) {
            lessonTitle
            lessonSlug
            exitQuiz
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

      for (const { exitQuiz, lessonSlug, lessonTitle } of data) {
        if (!exitQuiz || !lessonSlug || !lessonTitle) {
          continue;
        }

        const questions = [];
        for (const question of exitQuiz) {
          if (question.questionType !== QuestionType.MultipleChoice) {
            continue;
          }

          const answers = question.answers[QuestionType.MultipleChoice];

          if (!answers) {
            continue;
          }

          questions.push({
            question: question.questionStem
              .filter((_) => _.type === 'text')
              .map((_) => _.text)
              .join(' '),
            answers: answers.map((answer) => ({
              answer: answer.answer
                .filter((_) => _.type === 'text')
                .map((_) => _.text)
                .join(' '),
              distractor: !answer.answer_is_correct,
            })),
          });
        }

        lessons.push({
          lessonTitle,
          lessonSlug,
          questions,
        });
      }

      return lessons;
    }),
});
