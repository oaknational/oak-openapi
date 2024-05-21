import groupBy from 'object.groupby';
import toSorted from 'array.prototype.tosorted';
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

toSorted.shim();
groupBy.shim();

const lessonSearchResult = z.object({
  lessonSlug: z.string(),
  lessonTitle: z.string(),
  similarity: z.number(),
  units: z.array(
    z.object({
      unitSlug: z.string(),
      unitTitle: z.string(),
      examBoardTitle: z.string().or(z.null()),
      keyStageSlug: z.string(),
      subjectSlug: z.string(),
    })
  ),
});

type LessonSearchResult = z.infer<typeof lessonSearchResult>;

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
  contentGuidance: z
    .array(
      z.object({
        contentGuidanceArea: z.string(),
        supervisionlevel_id: z.number(),
        contentGuidanceLabel: z.string(),
        contentGuidanceDescription: z.string(),
      })
    )
    .or(z.null()),
  supervisionLevel: z.string().or(z.null()),
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
        description: 'This endpoint returns a summary for a given lesson',
        example: {
          request: {
            lesson: 'joining-using-and',
          },
          response: {
            lessonTitle: "Joining using 'and'",
            unitSlug: 'simple-sentences',
            unitTitle: 'Simple sentences',
            subjectSlug: 'english',
            subjectTitle: 'English',
            keyStageSlug: 'ks1',
            keyStageTitle: 'Key Stage 1',
            lessonKeywords: [
              {
                keyword: 'joining word',
                description: 'a word that joins words or ideas',
              },
              {
                keyword: 'build on',
                description: 'add to',
              },
              {
                keyword: 'related',
                description: 'linked to',
              },
            ],
            keyLearningPoints: [
              {
                keyLearningPoint: 'And is a type of joining word.',
              },
              {
                keyLearningPoint:
                  'A joining word can join two simple sentences.',
              },
              {
                keyLearningPoint:
                  'Each simple sentence is about one idea and makes complete sense.',
              },
              {
                keyLearningPoint:
                  'The second idea builds on to the first idea if ‘and’ is used to join them.',
              },
              {
                keyLearningPoint:
                  'Grammatically accurate sentences start with capital letters and most often end with full stops.',
              },
            ],
            misconceptionsAndCommonMistakes: [
              {
                misconception:
                  'Pupils may struggle to link related ideas together.',
                response:
                  'Give some non-examples to show what it sounds like when two ideas are unrelated e.g. Dad baked bread and she missed her sister.',
              },
            ],
            pupilLessonOutcome: "I can join two simple sentences with 'and'.",
            teacherTips: [
              {
                teacherTip:
                  'In Learning Cycle 1, make sure pupils are given plenty of opportunities to say sentences orally and hear that they make complete sense.',
              },
            ],
            contentGuidance: null,
            supervisionLevel: null,
            hasDownloadableResources: true,
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
        description:
          'This endpoint returns lessons that are similar to the search criteria, including a similarity score, and details of the unit that it is in',
        example: {
          request: {
            q: 'chratchet',
            subject: 'english',
          },
          response: [
            {
              lessonSlug: 'gothic-characters-c8tp4d',
              lessonTitle: 'Gothic characters',
              similarity: 0.07692308,
              units: [
                {
                  unitSlug: 'gothic-literature-8196',
                  unitTitle: 'Gothic Literature',
                  examBoardTitle: null,
                  keyStageSlug: 'ks3',
                  subjectSlug: 'english',
                },
              ],
            },
            {
              lessonSlug: 'columbus-in-chains-c8ukct',
              lessonTitle: 'Columbus in Chains',
              similarity: 0.07692308,
              units: [
                {
                  unitSlug: 'annie-john-by-jamaica-kincaid-c5ab',
                  unitTitle: 'Annie John by Jamaica Kincaid',
                  examBoardTitle: null,
                  keyStageSlug: 'ks3',
                  subjectSlug: 'english',
                },
              ],
            },
          ],
        },
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
            description: 'Optional unit slug to additionally filter by',
          })
          .optional(),
      })
    )
    .output(z.array(lessonSearchResult))
    .query(async ({ input }) => {
      // store q from input.q and sanitize for use as an sql query:
      const q = input.q.replace(/'/g, "''");
      const unit = input.unit || null;
      const subject = input.subject || null;
      const keyStage = input.keyStage || null;

      let sqlWhere = '1=1';

      if (unit) {
        sqlWhere += ` AND "unitSlug" = '${unit.replace(/'/g, "''")}'`;
      }

      if (subject) {
        sqlWhere += ` AND "subjectSlug" = '${subject.replace(/'/g, "''")}'`;
      }

      if (keyStage) {
        sqlWhere += ` AND "keyStageSlug" = '${keyStage.replace(/'/g, "''")}'`;
      }

      const sql = `SELECT * from (SELECT "lessonSlug", SIMILARITY("lessonTitle", '${q}') FROM ${lessonViewTable} WHERE ${sqlWhere} group by "lessonSlug", "similarity") as a order by a.similarity desc limit 20`;

      const result = await querySQL(sql).then((res) => res.json());

      const slugs = result.result.slice(1).map(([slug]: [string]) => slug);
      const similarity = result.result
        .slice(1)
        .reduce((acc: { [x: string]: number }, [slug, _]: [string, string]) => {
          acc[slug] = parseFloat(_);
          return acc;
        }, {} as Record<string, number>);

      const client = getClient();

      let where = `lessonSlug: { _in: $slugs }`;
      const variables: Record<string, string | number> = { slugs };

      if (unit) {
        where += `, _and: { unitSlug: { _eq: $unit } }`;
        variables.unit = unit;
      }

      if (subject) {
        where += `, _and: { subjectSlug: { _eq: $subject } }`;
        variables.subject = subject;
      }

      if (keyStage) {
        where += `, _and: { keyStageSlug: { _eq: $keyStage } }`;
        variables.keyStage = keyStage;
      }

      const query = gql`
        query ($slugs: [String!]!, $unit: String, $subject: String, $keyStage: String) {
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
        Object.groupBy(res[lessonView], ({ lessonSlug }) => lessonSlug)
      );

      console.log({ groupedByLesson });

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
        }, [] as LessonSearchResult[])
        .toSorted((a, b) => b.similarity - a.similarity);
    }),
});
