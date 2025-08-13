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

import { baseUrl } from '../../baseUrl';
import {
  blockedSubjects,
  getSubjectAndUnitForLesson,
  isBlockedUnitOrSubject,
  supportsImages,
} from '../../queryGate';
import allowedUnits from '../../queryGateData/supportedUnits.json' with { type: 'json' };
import { TRPCError } from '@trpc/server';
import { sequenceWhere } from '../sequences/sequences';
import { parseSubjectPhaseSlug } from '../../sequenceSlugParser';
import { blockedSequenceSubjects } from '../../blockedContent';
import { Question, QuizKey } from './types';

import {
  questionForLessonsRequestOpenAPISchema,
  questionForLessonsResponseOpenAPISchema,
} from '@/lib/zod-openapi/generated/questions';
import { questionsForQuiz } from './helpers';
import {
  questionsForKeyStageAndSubjectRequestOpenAPISchema,
  questionsForKeyStageAndSubjectResponseOpenAPISchema,
  questionsForSequenceRequestOpenAPISchema,
  questionsForSequenceResponseOpenAPISchema,
} from '@/lib/zod-openapi/generated/questions';

export const getQuestions = router({
  getQuestionsForLessons: protectedProcedure
    .meta({
      openapi: {
        method: 'GET',
        tags: ['lessons', 'questions'],
        path: '/lessons/{lesson}/quiz',
        summary: 'Quiz questions by lesson',
        errorResponses: [],
        description:
          'The endpoint returns the quiz questions and answers for a given lesson. The answers data indicates which answers are correct, and which are distractors.',
      },
    })
    .input(questionForLessonsRequestOpenAPISchema)
    .output(questionForLessonsResponseOpenAPISchema)
    .query(async ({ input }) => {
      const slug = decodeURIComponent(input.lesson);

      const client = getClient();

      const subjectUnit = await getSubjectAndUnitForLesson(client, slug);

      if (!subjectUnit) {
        throw new TRPCError({
          message: 'Lesson not found',
          code: 'NOT_FOUND',
        });
      }

      const blocked = isBlockedUnitOrSubject(subjectUnit);

      if (blocked) {
        throw new TRPCError({
          message: 'Lesson not available for this query',
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

      const imagesAllowed = supportsImages(
        subjectUnit.subjectSlug,
        subjectUnit.unitSlug,
      );

      return questionsForQuiz(lesson, imagesAllowed);
    }),
  getQuestionsForSequence: protectedProcedure
    .meta({
      openapi: {
        method: 'GET',
        tags: ['questions', 'sequences', 'unit-and-curriculum-data'],
        path: '/sequences/{sequence}/questions',
        summary: 'Questions within a sequence',
        description: `This endpoint returns all quiz questions for a given sequence. The assets are separated into starter quiz and entry quiz arrays, grouped by lesson.`,
        errorResponses: [],
      },
    })
    .input(questionsForSequenceRequestOpenAPISchema)
    .output(questionsForSequenceResponseOpenAPISchema)
    .query(async ({ input, ctx }) => {
      const { limit, offset, sequence, year } = input;
      const client = getClient();

      const { subjectSlug } = parseSubjectPhaseSlug(input.sequence);

      if (blockedSequenceSubjects.includes(subjectSlug)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `The subject "${subjectSlug}" is not currently available`,
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

      let next = null;
      if (data.length === limit) {
        next = `${baseUrl}${ctx.req.url}?offset=${
          offset + limit
        }&limit=${limit}`;
        ctx.resHeaders.set('link', `<${next}>; rel="next"`);
      }

      const lessons = [];

      for (const {
        exitQuiz,
        starterQuiz,
        lessonSlug,
        lessonTitle,
        unitSlug,
        subjectSlug,
      } of data) {
        if (!lessonSlug || !lessonTitle) {
          continue;
        }

        if (!exitQuiz && !starterQuiz) {
          continue;
        }

        const imagesAllowed = supportsImages(subjectSlug || '', unitSlug || '');

        const results = questionsForQuiz(
          { exitQuiz, starterQuiz },
          imagesAllowed,
        );

        lessons.push({
          lessonTitle,
          lessonSlug,
          // unitSlug,
          ...results,
        });
      }

      return lessons;
    }),
  getQuestionsForKeyStageAndSubject: protectedProcedure
    .meta({
      openapi: {
        tags: ['questions'],
        method: 'GET',
        path: '/key-stages/{keyStage}/subject/{subject}/questions',
        summary: 'Quiz questions by subject and key stage',
        errorResponses: [],
        description:
          'This endpoint returns quiz questions and answers for each lesson within a requested subject and key stage.',
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

      let next = null;
      if (data.length === limit) {
        next = `${baseUrl}${ctx.req.url}?offset=${
          offset + limit
        }&limit=${limit}`;
        ctx.resHeaders.set('link', `<${next}>; rel="next"`);
      }

      const lessons = [];

      for (const {
        exitQuiz,
        starterQuiz,
        lessonSlug,
        lessonTitle,
        unitSlug,
        subjectSlug,
      } of data) {
        if (!lessonSlug || !lessonTitle) {
          continue;
        }

        if (!exitQuiz && !starterQuiz) {
          continue;
        }

        const imagesAllowed = supportsImages(subjectSlug || '', unitSlug || '');

        const results = questionsForQuiz(
          { exitQuiz, starterQuiz },
          imagesAllowed,
        );

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
