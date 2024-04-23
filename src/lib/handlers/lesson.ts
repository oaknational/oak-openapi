import { protectedProcedure } from '~/lib/auth';
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
import { keyStageSlugs, subjectSlugs } from '../keyStageAndSubjects';

const lessonSummary = z.object({
  lessonTitle: z.string(),
  unitSlug: z.string(),
  unitTitle: z.string(),
  subjectSlug: z.string(),
  subjectTitle: z.string(),
  keyStageSlug: z.string(),
  keyStageTitle: z.string(),
  lessonKeywords: z.array(
    z.object({ keyword: z.string(), description: z.string() })
  ),
  keyLearningPoints: z.array(z.object({ keyLearningPoint: z.string() })),
  misconceptionsAndCommonMistakes: z.array(
    z.object({ misconception: z.string(), response: z.string() })
  ),
  pupilLessonOutcome: z.string().optional(),
  teacherTips: z.array(z.object({ teacherTip: z.string() })),
  contentGuidance: z.array(
    z.object({
      contentGuidanceArea: z.string(),
      supervisionlevel_id: z.number(),
      contentGuidanceLabel: z.string(),
      contentGuidanceDescription: z.string(),
    })
  ),
  supervisionLevel: z.string(),
  hasDownloadableResources: z.boolean(),
});

type LessonSummary = z.infer<typeof lessonSummary>;

export const getLessons = router({
  getLesson: protectedProcedure
    .meta({
      openapi: {
        method: 'GET',
        tags: ['lessons'],
        path: '/lessons/{lesson}/summary',
        description: 'Get a summary of the specified lesson',
        example: {
          request: {
            lesson: 'simple-compound-and-adverbial-complex-sentences',
          },
        },
      },
    })
    .input(
      z.object({
        lesson: z.string({ description: 'The slug of the lesson' }),
      })
    )
    .output(lessonSummary)
    .query(async ({ input }) => {
      const slug = decodeURIComponent(input.lesson);

      const client = getClient();

      const query = gql`
        query ($slug: String!) {
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
            hasDownloadableResources
            supervisionLevel
          }
        }
      `;

      const res: LessonView = await client.request(query, {
        slug,
      });

      const data = res[lessonView];

      if (data.length === 0) {
        throw new TRPCError({
          message: 'Lesson not found',
          code: 'NOT_FOUND',
        });
      }

      const lesson = data[0] as LessonSummary;
      return lesson;
    }),
  searchByTextSimilarity: protectedProcedure
    .meta({
      // FIXME what is this exactly?
      openapi: {
        method: 'GET',
        tags: ['lessons', 'search'],
        path: '/search/lessons',
        description: 'Find lessons with a similar title as the given text',
      },
    })
    .input(
      z.object({
        q: z.string(),
        keyStage: z
          .enum(keyStageSlugs as [string], {
            description:
              "Key stage slug to filter by, e.g. 'ks2' - note that casing is important here, and should be lowercase",
          })
          .optional(),
        subject: z
          .enum(subjectSlugs as [string], {
            description:
              "Subject slug to filter by, e.g. 'english' - note that casing is important here, and should be lowercase",
          })
          .optional(),
        unit: z
          .string({
            description: 'Optional unit slug to additionally filter by.',
          })
          .optional(),
      })
    )
    .output(
      z.array(
        z.object({
          lessonSlug: z.string(),
          lessonTitle: z.string(),
        })
      )
    )
    .query(async ({ input }) => {
      // store q from input.q and sanitize for use as an sql query:
      const q = input.q.replace(/'/g, "''");
      const unit = input.unit || null;
      const subject = input.subject || null;
      const keyStage = input.keyStage || null;

      const result = await querySQL(
        `SELECT * from (SELECT "lessonSlug", SIMILARITY("lessonTitle", '${q}') FROM ${lessonViewTable}) as a order by a.similarity desc limit 20`
      ).then((res) => res.json());

      const slugs = result.result.slice(1).map(([slug]: [string]) => slug);

      const client = getClient();

      let where = `lessonSlug in ('${slugs.join("','")}')`;

      if (unit) {
        where += `, _and: { unitSlug: { _eq: "${unit}" } }`;
      }

      if (subject) {
        where += `, _and: { subjectSlug: { _eq: "${subject}" } }`;
      }

      if (keyStage) {
        where += `, _and: { keyStageSlug: { _eq: "${keyStage}" } }`;
      }

      const query = gql`
        query ($slugs: [String!]!) {
          ${lessonView}(where: ${where}) {
            lessonSlug
            lessonTitle
          }
        }
      `;

      const res: LessonView = await client.request(query, { slugs });

      if (res[lessonView].length === 0) {
        throw new TRPCError({
          message: 'No lessons found',
          code: 'NOT_FOUND',
        });
      }

      // all of this code is to satisfy TS.
      // otherwise it would just be `return res[lessonView];`
      return res[lessonView].reduce((acc, { lessonSlug, lessonTitle }) => {
        if (!lessonSlug || !lessonTitle) {
          return acc;
        }

        acc.push({
          lessonSlug,
          lessonTitle,
        });
        return acc;
      }, [] as { lessonSlug: string; lessonTitle: string }[]);
    }),
});
