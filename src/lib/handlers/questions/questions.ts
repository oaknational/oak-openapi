import { protectedProcedure } from '@/lib/protect';
import { router } from '@/lib/trpc';
import {
  getClient,
  gql,
  lessonView,
  sequenceView,
  sequenceViewWhereInput,
} from 'lib/owaClient';
import type { LessonView, SequenceView } from 'lib/owaClient';

import {
  blockedSubjects,
  checkLessonAllowedAsset,
  checkLessonAllowedQuiz,
  getSubjectAndUnitForLesson,
  isSequenceSubjectBlocked,
} from '../../queryGate';
import allowedUnits from '../../queryGateData/copyright/supportedUnits.json' with { type: 'json' };
import type { Question, QuizKey } from './types';
import { TRPCError } from '@trpc/server';
import { sequenceWhere } from '../sequences/sequences';
import { parseSubjectPhaseSlug } from '../../sequenceSlugParser';
import { questionsForQuiz } from './helpers';
import {
  questionForLessonsRequestOpenAPISchema,
  questionForLessonsResponseOpenAPISchema,
  questionsForKeyStageAndSubjectRequestOpenAPISchema,
  questionsForKeyStageAndSubjectResponseOpenAPISchema,
  questionsForSequenceRequestOpenAPISchema,
  questionsForSequenceResponseOpenAPISchema,
} from '@/lib/zod-openapi/generated/questions';
import { nextPageLink } from '@/lib/pagination';
import { errorResponses } from '@/lib/errorResponses';

