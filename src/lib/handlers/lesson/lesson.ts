import groupBy from 'object.groupby';
import toSorted from 'array.prototype.tosorted';
import { protectedProcedure } from '~/lib/protect';
import { router } from '~/lib/trpc';
import { TRPCError } from '@trpc/server';
import {
  LessonView,
  getClient,
  gql,
  lessonView,
  lessonViewTable,
  querySQL,
} from 'lib/owaClient';
import { z } from 'zod';

import { blockLessonForCopyrightText } from '../../queryGate';
import Timing from '~/lib/serverTimings';

import { LessonSearchResultType } from './schemas/lessonSearchResponse.schema';

import 'zod-openapi/extend';

import {
  lessonSearchRequestOpenAPISchema,
  lessonSearchResponseOpenAPISchema,
  lessonSummaryRequestOpenAPISchema,
  lessonSummaryResponseOpenAPISchema,
} from '~/lib/zod-openapi/generated/lesson';

toSorted.shim();
groupBy.shim();

const timing = new Timing();

export const getLessons = router({
  getLesson: protectedProcedure
    .meta({
      openapi: {
        method: 'GET',
        tags: ['lessons'],
        path: '/lessons/{lesson}/summary',
        description: 'This endpoint returns a summary for a given lesson',
        errorResponses: [],
      },
    })
    .input(lessonSummaryRequestOpenAPISchema)
    .output(lessonSummaryResponseOpenAPISchema)
    .query(async ({ ctx, input }) => {
      const { resHeaders: headers } = ctx;
      const slug = decodeURIComponent(input.lesson);
      console.log(input, ctx, headers);
      const client = getClient();

      timing.start('blockLessonForCopyrightText');
      const blocked = await blockLessonForCopyrightText(client, slug);
      timing.end('blockLessonForCopyrightText');

      if (blocked) {
        ctx.resHeaders.set(
          'Server-Timing',
          timing.toHeader(ctx.resHeaders).toString(),
        );

        throw new TRPCError({
          message:
            'Lesson not available for this query (blocked for copyright text)',
          code: 'NOT_FOUND',
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
      console.log(ctx.resHeaders);
      ctx.resHeaders.set(
        'Server-Timing',
        timing.toHeader(ctx.resHeaders).toString(),
      );

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
        description:
          'This endpoint returns lessons that are similar to the search criteria, including a similarity score, and details of the unit that it is in',
        errorResponses: [],
      },
    })
    .input(lessonSearchRequestOpenAPISchema)
    .output(lessonSearchResponseOpenAPISchema)
    .query(async ({ input }) => {
      // store q from input.q and sanitize for use as an sql query:
      const q = input.q.replace(/'/g, "''");
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
      const sql = `SELECT * from (SELECT "lessonSlug", SIMILARITY("lessonTitle", '${q}') FROM ${lessonViewTable} WHERE ${sqlWhere} AND ${financeWhere} group by "lessonSlug", "similarity") as a order by a.similarity desc limit 20`;

      const result = await querySQL(sql).then((res) => res.json());

      const slugs = result.result.slice(1).map(([slug]: [string]) => slug);
      const similarity = result.result.slice(1).reduce(
        (acc: { [x: string]: number }, [slug, _]: [string, string]) => {
          acc[slug] = parseFloat(_);
          return acc;
        },
        {} as Record<string, number>,
      );

      const client = getClient();

      const variables: Record<string, string | number> = { slugs };

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

      const lessonResult = z.object({
        lessonSlug: z.string(),
        lessonTitle: z.string(),
        keyStageSlug: z.string(),
        subjectSlug: z.string(),
        unitSlug: z.string(),
        unitTitle: z.string(),
        examBoardTitle: z.string(),
      });

      const lessonQueryResult = z.object({
        [lessonView]: z.array(lessonResult),
      });

      type LessonQueryResult = z.infer<typeof lessonQueryResult>;

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
