import { TRPCError } from '@trpc/server';
import { gql } from 'graphql-request';
import { z } from 'zod';

import { protectedProcedure } from '~/lib/auth';
import { router } from '../trpc';
import { getClient } from '../owaClient';
import { keyStageSlugs, subjectSlugs } from '../keyStageAndSubjects';
import { baseUrl } from '../baseUrl';

export const downloadView = 'published_mv_openapi_downloads_1_0_0';
export const unitVariantLessonsView =
  'published_mv_synthetic_unitvariant_lessons_by_year_6_0_0';

type UnitVariantLessonsView = {
  published_mv_synthetic_unitvariant_lessons_by_year_6_0_0: UnitVariantLesson[];
};

type UnitVariantLesson = {
  lesson_slug: string;
};

export type DownloadView = {
  published_mv_openapi_downloads_1_0_0: Download[];
};

export interface Download {
  exitQuiz: SignedAsset;
  exitQuizAnswers: SignedAsset;
  lessonSlug: string;
  lessonTitle: string;
  slidedeck: SignedAsset;
  starterQuizAnswers: SignedAsset;
  starterQuiz: SignedAsset; // note: this is starter_quiz in the graphql response
  supplementaryResource: SignedAsset;
  video: Video;
  worksheet: SignedAsset;
  worksheetAnswers: SignedAsset;
}

interface SignedAsset {
  ext: string;
  type: string;
  label: string;
  bucket_name: string;
  bucket_path: string;
}

interface Video {
  ext: string;
  type: string;
  label: string;
  stream: string;
  download: any;
}

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
      'Use the this type and the lesson slug in conjunction to get a signed download URL to the asset type from the /api/download endpoint.',
  }
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
          'The downloadable assets for a lessons in a specific key stage and subject, including: slidedecks, worksheets, worksheet answers and videos.',
        example: {
          response: [
            {
              lessonSlug: 'nouns-singular-and-plural',
              lessonTitle: 'Nouns: singular and plural',
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
            description: 'Optional unit slug to additionally filter by.',
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
    .output(z.any())
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

      const lessonQueryVariables = {
        _contains: {
          keystage_slug: keyStage,
          subject_slug: subject,
        },
        limit,
        offset,
        unit,
      };

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

      const result = downloads.map((d) => {
        const lessonSlug = d.lessonSlug;

        return {
          lessonSlug,
          lessonTitle: d.lessonTitle,
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
          'The downloadable assets for a specific lesson, including: slidedecks, worksheets, worksheet answers and videos.',
        example: {
          request: {
            lesson: 'nouns-singular-and-plural',
          },
          response: [
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
    })
    .input(
      z.object({
        lesson: z.string({
          description: 'The lesson slug',
        }),
        type: downloadTypeEnum.optional(),
      })
    )
    .output(z.array(z.any()))
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

      return assetDownloads(lessonSlug, res, type);
    }),
});