export const getQuestions = router({
  getQuestionsForLessons: protectedProcedure
    .meta({
      openapi: {
        method: 'GET',
        tags: ['lessons', 'questions', 'quiz-questions'],
        path: '/lessons/{lesson}/quiz',
        summary: 'Quiz questions for a lesson',
        errorResponses,
        description: `Use this when you have a lesson slug and need its starter quiz and exit quiz questions with correct answers marked.

Returns two arrays, 'starterQuiz' and 'exitQuiz'. Each question includes its stem, the answer options, and flags indicating which options are correct and which are distractors.

Do not use this for:
- Quiz questions across a whole sequence (use GET /sequences/{sequence}/questions)
- Quiz questions across a key stage and subject (use GET /key-stages/{keyStage}/subject/{subject}/questions)
- The lesson's metadata or downloadable assets (use GET /lessons/{lesson}/summary or GET /lessons/{lesson}/assets)`,
      },
    })
    .input(questionForLessonsRequestOpenAPISchema)
    .output(questionForLessonsResponseOpenAPISchema)
    .query(async ({ input }) => {
      const slug = decodeURIComponent(input.lesson);

      const client = getClient();

      const quizGateTest = checkLessonAllowedQuiz(slug);

      if (quizGateTest.isBlocked()) {
        throw new TRPCError({
          message: `Lesson (${slug}) quiz is not available`,
          code: 'BAD_REQUEST',
          cause: quizGateTest.reason,
        });
      }

      const gateTest = await checkLessonAllowedAsset({
        client,
        lessonSlug: slug,
      });

      if (gateTest.isBlocked()) {
        throw new TRPCError({
          message: `Lesson (${slug}) quiz is not available due to copyright restrictions`,
          code: 'BAD_REQUEST',
          cause: gateTest.reason,
        });
      }

      const subjectUnit = await getSubjectAndUnitForLesson(client, slug);

      if (!subjectUnit) {
        throw new TRPCError({
          message: 'Lesson not found',
          code: 'NOT_FOUND',
        });
      }

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

      const result: Record<QuizKey, Question[]> = {
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
  getQuestionsForSequence: protectedProcedure
    .meta({
      openapi: {
        method: 'GET',
        tags: ['questions', 'sequences', 'unit-and-curriculum-data'],
        path: '/sequences/{sequence}/questions',
        summary: 'Quiz questions across a sequence',
        description: `Use this when you want every quiz question for a whole curriculum sequence — for example, to build a bank of revision questions spanning a subject and year.

Returns lessons in sequence order, each with its starter quiz and exit quiz questions and answers. Supports 'year', 'offset', and 'limit'; a 'Link: <...>; rel="next"' header is returned when more pages are available.

Do not use this for:
- A single lesson's quiz (use GET /lessons/{lesson}/quiz)
- A key-stage and subject grouping rather than a sequence (use GET /key-stages/{keyStage}/subject/{subject}/questions)`,
        errorResponses,
      },
    })
    .input(questionsForSequenceRequestOpenAPISchema)
    .output(questionsForSequenceResponseOpenAPISchema)
    .query(async ({ input, ctx }) => {
      const { limit, offset, sequence, year } = input;
      const client = getClient();

      const { subjectSlug } = parseSubjectPhaseSlug(input.sequence);
      const gateTest = isSequenceSubjectBlocked(subjectSlug);

      if (gateTest.isBlocked()) {
        throw new TRPCError({
          message: `The subject "${subjectSlug}" is not currently available`,
          code: 'BAD_REQUEST',
          cause: gateTest.reason,
        });
      }

      const where = sequenceWhere(sequence, year?.toString());

      const query = gql`
      query ($where: ${sequenceViewWhereInput}!) {
        ${sequenceView}(
          where: $where
          order_by: { order: asc }
        ) {
          lessons
        }
      }`;

      const sequenceResult: SequenceView = await client.request(query, {
        where,
      });
      const rawData = sequenceResult[sequenceView];

      // unique lesson slugs
      const lessonSlugs = new Set(
        rawData
          .map((unit) => {
            return unit.lessons.map((lesson) => lesson.slug);
          })
          .flat(),
      );

      const questionQuery = gql`
        query getQuestions($lessonSlugs: [String!]!, $limit: Int!, $offset: Int!) {
          ${lessonView}(
            where: {
              lessonSlug: { _in: $lessonSlugs }
              isLegacy: { _eq: false }
            }
            distinct_on:lessonSlug
            offset: $offset
            limit: $limit
          ) {
            lessonTitle
            lessonSlug
            unitSlug
            exitQuiz
            starterQuiz
          }
        }
      `;

      const res: LessonView = await client.request(questionQuery, {
        lessonSlugs: Array.from(lessonSlugs),
        offset,
        limit,
      });

      const data = res[lessonView];

      if (data.length === 0) {
        return [];
      }

      if (data.length === limit) {
        ctx.resHeaders.set(
          'link',
          `<${nextPageLink(ctx.req.url, offset, limit)}>; rel="next"`,
        );
      }

      const lessons = [];

      for (const {
        exitQuiz,
        starterQuiz,
        lessonSlug,
        lessonTitle,
        unitSlug,
      } of data) {
        if (!lessonSlug || !lessonTitle) {
          continue;
        }

        if (!exitQuiz && !starterQuiz) {
          continue;
        }

        if (!unitSlug) {
          continue;
        }

        if (checkLessonAllowedQuiz(lessonSlug).isBlocked()) {
          continue;
        }

        // check if the lesson has blocked assets or not
        const gateTest = await checkLessonAllowedAsset({
          lessonSlug,
          unitSlug,
          subjectSlug,
        });

        if (gateTest.isBlocked()) {
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
  getQuestionsForKeyStageAndSubject: protectedProcedure
    .meta({
      openapi: {
        tags: ['questions', 'quiz-questions'],
        method: 'GET',
        path: '/key-stages/{keyStage}/subject/{subject}/questions',
        summary: 'Quiz questions by key stage and subject',
        errorResponses,
        description: `Use this when you want every quiz question for a key stage and subject, without regard to sequence or year ordering.

Returns lessons each with their starter quiz and exit quiz questions and answers. Supports 'offset' and 'limit'; a 'Link: <...>; rel="next"' header is returned when more pages are available.

Do not use this for:
- A single lesson's quiz (use GET /lessons/{lesson}/quiz)
- A specific curriculum sequence with year ordering (use GET /sequences/{sequence}/questions)`,
      },
    })
    .input(questionsForKeyStageAndSubjectRequestOpenAPISchema)
    .output(questionsForKeyStageAndSubjectResponseOpenAPISchema)
    .query(async ({ input, ctx }) => {
      const keyStage = decodeURIComponent(input.keyStage);
      const subject = decodeURIComponent(input.subject);

      const offset = input.offset;
      const limit = input.limit;

      const client = getClient();

      let query;

      // this is a brittle hack to get us through the hackathon. I know that
      if (blockedSubjects.includes(subject)) {
        query = gql`
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
              unitSlug: { _in: ${JSON.stringify(allowedUnits)} }
            }
            offset: $offset
            limit: $limit
          ) {
            lessonTitle
            lessonSlug
            unitSlug
            exitQuiz
            starterQuiz
          }
        }
      `;
      } else {
        query = gql`
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
            unitSlug
            exitQuiz
            starterQuiz
          }
        }
      `;
      }

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

      if (data.length === limit) {
        ctx.resHeaders.set(
          'link',
          `<${nextPageLink(ctx.req.url, offset, limit)}>; rel="next"`,
        );
      }

      const lessons = [];

      for (const {
        exitQuiz,
        starterQuiz,
        lessonSlug,
        lessonTitle,
        unitSlug,
      } of data) {
        if (!lessonSlug || !lessonTitle) {
          continue;
        }

        if (!exitQuiz && !starterQuiz) {
          continue;
        }

        if (!unitSlug) {
          continue;
        }

        if (checkLessonAllowedQuiz(lessonSlug).isBlocked()) {
          continue;
        }

        // check if the lesson has blocked assets or not
        const gateTest = await checkLessonAllowedAsset({
          lessonSlug,
          unitSlug,
          subjectSlug: subject,
        });

        // I'm fairly sure this is going to mess with the pagination numbers
        // but until we are able to use the database for restricted lessons,
        // we have to do it _post-query_.
        if (gateTest.isBlocked()) {
          continue;
        }

        const results = questionsForQuiz({ exitQuiz, starterQuiz });

        lessons.push({
          lessonTitle,
          lessonSlug,
          // unitSlug,
          ...results,
        });
      }

      return lessons;
    }),
});
