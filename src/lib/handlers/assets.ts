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
  Video,
  UnitVariantLessonsView,
  downloadView,
  getClient,
  lessonView,
  unitVariantLessonsView,
} from '../owaClient';
import { keyStageSlugs, subjectSlugs } from '../keyStageAndSubjects';
import { assetBaseVideoUrl, baseUrl } from '../baseUrl';

import { Storage } from '@google-cloud/storage';
let storage;

// Check if GOOGLE_APPLICATION_CREDENTIALS_JSON is set
if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
  const credentials = JSON.parse(
    process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON,
  );
  // Initialize storage client with credentials
  storage = new Storage({ credentials });
} else {
  // Use default method, which relies on GOOGLE_APPLICATION_CREDENTIALS path
  storage = new Storage();
}

import {
  checkLessonAllowedAsset,
  checkQueryAllowedAssets,
  modifySubject,
} from '~/lib/queryGate';

export const downloadTypeEnum = z.enum(
  [
    'slideDeck',
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
      'Use the this type and the lesson slug in conjunction to get a signed download URL to the asset type from the /api/lessons/{slug}/asset/{type} endpoint',
  },
);

const assetType = z.object({
  type: downloadTypeEnum,
  label: z.string(),
  url: z.string(),
});

export const lessonAssetsType = z.object({
  attribution: z.array(z.string()).optional(),
  assets: z.array(assetType).optional(),
});

type LessonAssetsType = z.infer<typeof lessonAssetsType>;

export const lessonsAssetsType = z.array(
  z.object({
    lessonSlug: z.string(),
    lessonTitle: z.string(),
    attribution: z.array(z.string()).optional(),
    assets: z.array(assetType),
  }),
);

export type DownloadTypeEnum = z.infer<typeof downloadTypeEnum>;

const graphqlClient = getClient();

async function assetsForLesson(lessonSlug: string) {
  // FIXME - gate with a query to check if the lesson is in maths
  const supported = await checkLessonAllowedAsset(graphqlClient, lessonSlug);

  if (!supported) {
    throw new TRPCError({
      message: 'Lesson not available',
      code: 'NOT_FOUND',
    });
  }

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
        slideDeck:slidedeck
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

  const lessonDetailViewResult: DownloadView = await graphqlClient.request(
    queryDownloads,
    variables,
  );

  const res = lessonDetailViewResult[downloadView];

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
    assets: res[0],
  };
}

