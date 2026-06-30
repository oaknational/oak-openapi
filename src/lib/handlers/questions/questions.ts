import { protectedProcedure } from '@/lib/protect';
import { router } from '@/lib/trpc';
import {
  getClient,
  gql,
  lessonView,
  sequenceView,
  sequenceViewWhereInput,
  unitVariantLessonsView,
} from 'lib/owaClient';
import type {
  LessonView,
  SequenceView,
  UnitVariantLessonsView,
} from 'lib/owaClient';

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
  questionsForProgrammeRequestOpenAPISchema,
  questionsForProgrammeResponseOpenAPISchema,
  questionsForSequenceRequestOpenAPISchema,
  questionsForSequenceResponseOpenAPISchema,
} from '@/lib/zod-openapi/generated/questions';
import { nextPageLink } from '@/lib/pagination';
import { errorResponses } from '@/lib/errorResponses';

function hasQuestions(results: Record<QuizKey, Question[]>): boolean {
  return results.starterQuiz.length > 0 || results.exitQuiz.length > 0;
}

export const getQuestions = router({
  getQuestionsForLessons: protectedProcedure
    .meta({
      openapi: {
        method: 'GET',
        tags: ['lessons', 'questions', 'quiz-questions'],
        path: '/lessons/{lesson}/quiz',
        summary: 'Quiz questions for a lesson',
        errorResponses,
        description: `Use when you have a lesson slug and need its starter and exit quiz questions with correct answers marked. Returns two arrays, starterQuiz and exitQuiz; each question includes the prompt, the answers (with correct ones flagged), and which answers are distractors.

Not for: quiz questions across a sequence (GET /sequences/{sequence}/questions); quiz questions in one programme (GET /programmes/{programme}/questions); across a key stage + subject (GET /key-stages/{keyStage}/subject/{subject}/questions); lesson metadata or assets (GET /lessons/{lesson}/summary or GET /lessons/{lesson}/assets).`,
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

      return questionsForQuiz(lesson, input.filter);
    }),
  getQuestionsForSequence: protectedProcedure
    .meta({
      openapi: {
        method: 'GET',
        tags: ['questions', 'sequences', 'unit-and-curriculum-data'],
        path: '/sequences/{sequence}/questions',
        summary: 'Quiz questions across a sequence',
        description: `Use when you want every quiz question across a whole sequence — all programmes combined. Returns questions grouped by lesson in unit sequence order. Pass year as an optional filter to return only that year's questions. Supports offset and limit; Link: rel="next" header signals more pages.

Not for: questions in a single programme (GET /programmes/{programme}/questions); a single lesson's quiz (GET /lessons/{lesson}/quiz); questions for a key stage + subject without programme structure (GET /key-stages/{keyStage}/subject/{subject}/questions).`,
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

        const results = questionsForQuiz(
          { exitQuiz, starterQuiz },
          input.filter,
        );

        if (!hasQuestions(results)) {
          continue;
        }

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
        description: `Use when you want every quiz question for a key stage + subject, without programme structure or unit sequence order. Returns lessons each with starter and exit quiz questions and answers. Supports offset/limit pagination; Link: rel="next" header signals more pages.

Not for: a single lesson's quiz (GET /lessons/{lesson}/quiz); questions across a sequence (GET /sequences/{sequence}/questions); questions in one programme (GET /programmes/{programme}/questions).`,
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

        const results = questionsForQuiz(
          { exitQuiz, starterQuiz },
          input.filter,
        );

        if (!hasQuestions(results)) {
          continue;
        }

        lessons.push({
          lessonTitle,
          lessonSlug,
          // unitSlug,
          ...results,
        });
      }

      return lessons;
    }),
  getQuestionsForProgramme: protectedProcedure
    .meta({
      openapi: {
        method: 'GET',
        tags: ['questions', 'programmes'],
        path: '/programmes/{programme}/questions',
        summary: 'Quiz questions in a programme',
        description: `Use when you want every quiz question in a single programme (year group) within a subject. Get programme slugs from GET /subjects/{subject}/programmes. Returns questions grouped by lesson with starter and exit quiz questions and answers. Supports offset/limit pagination; Link: rel="next" header signals more pages.

Not for: questions in a single lesson (GET /lessons/{lesson}/quiz); questions across a whole sequence (GET /sequences/{sequence}/questions); questions for a key stage + subject without programme structure (GET /key-stages/{keyStage}/subject/{subject}/questions).`,
        errorResponses,
      },
    })
    .input(questionsForProgrammeRequestOpenAPISchema)
    .output(questionsForProgrammeResponseOpenAPISchema)
    .query(async ({ input, ctx }) => {
      const { programme, limit, offset, filter } = input;
      const client = getClient();

      // Step 1: get lesson slugs for this programme from the unit variant view
      const lessonSlugQuery = gql`
        query ($programme: String!) {
          ${unitVariantLessonsView}(
            where: {
              programme_slug: { _eq: $programme }
              is_legacy: { _eq: false }
            }
          ) {
            lesson_slug
            unit_slug
            subject_slug: programme_fields(path: "subject_slug")
          }
        }
      `;

      const lessonSlugResult: UnitVariantLessonsView = await client.request(
        lessonSlugQuery,
        { programme },
      );
      const rows = lessonSlugResult[unitVariantLessonsView];

      if (rows.length === 0) {
        return [];
      }

      const subject = rows[0]?.subject_slug ?? '';
      const gateTest = isSequenceSubjectBlocked(subject);
      if (gateTest.isBlocked()) {
        throw new TRPCError({
          message: `The subject "${subject}" is not currently available`,
          code: 'BAD_REQUEST',
          cause: gateTest.reason,
        });
      }

      const uniqueLessonSlugs = [...new Set(rows.map((r) => r.lesson_slug))];
      const lessonToUnitSlug = Object.fromEntries(
        rows.map((r) => [r.lesson_slug, r.unit_slug]),
      );
      const lessonToSubjectSlug = Object.fromEntries(
        rows.map((r) => [r.lesson_slug, r.subject_slug]),
      );

      // Step 2: fetch questions with pagination
      const questionQuery = gql`
        query getQuestions($lessonSlugs: [String!]!, $limit: Int!, $offset: Int!) {
          ${lessonView}(
            where: {
              lessonSlug: { _in: $lessonSlugs }
              isLegacy: { _eq: false }
            }
            distinct_on: lessonSlug
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
        lessonSlugs: uniqueLessonSlugs,
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
        unitSlug: rawUnitSlug,
      } of data) {
        if (!lessonSlug || !lessonTitle) continue;
        if (!exitQuiz && !starterQuiz) continue;

        const unitSlug = rawUnitSlug ?? lessonToUnitSlug[lessonSlug] ?? '';
        if (!unitSlug) continue;

        if (checkLessonAllowedQuiz(lessonSlug).isBlocked()) continue;

        const lessonGateTest = await checkLessonAllowedAsset({
          lessonSlug,
          unitSlug,
          subjectSlug: lessonToSubjectSlug[lessonSlug] ?? subject,
        });
        if (lessonGateTest.isBlocked()) continue;

        const results = questionsForQuiz({ exitQuiz, starterQuiz }, filter);
        if (!hasQuestions(results)) continue;

        lessons.push({ lessonTitle, lessonSlug, ...results });
      }

      return lessons;
    }),
});
