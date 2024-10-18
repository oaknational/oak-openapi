import { TRPCError } from '@trpc/server';
import { gql } from 'graphql-request';
import { z } from 'zod';

import { protectedProcedure } from '~/lib/protect';
import { router } from '../trpc';
import {
  Download,
  DownloadView,
  LessonView,
  SignedAsset,
  UnitVariantLessonsView,
  downloadView,
  getClient,
  lessonView,
  unitVariantLessonsView,
} from '../owaClient';
import { keyStageSlugs, subjectSlugs } from '../keyStageAndSubjects';
import { baseUrl } from '../baseUrl';

export const downloadTypeEnum = z.enum(
  [
    'slidedeck',
    'exitQuiz',
    'exitQuizAnswers',
    'starterQuiz', // note: graphql key is (currently) starter_quiz
    'starterQuizAnswers',
    'supplementaryResource',
    'video',
    'worksheet',
    'worksheetAnswers',
  ],
  {
    description:
      'Use the this type and the lesson slug in conjunction to get a signed download URL to the asset type from the /api/download endpoint',
  }
);

const assetType = z.object({
  type: downloadTypeEnum,
  url: z.string(),
});

export const lessonAssetsType = z.object({
  attribution: z.array(z.string()).optional(),
  assets: z.array(assetType).optional(),
});

export const lessonsAssetsType = z.array(
  z.object({
    lessonSlug: z.string(),
    lessonTitle: z.string(),
    attribution: z.array(z.string()).optional(),
    assets: z.array(assetType),
  })
);

export type DownloadTypeEnum = z.infer<typeof downloadTypeEnum>;

const graphqlClient = getClient();

function assetDownloads(
  lessonSlug: string,
  downloads: Download[],
  filter?: DownloadTypeEnum
) {
  const allTypes: DownloadTypeEnum[] = downloadTypeEnum.options;

  return downloads
    .map((d) => {
      if (filter) {
        const item = filter in d ? d[filter] : null;

        if (!item) return null;

        return {
          type: item.type,
          url: `${baseUrl}/download/${lessonSlug}/type/${item.type}`,
        };
      }

      return allTypes.map((type) => {
        if (type === 'video') {
          return {
            type,
            url: `${baseUrl}/download/${lessonSlug}/type/${type}`,
          };
        }

        if ((d[type] as SignedAsset).bucket_name !== null) {
          return {
            type,
            url: `${baseUrl}/download/${lessonSlug}/type/${type}`,
          };
        }
      });
    })
    .flat()
    .filter(Boolean);
}

