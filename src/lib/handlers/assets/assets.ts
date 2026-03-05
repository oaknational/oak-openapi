import { TRPCError } from '@trpc/server';
import { gql } from 'graphql-request';

import { protectedProcedure } from '@/lib/protect';
import { router } from '@/lib/trpc';
import type {
  Download,
  DownloadView,
  LessonView,
  UnitVariantLessonsView,
  SequenceView,
} from '@/lib/owaClient';
import {
  downloadView,
  getClient,
  lessonView,
  unitVariantLessonsView,
  sequenceView,
  sequenceViewWhereInput,
} from '@/lib/owaClient';

import { baseUrl } from '../../baseUrl';

import {
  checkLessonAllowedAsset,
  isLessonSupported,
  isSequenceSubjectBlocked,
  isSubjectSupported,
  isUnitSupported,
} from '@/lib/queryGate';
import { sequenceWhere } from '../sequences/sequences';
import { parseSubjectPhaseSlug } from '../../sequenceSlugParser';
import { downloadTypeEnum } from './types';
import type { DownloadTypeEnum, LessonAssetsType } from './types';
import { getAttribution } from './helpers';

import {
  subjectAssetsRequestOpenAPISchema,
  subjectAssetsResponseOpenAPISchema,
  sequenceAssetsRequestOpenAPISchema,
  sequenceAssetsResponseOpenAPISchema,
  lessonAssetRequestOpenAPISchema,
  lessonAssetResponseOpenAPISchema,
  lessonAssetsRequestOpenAPISchema,
  lessonAssetsResponseOpenAPISchema,
} from '@/lib/zod-openapi/generated/assets';

import placeholderVideoLessons from '@/lib/queryGateData/placeholderVideoLessons.json' with { type: 'json' };

const graphqlClient = getClient();

type Attribution = (string | undefined)[] | undefined;

interface AssetsForLesson {
  assets: Download;
  attribution: Attribution;
}

