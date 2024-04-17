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

export const getQuestions = router({
  getQuestionsForLessons: protectedProcedure
    .meta({
      openapi: {
        method: 'GET',
        tags: ['lessons', 'questions'],
        path: '/lessons/{lesson}/quiz',
        description: 'Get all the lesson quiz questions and answers',
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
          published_mv_lesson_openapi_1_0_0(
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

      return questions;
    }),
  getQuestionsForKeyStageAndSubject: protectedProcedure
    .meta({
      openapi: {
        tags: ['questions'],
        method: 'GET',
        path: '/key-stages/{keyStage}/subject/{subject}/questions',
        description:
          'Get all the lesson quizzes for a key stage and subject and includes the questions and answer options',
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
    .query(async ({ input }) => {
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
          published_mv_lesson_openapi_1_0_0(
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