export const getAssets = router({
  getUnitAssets: protectedProcedure
    .meta({
      openapi: {
        method: 'GET',
        tags: ['assets'],
        path: '/key-stages/{keyStage}/subject/{subject}/assets',
        description:
          'This endpoint returns signed download URLs and types for the assets currently available on Oak for a given key stage and subject, optionally filtered by type and unit, grouped by lesson',
        example: {
          response: [
            {
              lessonSlug: 'nouns-singular-and-plural',
              lessonTitle: 'Nouns: singular and plural',
              attribution: [
                'Copyright XYZ Authors',
                'Creative Commons Attribution Example 4.0',
              ],
              assets: [
                {
                  type: 'slidedeck',
                  url: `${baseUrl}/api/v0/download/nouns-singular-and-plural/type/slidedeck'`,
                },
                {
                  type: 'exitQuiz',
                  url: `${baseUrl}/api/v0/download/nouns-singular-and-plural/type/exitQuiz'`,
                },
                {
                  type: 'exitQuizAnswers',
                  url: `${baseUrl}/api/v0/download/nouns-singular-and-plural/type/exitQuizAnswers'`,
                },
                {
                  type: 'starterQuiz',
                  url: `${baseUrl}/api/v0/download/nouns-singular-and-plural/type/starterQuiz'`,
                },
                {
                  type: 'starterQuizAnswers',
                  url: `${baseUrl}/api/v0/download/nouns-singular-and-plural/type/starterQuizAnswers'`,
                },
                {
                  type: 'video',
                  url: `${baseUrl}/api/v0/download/nouns-singular-and-plural/type/video'`,
                },
                {
                  type: 'worksheet',
                  url: `${baseUrl}/api/v0/download/nouns-singular-and-plural/type/worksheet'`,
                },
                {
                  type: 'worksheetAnswers',
                  url: `${baseUrl}/api/v0/download/nouns-singular-and-plural/type/worksheetAnswers'`,
                },
              ],
            },
          ],
          request: {
            keyStage: 'ks1',
            subject: 'english',
            unit: 'word-class',
          },
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
            "Subject slug to search by, e.g. 'science' - note that casing is important here (always lowercase)",
        }),
        type: downloadTypeEnum.optional(),
        unit: z
          .string({
            description: 'Optional unit slug to additionally filter by',
          })
          .optional(),
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
    .output(z.any()) //lessonsAssetsType
    .query(async ({ input, ctx }) => {
      const keyStage = input.keyStage;
      const subject = input.subject;
      const unit = input.unit || null;
      const typeFilter = input.type;

      const offset = input.offset;
      const limit = input.limit;

      let unitFilter = '';
      let unitArg = '';

      if (unit) {
        unitFilter = ', _and: { unit_slug: { _eq: $unit } }';
        unitArg = ', $unit: String';
      }

      // step 1: find the slugs that match
      const lessonQuery = gql`
        query GetLessons($_contains: jsonb, $limit: Int!, $offset: Int! ${unitArg}) {
          ${unitVariantLessonsView} (
            where: {
              is_legacy: { _eq: false }
              _and: {
                programme_fields: { _contains: $_contains }
                ${unitFilter}
              }
            }
            limit: $limit
            offset: $offset
          ) {
            lesson_slug
          }
        }
      `;

      type LessonQueryVariables = {
        _contains: {
          keystage_slug: string;
          subject_slug: string;
        };
        limit: number;
        offset: number;
        unit?: string;
      };

      const lessonQueryVariables = {
        _contains: {
          keystage_slug: keyStage,
          subject_slug: subject,
        },
        limit,
        offset,
      } as LessonQueryVariables;

      if (unit) {
        lessonQueryVariables.unit = unit;
      }

      const lessonViewResult: UnitVariantLessonsView =
        await graphqlClient.request(lessonQuery, lessonQueryVariables);

      const res = lessonViewResult[unitVariantLessonsView];

      let next = null;
      if (res.length === limit) {
        next = `${baseUrl}${ctx.req.url}?offset=${
          offset + limit
        }&limit=${limit}`;
        if (unit) {
          next += `&unit=${unit}`;
        }
        ctx.res.setHeader('link', `<${next}>; rel="next"`);
      }

      // step 2: get the assets for each lesson
      const downloadsQuery = gql`
        query GetDownloads($lessonSlugs: [String!]!) {
          ${downloadView}(
            where: {
              lessonSlug: { _in: $lessonSlugs }
            }
          ) {
            lessonSlug
            lessonTitle
            exitQuiz
            exitQuizAnswers
            lessonSlug
            lessonTitle
            slidedeck
            starterQuizAnswers
            starterQuiz: starter_quiz
            supplementaryResource
            video: videos
            worksheet
            worksheetAnswers
          }
        }
      `;

      const lessonSlugs = res.map((l) => l.lesson_slug);

      const downloadsViewResult: DownloadView = await graphqlClient.request(
        downloadsQuery,
        {
          lessonSlugs,
        }
      );

      const downloads = downloadsViewResult[downloadView];

      if (!downloads || downloads.length === 0 || !downloads[0]) {
        throw new TRPCError({
          message: 'No lessons found',
          code: 'NOT_FOUND',
        });
      }

      const tpcQuery = gql`
        query GetTPC($lessonSlugs: [String!]!) {
          ${lessonView}(
            where: {
              lessonSlug: { _in: $lessonSlugs }
            }
          ) {
            lessonSlug
            tpcWorks
            tpcMedia
          }
        }
      `;

      const tpcViewResult: LessonView = await graphqlClient.request(tpcQuery, {
        lessonSlugs,
      });

      const tpc = tpcViewResult[lessonView];

      const result = downloads.map((d) => {
        const lessonSlug = d.lessonSlug;

        const attribution = tpc.find((l) => l.lessonSlug === lessonSlug);
        let mappedAttribution: (string | undefined)[] = [];

        if (attribution) {
          mappedAttribution = [
            ...(attribution.tpcWorks?.map((_) => _.attribution) || []),
            ...(attribution.tpcMedia?.map((_) => _.attribution) || []),
          ].filter(Boolean);
        }

        return {
          lessonSlug,
          lessonTitle: d.lessonTitle,
          attribution: mappedAttribution.length ? mappedAttribution : undefined,
          assets: assetDownloads(lessonSlug, [d], typeFilter),
        };
      });

      return result;
    }),
  getLessonAssets: protectedProcedure
    .meta({
      openapi: {
        method: 'GET',
        tags: ['assets', 'lessons'],
        path: '/lessons/{lesson}/assets',
        description:
          'This endpoint returns signed download URLS and types for the assets currently available on Oak for a given lesson',
        example: {
          request: {
            lesson: 'nouns-singular-and-plural',
          },
          response: {
            attribution: [
              'Copyright XYZ Authors',
              'Creative Commons Attribution Example 4.0',
            ],
            assets: [
              {
                type: 'slidedeck',
                url: `${baseUrl}/api/v0/download/nouns-singular-and-plural/type/slidedeck'`,
              },
              {
                type: 'exitQuiz',
                url: `${baseUrl}/api/v0/download/nouns-singular-and-plural/type/exitQuiz'`,
              },
              {
                type: 'exitQuizAnswers',
                url: `${baseUrl}/api/v0/download/nouns-singular-and-plural/type/exitQuizAnswers'`,
              },
              {
                type: 'starterQuiz',
                url: `${baseUrl}/api/v0/download/nouns-singular-and-plural/type/starterQuiz'`,
              },
              {
                type: 'starterQuizAnswers',
                url: `${baseUrl}/api/v0/download/nouns-singular-and-plural/type/starterQuizAnswers'`,
              },
              {
                type: 'video',
                url: `${baseUrl}/api/v0/download/nouns-singular-and-plural/type/video'`,
              },
              {
                type: 'worksheet',
                url: `${baseUrl}/api/v0/download/nouns-singular-and-plural/type/worksheet'`,
              },
              {
                type: 'worksheetAnswers',
                url: `${baseUrl}/api/v0/download/nouns-singular-and-plural/type/worksheetAnswers'`,
              },
            ],
          },
        },
      },
    })
    .input(
      z.object({
        lesson: z.string({
          description: 'The lesson slug',
        }),
        type: downloadTypeEnum.optional(),
      })
    )
    .output(z.any()) //lessonAssetsType
    .query(async ({ input }) => {
      const { lesson: lessonSlug, type } = input;

      const queryDownloads = gql`
        query GetDownloads($lessonSlug: String!) {
          ${downloadView}(
            where: {
              lessonSlug: { _eq: $lessonSlug }
            }
          ) {
            lessonSlug
            lessonTitle
            exitQuiz
            exitQuizAnswers
            lessonSlug
            lessonTitle
            slidedeck
            starterQuizAnswers
            starterQuiz: starter_quiz
            supplementaryResource
            video: videos
            worksheet
            worksheetAnswers
          }
        }
      `;

      const variables = {
        lessonSlug,
      };

      const downloadsViewResult: DownloadView = await graphqlClient.request(
        queryDownloads,
        variables
      );

      const res = downloadsViewResult[downloadView];

      if (!res || res.length === 0 || !res[0]) {
        throw new TRPCError({
          message: 'No lessons found',
          code: 'NOT_FOUND',
        });
      }

      const tpcQuery = gql`
        query GetTPC($lessonSlug: String!) {
          ${lessonView}(
            where: {
              lessonSlug: { _eq: $lessonSlug }
            }
          ) {
            lessonSlug
            tpcWorks
            tpcMedia
          }
        }
      `;

      const tpcViewResult: LessonView = await graphqlClient.request(tpcQuery, {
        lessonSlug,
      });

      const attribution = tpcViewResult[lessonView][0];

      let mappedAttribution: (string | undefined)[] = [];

      if (attribution) {
        mappedAttribution = [
          ...(attribution.tpcWorks?.map((_) => _.attribution) || []),
          ...(attribution.tpcMedia?.map((_) => _.attribution) || []),
        ].filter(Boolean);
      }

      return {
        attribution: mappedAttribution.length ? mappedAttribution : undefined,
        assets: assetDownloads(lessonSlug, res, type),
      };
    }),
});