export async function assetsForLesson(
  lessonSlug: string,
): Promise<AssetsForLesson> {
  const supported = await checkLessonAllowedAsset({
    client: graphqlClient,
    lessonSlug,
  });

  if (supported.isBlocked()) {
    throw new TRPCError({
      message: `Lesson not available: "${lessonSlug}"`,
      code: 'BAD_REQUEST',
      cause: supported.reason,
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
        slideDeck: slidedeck
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

  let mappedAttribution: Attribution = [];

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

interface AssetDownload {
  label: string;
  type: DownloadTypeEnum;
  url: string;
}

function assetDownloads(
  lessonSlug: string,
  download: Download,
  filter?: DownloadTypeEnum,
): AssetDownload[] {
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
    if (!placeholderVideoLessons.includes(lessonSlug)) {
      assetUrls.push({
        label: download.video.label,
        type: downloadTypeEnum.enum.video,
        url: `${baseUrl}/lessons/${lessonSlug}/assets/video`,
      });
    }
  }

  const result = assetUrls.filter((asset) => !filter || asset.type === filter);

  return result;
}

export const getAssets = router({
  getSequenceAssets: protectedProcedure
    .meta({
      openapi: {
        method: 'GET',
        tags: ['assets', 'sequences', 'unit-and-curriculum-data'],
        path: '/sequences/{sequence}/assets',
        errorResponses: [],
        summary: 'Assets within a sequence',
        description: `This endpoint returns all assets for a given sequence, and the download endpoints for each. The assets are grouped by lesson.
This endpoint contains licence information for any third-party content contained in the lesson’s downloadable resources. Third-party content is exempt from the open-government license, and users will need to consider whether their use is covered by the stated licence, or if they need to procure their own agreement.`,
      },
    })
    .input(sequenceAssetsRequestOpenAPISchema)
    .output(sequenceAssetsResponseOpenAPISchema)
    .query(async ({ input }) => {
      const { sequence, type, year } = input;
      const client = getClient();

      const { subjectSlug } = parseSubjectPhaseSlug(input.sequence);
      const gateTest = isSequenceSubjectBlocked(subjectSlug);

      if (gateTest.isBlocked()) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `The subject in "${sequence}" is not currently available`,
          cause: gateTest.reason,
        });
      }

      const where = sequenceWhere(sequence, year ? year.toString() : undefined);

      const query = gql`
      query ($where: ${sequenceViewWhereInput}!) {
        ${sequenceView}(
          where: $where
          order_by: { order: asc }
        ) {
          slug
          lessons
        }
      }`;

      const res: SequenceView = await client.request(query, { where });
      const rawData = res[sequenceView];

      const lessonSlugs = new Set(
        rawData
          .map((unit) => {
            return unit.lessons.map((lesson) => lesson.slug);
          })
          .flat(),
      );

      const lessonToUnitLookup = rawData.reduce(
        (acc, unit) => {
          unit.lessons.forEach((lesson) => {
            acc[lesson.slug] = unit.slug;
          });
          return acc;
        },
        {} as Record<string, string>,
      );

      const isLessonAllowed = async (slug: string): Promise<boolean> => {
        const supported = await checkLessonAllowedAsset({
          lessonSlug: slug,
          subjectSlug,
          unitSlug: lessonToUnitLookup[slug],
        });

        return supported.isAllowed();
      };

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
            slideDeck: slidedeck
            starterQuizAnswers
            starterQuiz: starter_quiz
            supplementaryResource
            video: videos
            worksheet
            worksheetAnswers
          }
        }`;

      const downloadsViewResult: DownloadView = await graphqlClient.request(
        downloadsQuery,
        {
          lessonSlugs: Array.from(lessonSlugs),
        },
      );

      const downloads = downloadsViewResult[downloadView];

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
        lessonSlugs: downloads.map((d) => d.lessonSlug),
      });

      const tpc = tpcViewResult[lessonView];

      // filter the downloads based on whether assets are allowed
      const downloadsAllowed = await Promise.all(
        downloads.map(async (d) =>
          isLessonAllowed(d.lessonSlug).then((allowed) =>
            allowed ? d : false,
          ),
        ),
      );

      const result = downloadsAllowed
        .filter((_) => _ !== false)
        .map((d) => {
          const lessonSlug = d.lessonSlug;

          const attribution = tpc.find((l) => l.lessonSlug === lessonSlug);
          let mappedAttribution: string[] = [];

          if (attribution) {
            mappedAttribution = getAttribution(attribution);
          }

          return {
            lessonSlug,
            lessonTitle: d.lessonTitle,
            attribution: mappedAttribution.length
              ? mappedAttribution
              : undefined,
            assets: assetDownloads(lessonSlug, d, type),
          };
        });

      return result;
    }),
  // getUnitAssets: protectedProcedure
  //   .meta({
  //     openapi: {
  //       method: 'GET',
  //       tags: ['assets'],
  //       path: '/units/{unit}/assets',
  //       description:
  //         'This endpoint returns signed download URLs and types for the assets currently available on Oak for a given unit',
  //       example: {
  //         request: {
  //           sequence: 'perimeter-and-area',
  //         },
  //       },
  //     },
  //   })
  //   .input(z.object({ unit: z.string() }))
  //   .output(z.any()) // lessonsAssetsType
  //   .query(async ({ input }) => {
  //     const { unit } = input;
  //     return { unit };
  //   }),
  getSubjectAssets: protectedProcedure
    .meta({
      openapi: {
        method: 'GET',
        tags: ['assets'],
        errorResponses: [],
        summary: 'Assets',
        path: '/key-stages/{keyStage}/subject/{subject}/assets',
        description:
          'This endpoint returns signed download URLs and types for available assets for a given key stage and subject, grouped by lesson. You can also optionally filter by type and unit.',
      },
    })
    .input(subjectAssetsRequestOpenAPISchema)
    .output(subjectAssetsResponseOpenAPISchema)
    .query(async ({ input }) => {
      const keyStage = input.keyStage;
      const subject = input.subject;
      const unit = input.unit || null;
      const typeFilter = input.type;

      let unitFilter = '';
      let unitArg = '';

      if (unit) {
        unitFilter = ', _and: { unit_slug: { _eq: $unit } }';
        unitArg = ', $unit: String';
      }

      // step 1: find the slugs that match
      const lessonQuery = gql`
        query GetLessons($_contains: jsonb, ${unitArg}) {
          ${unitVariantLessonsView} (
            where: {
              is_legacy: { _eq: false }
              _and: {
                programme_fields: { _contains: $_contains }
                ${unitFilter}
              }
            }
          ) {
            unit_slug
            lesson_slug
          }
        }
      `;

      interface LessonQueryVariables {
        _contains: {
          keystage_slug: string;
          subject_slug: string;
        };
        unit?: string;
        [key: string]: unknown;
      }

      const lessonQueryVariables: LessonQueryVariables = {
        _contains: {
          keystage_slug: keyStage,
          subject_slug: subject,
        },
      };

      if (unit) {
        lessonQueryVariables.unit = unit;
      }

      const lessonViewResult: UnitVariantLessonsView =
        await graphqlClient.request(lessonQuery, lessonQueryVariables);

      const res = lessonViewResult[unitVariantLessonsView];

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
            slideDeck: slidedeck
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
      const lessonToUnitLookup = res.reduce(
        (acc, { lesson_slug, unit_slug }) => {
          acc[lesson_slug] = unit_slug;
          return acc;
        },
        {} as Record<string, string>,
      );

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

      const isLessonAllowed = (slug: string): boolean => {
        if (isSubjectSupported(subject).isAllowed()) {
          return true;
        }

        if (isUnitSupported(lessonToUnitLookup[slug]).isAllowed()) {
          return true;
        }

        if (isLessonSupported(slug).isAllowed()) {
          return true;
        }

        return false;
      };

      const result = downloads
        .filter(({ lessonSlug }) => isLessonAllowed(lessonSlug))
        .map((d) => {
          const lessonSlug = d.lessonSlug;

          const attribution = tpc.find((l) => l.lessonSlug === lessonSlug);
          let mappedAttribution: string[] = [];

          if (attribution) {
            mappedAttribution = getAttribution(attribution);
          }

          return {
            lessonSlug,
            lessonTitle: d.lessonTitle,
            attribution: mappedAttribution.length
              ? mappedAttribution
              : undefined,
            assets: assetDownloads(lessonSlug, d, typeFilter),
          };
        });

      return result;
    }),
  getLessonAssets: protectedProcedure
    .meta({
      openapi: {
        method: 'GET',
        tags: ['assets', 'lessons', 'lesson-data'],
        summary: 'Downloadable lesson assets',
        path: '/lessons/{lesson}/assets',
        errorResponses: [],
        description: `This endpoint returns the types of available assets for a given lesson, and the download endpoints for each.
        This endpoint contains licence information for any third-party content contained in the lesson’s downloadable resources. Third-party content is exempt from the open-government license, and users will need to consider whether their use is covered by the stated licence, or if they need to procure their own agreement.
          `,
      },
    })
    .input(lessonAssetsRequestOpenAPISchema)
    .output(lessonAssetsResponseOpenAPISchema)
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
        tags: ['assets', 'lessons', 'lesson-data'],
        path: '/lessons/{lesson}/assets/{type}',
        summary: 'Lesson asset by type',
        description:
          'This endpoint will stream the downloadable asset for the given lesson and type. \nThere is no response returned for this endpoint as it returns a content attachment.',
        contentTypes: ['application/octet-stream'],
        errorResponses: [],
      },
    })
    .input(lessonAssetRequestOpenAPISchema)
    .output(lessonAssetResponseOpenAPISchema) // no output, but file is streamed to the request
    .query(() => {
      // IMPORTANT - this endpoint specific returns a stream of the
      // file (video, slides, etc), but the actual execution isn't
      // done here, but in the handler at:
      // /src/app/api/v0/lessons/[lesson]/assets/[type]/route.ts
      //
      // this specific endpoint still exists to allow all the openapi
      // metadata to be generated correctly.
      return undefined;
    }),
});
