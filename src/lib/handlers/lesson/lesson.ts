import groupBy from 'object.groupby';
import pgFormat from 'pg-format';
import { protectedProcedure } from '@/lib/protect';
import { router } from '@/lib/trpc';
import { TRPCError } from '@trpc/server';
import type * as z from 'zod/v4';
import {
  getClient,
  gql,
  lessonView,
  lessonViewTable,
  querySQL,
} from 'lib/owaClient';
import type { LessonView } from 'lib/owaClient';
import { errorResponses } from '@/lib/errorResponses';

import {
  blockLessonForCopyrightText,
  checkLessonAllowedAsset,
} from '../../queryGate';
import Timing from '@/lib/serverTimings';

import type { LessonSearchResultType } from './schemas/lessonSearchResponse.schema';

import {
  lessonSearchRequestOpenAPISchema,
  lessonSearchResponseOpenAPISchema,
  lessonSummaryRequestOpenAPISchema,
  lessonSummaryResponseOpenAPISchema,
} from '@/lib/zod-openapi/generated/lesson';

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
groupBy.shim();

const timing = new Timing();

export const getLessons = router({
  getLesson: protectedProcedure
    .meta({
      openapi: {
        method: 'GET',
        tags: ['lessons', 'lesson-data'],
        summary: 'Lesson summary',
        path: '/lessons/{lesson}/summary',
        description: 'This endpoint returns a summary for a given lesson',
        errorResponses,
      },
    })
    .input(lessonSummaryRequestOpenAPISchema)
    .output(lessonSummaryResponseOpenAPISchema)
    .query(async ({ input }) => {
      const slug = decodeURIComponent(input.lesson);
      const client = getClient();

      const blocked = await blockLessonForCopyrightText(client, slug);

      if (blocked.isBlocked()) {
        // blocking actually gets true for a real 404 too, so we're
        // going to do a quick check to see if the lesson exists at all, and if not, we'll return a 404 instead of a 451. This is because we don't want to leak information about what lessons are blocked by returning a different status code for blocked vs non-existent lessons.

        const existsQuery = gql`
          query ($slug: String!) @cached(ttl: 300) {
            ${lessonView}(
              where: { lessonSlug: { _eq: $slug }, isLegacy: { _eq: false } }
            ) {
              lessonSlug
            }
          }
        `;

        const existsRes: LessonView = await client.request(existsQuery, {
          slug,
        });

        if (existsRes[lessonView].length === 0) {
          // lesson doesn't exist - return 404
          throw new TRPCError({
            message: 'Lesson not found',
            code: 'NOT_FOUND',
          });
        }

        throw new TRPCError({
          message: `Lesson (${slug}) not available for this query (blocked for copyright text)`,
          code: 'BAD_REQUEST',
          cause: blocked.reason,
        });
      }

      const query = gql`
        query ($slug: String!) @cached(ttl: 300) {
          ${lessonView}(
            where: { lessonSlug: { _eq: $slug }, isLegacy: { _eq: false } }
          ) {
            lessonTitle
            unitSlug
            unitTitle
            subjectSlug
            subjectTitle
            keyStageSlug
            keyStageTitle
            lessonKeywords
            keyLearningPoints
            misconceptionsAndCommonMistakes
            pupilLessonOutcome
            teacherTips
            contentGuidance
            downloadsAvailable: hasDownloadableResources
            supervisionLevel
          }
        }
      `;

      timing.start('getLesson graphql');
      const res: LessonView = await client.request(query, {
        slug,
      });
      timing.end('getLesson graphql');

      const data = res[lessonView];

      if (data.length === 0) {
        throw new TRPCError({
          message: 'Lesson not found',
          code: 'NOT_FOUND',
        });
      }

      try {
        const lesson = data[0] as z.infer<
          typeof lessonSummaryResponseOpenAPISchema
        >;

        lessonSummaryResponseOpenAPISchema.parse(lesson);

        // we need to loop through the lessons and change the downloadsAvailable
        // to check against the blockedLessons list. Ideally this would come from
        // the database, but currently it's not available and some parts of the
        // restricted flags are not fully implemented in the database
        if (lesson.downloadsAvailable) {
          const isBlockedForDownloads = await checkLessonAllowedAsset({
            client,
            lessonSlug: slug,
          });

          if (isBlockedForDownloads.isBlocked()) {
            lesson.downloadsAvailable = false;
          }
        }

        return lesson;
      } catch {
        throw new TRPCError({
          message: 'Internal server error',
          code: 'INTERNAL_SERVER_ERROR',
        });
      }
    }),
  searchByTextSimilarity: protectedProcedure
    .meta({
      openapi: {
        method: 'GET',
        tags: ['lessons', 'search'],
        path: '/search/lessons',
        summary: 'Lesson search using lesson title',
        description:
          'Search for a term and find the 20 most similar lessons with titles that contain similar text.',
        errorResponses,
      },
    })
    .input(lessonSearchRequestOpenAPISchema)
    .output(lessonSearchResponseOpenAPISchema)
    .query(async ({ input }) => {
      // store q from input.q and sanitize for use as an sql query:
      const q = input.q;
      const unit = input.unit || null;
      const subject = input.subject || null;
      const keyStage = input.keyStage || null;

      let sqlWhere = '"isLegacy" = false';

      if (unit) {
        sqlWhere += ` AND "unitSlug" = '${unit.replace(/'/g, "''")}'`;
      }

      if (subject) {
        sqlWhere += ` AND "subjectSlug" = '${subject.replace(/'/g, "''")}'`;
      }

      if (keyStage) {
        sqlWhere += ` AND "keyStageSlug" = '${keyStage.replace(/'/g, "''")}'`;
      }

      // Added clause to filter out finance lessons from search
      const financeWhere = `"subjectSlug" <> 'financial-education'`;
      const sql = String(
        pgFormat(
          `SELECT * from (SELECT "lessonSlug", SIMILARITY("lessonTitle", %L) FROM ${lessonViewTable} WHERE ${sqlWhere} AND ${financeWhere} group by "lessonSlug", "similarity") as a order by a.similarity desc limit 20`,
          q,
        ),
      );

      interface SQLResult {
        result: [string, string][];
      }

      const result = (await querySQL(sql).then((res) =>
        res.json(),
      )) as SQLResult;

      const slugs = result.result
        .slice(1)
        .map(([slug]: [string, string]) => slug);
      const similarity = result.result.slice(1).reduce(
        (acc: Record<string, number>, [slug, _]: [string, string]) => {
          acc[slug] = parseFloat(_);
          return acc;
        },
        {} as Record<string, number>,
      );

      const client = getClient();

      // reality is that this is never going to be string[]
      const variables: Record<string, string | number | string[]> = { slugs };

      const _and: string[] = ['lessonSlug: { _in: $slugs }'];
      const queryArgs = [];

      if (unit) {
        _and.push('unitSlug: { _eq: $unit }');
        queryArgs.push('$unit: String');
        variables.unit = unit;
      }

      if (subject) {
        _and.push('subjectSlug: { _eq: $subject }');
        queryArgs.push('$subject: String');
        variables.subject = subject;
      }

      if (keyStage) {
        _and.push('keyStageSlug: { _eq: $keyStage }');
        queryArgs.push('$keyStage: String');
        variables.keyStage = keyStage;
      }

      const where = `, _and: { ${_and.join(',')}}`;

      const query = gql`
        query ($slugs: [String!]!, ${queryArgs.join(',')}) {
          ${lessonView}(where: {${where}}) {
            lessonSlug
            lessonTitle
            keyStageSlug
            subjectSlug
            unitSlug
            unitTitle
            examBoardTitle
          }
        }
      `;

      interface LessonResult {
        lessonSlug: string;
        lessonTitle: string;
        keyStageSlug: string;
        subjectSlug: string;
        unitSlug: string;
        unitTitle: string;
        examBoardTitle: string;
      }

      interface LessonQueryResult {
        [lessonView]: LessonResult[];
      }

      const res: LessonQueryResult = await client.request(query, variables);

      if (res[lessonView].length === 0) {
        throw new TRPCError({
          message: 'No lessons found',
          code: 'NOT_FOUND',
        });
      }

      const groupedByLesson = Object.values(
        Object.groupBy(res[lessonView], ({ lessonSlug }) => lessonSlug),
      );

      return groupedByLesson
        .reduce((acc, res) => {
          // I can't see how this is ever true, but it's a TS thing.
          if (!res) {
            return acc;
          }

          const { lessonSlug, lessonTitle } = res[0];

          const units = res.map((_) => {
            return {
              unitSlug: _.unitSlug,
              unitTitle: _.unitTitle,
              examBoardTitle: _.examBoardTitle,
              keyStageSlug: _.keyStageSlug,
              subjectSlug: _.subjectSlug,
            };
          });

          acc.push({
            lessonSlug,
            lessonTitle,
            similarity: similarity[lessonSlug],
            units,
          });

          return acc;
        }, [] as LessonSearchResultType[])
        .toSorted((a, b) => b.similarity - a.similarity);
    }),
});