function assetDownloads(
  lessonSlug: string,
  download: Download,
  filter?: DownloadTypeEnum,
) {
  const assetUrls = [];

  if (download.slideDeck && download.slideDeck.bucket_path) {
    assetUrls.push({
      label: download.slideDeck.label,
      type: downloadTypeEnum.enum.slideDeck,
      url: `${baseUrl}/lessons/${lessonSlug}/assets/slideDeck`,
    });
  }

  if (download.worksheet && download.worksheet.bucket_path) {
    assetUrls.push({
      label: download.worksheet.label,
      type: downloadTypeEnum.enum.worksheet,
      url: `${baseUrl}/lessons/${lessonSlug}/assets/worksheet`,
    });
  }

  if (download.worksheetAnswers && download.worksheetAnswers.bucket_path) {
    assetUrls.push({
      label: download.worksheetAnswers.label,
      type: downloadTypeEnum.enum.worksheetAnswers,
      url: `${baseUrl}/lessons/${lessonSlug}/assets/worksheetAnswers`,
    });
  }

  if (
    download.supplementaryResource &&
    download.supplementaryResource.bucket_path
  ) {
    assetUrls.push({
      label: download.supplementaryResource.label,
      type: downloadTypeEnum.enum.supplementaryResource,
      url: `${baseUrl}/lessons/${lessonSlug}/assets/supplementaryResource`,
    });
  }

  if (download.starterQuiz && download.starterQuiz.bucket_path) {
    assetUrls.push({
      label: download.starterQuiz.label,
      type: downloadTypeEnum.enum.starterQuiz,
      url: `${baseUrl}/lessons/${lessonSlug}/assets/starterQuiz`,
    });
  }

  if (download.starterQuizAnswers && download.starterQuizAnswers.bucket_path) {
    assetUrls.push({
      label: download.starterQuizAnswers.label,
      type: downloadTypeEnum.enum.starterQuizAnswers,
      url: `${baseUrl}/lessons/${lessonSlug}/assets/starterQuizAnswers`,
    });
  }

  if (download.exitQuiz && download.exitQuiz.bucket_path) {
    assetUrls.push({
      label: download.exitQuiz.label,
      type: downloadTypeEnum.enum.exitQuiz,
      url: `${baseUrl}/lessons/${lessonSlug}/assets/exitQuiz`,
    });
  }

  if (download.exitQuizAnswers && download.exitQuizAnswers.bucket_path) {
    assetUrls.push({
      label: download.exitQuizAnswers.label,
      type: downloadTypeEnum.enum.exitQuizAnswers,
      url: `${baseUrl}/lessons/${lessonSlug}/assets/exitQuizAnswers`,
    });
  }

  if (download.video && (download.video.download || download.video.stream)) {
    assetUrls.push({
      label: download.video.label,
      type: downloadTypeEnum.enum.video,
      url: `${baseUrl}/lessons/${lessonSlug}/assets/video`,
    });
  }

  return assetUrls.filter((asset) => !filter || asset.type === filter);
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
              lessonSlug: 'using-numerals',
              lessonTitle: 'Using numerals',
              assets: [
                {
                  label: 'Worksheet',
                  type: 'worksheet',
                  url: `${baseUrl}/lessons/using-numerals/assets/worksheet`,
                },
                {
                  label: 'Worksheet Answers',
                  type: 'worksheetAnswers',
                  url: `${baseUrl}/lessons/using-numerals/assets/worksheetAnswers`,
                },
                {
                  label: 'Video',
                  type: 'video',
                  url: `${baseUrl}/lessons/using-numerals/assets/video`,
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
      }),
    )
    .output(lessonsAssetsType)
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

      if (unit || subject) {
        const supported = checkQueryAllowedAssets(subject, unit || '');

        if (!supported) {
          throw new TRPCError({
            message: 'Lesson assets not available for this query',
            code: 'NOT_FOUND',
          });
        }
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
          subject_slug: modifySubject(subject),
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
        },
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
        let mappedAttribution: string[] = [];

        if (attribution) {
          mappedAttribution = [
            ...(attribution.tpcWorks?.map((_) => _.attribution) || []),
            ...(attribution.tpcMedia?.map((_) => _.attribution) || []),
          ].filter((string) => string !== undefined);
        }

        return {
          lessonSlug,
          lessonTitle: d.lessonTitle,
          attribution: mappedAttribution.length ? mappedAttribution : undefined,
          assets: assetDownloads(lessonSlug, d, typeFilter),
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
            lesson: 'child-workers-in-the-victorian-era',
          },
          response: {
            attribution: [
              'Copyright XYZ Authors',
              'Creative Commons Attribution Example 4.0',
            ],
            assets: [
              {
                label: 'Worksheet',
                type: 'worksheet',
                url: `${baseUrl}/lessons/using-numerals/assets/worksheet`,
              },
              {
                label: 'Worksheet Answers',
                type: 'worksheetAnswers',
                url: `${baseUrl}/lessons/using-numerals/assets/worksheetAnswers`,
              },
              {
                label: 'Video',
                type: 'video',
                url: `${baseUrl}/lessons/using-numerals/assets/video`,
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
      }),
    )
    .output(lessonAssetsType)
    .query(async ({ input }) => {
      const { lesson: lessonSlug, type } = input;

      const { assets, attribution } = await assetsForLesson(lessonSlug);

      return {
        attribution,
        assets: assetDownloads(lessonSlug, assets, type),
      } as LessonAssetsType;
    }),
  getLessonAsset: protectedProcedure
    .meta({
      openapi: {
        method: 'GET',
        tags: ['assets', 'lessons'],
        path: '/lessons/{lesson}/assets/{type}',
        description:
          'This endpoint will stream the downloadable asset for the given lesson and type',
        contentTypes: ['application/octet-stream'],
        example: {
          request: {
            lesson: 'child-workers-in-the-victorian-era',
            type: 'slideDeck',
          },
          // I don't like this, but there's no way in the library to say
          // "this is a stream of bytes"
          response: { 200: 'application/octet-stream' },
        },
      },
    })
    .input(
      z.object({
        lesson: z.string({
          description: 'The lesson slug',
        }),
        type: downloadTypeEnum,
      }),
    )
    .output(z.undefined()) // no output, but file is streamed to the request
    .query(async ({ input, ctx }) => {
      const { lesson, type } = input;

      const { assets } = await assetsForLesson(lesson);

      const asset = assets[type];

      if (type !== 'video') {
        const { bucket_path, bucket_name } = asset as SignedAsset;

        const ext = bucket_path.split('/').pop()?.split('.').pop();
        const filename = `${lesson}_${type.toLocaleLowerCase()}.${ext}`;

        ctx.res.setHeader('Content-Type', 'application/octet-stream');
        ctx.res.setHeader(
          'Content-Disposition',
          `attachment; filename="${filename}"`,
        );

        return new Promise((resolve, reject) => {
          storage
            .bucket(bucket_name)
            .file(bucket_path)
            .createReadStream()
            .on('error', (err) => reject(err))
            .on('end', () => resolve(undefined))
            .pipe(ctx.res); // Pipe the stream to the HTTP response
        });
      } else {
        const { stream, download } = asset as Video;
        const response = await fetch(download || stream);

        const url = new URL(download || stream);
        const ext = url.pathname.split('.').pop();

        if (ext === 'm3u8') {
          // redirect to the video stream
          url.hostname = new URL(assetBaseVideoUrl).hostname;
          ctx.res.setHeader('Location', url.toString());
          ctx.res.statusCode = 302;
          return undefined;
        }

        const filename = `${lesson}_${type.toLocaleLowerCase()}.${ext}`;

        if (!response.ok) {
          throw new Error(
            `Failed to fetch: ${response.status} ${response.statusText}`,
          );
        }

        // Set headers for streaming the file to the client
        ctx.res.setHeader(
          'Content-Type',
          response.headers.get('content-type') || 'application/octet-stream',
        );
        ctx.res.setHeader(
          'Content-Disposition',
          `attachment; filename="${filename}"`,
        );

        if (response.body === null) {
          throw new TRPCError({
            message: 'Video could not be streamed',
            code: 'INTERNAL_SERVER_ERROR',
          });
        }

        // Stream the response body to the client's response
        const reader = response.body.getReader();
        const writer = ctx.res;

        const pump = async () => {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            writer.write(value);
          }
          writer.end(); // End the response stream
        };

        await pump();

        return undefined; // No JSON response
      }
    }),
});
