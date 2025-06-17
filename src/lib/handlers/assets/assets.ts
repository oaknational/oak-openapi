import { TRPCError } from '@trpc/server';
import { gql } from 'graphql-request';
import { z } from 'zod';

import { protectedProcedure } from '@/lib/protect';
import { router } from '../../trpc';
import {
  Download,
  DownloadView,
  LessonView,
  UnitVariantLessonsView,
  downloadView,
  getClient,
  lessonView,
  unitVariantLessonsView,
  sequenceView,
  sequenceViewWhereInput,
  SequenceView,
} from '../../owaClient';

import { baseUrl } from '../../baseUrl';

import {
  checkLessonAllowedAsset,
  isLessonSupported,
  isSubjectSupported,
  isUnitSupported,
} from '@/lib/queryGate';
import { sequenceWhere } from '../sequences/sequences';
import { parseSubjectPhaseSlug } from '../../sequenceSlugParser';
import { blockedSequenceSubjects } from '../../blockedContent';
import { DownloadTypeEnum, downloadTypeEnum, LessonAssetsType } from './types';
import { getAttribution } from './helpers';
import {
  sequenceAssetsRequestOpenAPISchema,
  sequenceAssetsResponseOpenAPISchema,
} from '../../zod-openapi/generated/sequence';
import {
  subjectAssetsRequestOpenAPISchema,
  subjectAssetsResponseOpenAPISchema,
} from '@/lib/zod-openapi/generated/subject';
import {
  lessonAssetsRequestOpenAPISchema,
  lessonAssetsResponseOpenAPISchema,
} from '@/lib/zod-openapi/generated/lesson';

const graphqlClient = getClient();

export async function assetsForLesson(lessonSlug: string) {
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

  const result = assetUrls.filter((asset) => !filter || asset.type === filter);

  return result;
}

export const getAssets = router({
  getSequenceAssets: protectedProcedure
    .meta({
      openapi: {
        method: 'GET',
        tags: ['assets', 'sequences'],
        path: '/sequences/{sequence}/assets',
        errorResponses: [],
        description:
          'This endpoint returns signed download URLs and types for the assets currently available on Oak for a given sequence',
      },
    })
    .input(sequenceAssetsRequestOpenAPISchema)
    .output(sequenceAssetsResponseOpenAPISchema)
    .query(async ({ input }) => {
      // FIXME year was never being used to filter
      const { sequence, type } = input;
      const client = getClient();

      const { subjectSlug } = parseSubjectPhaseSlug(input.sequence);

      if (blockedSequenceSubjects.includes(subjectSlug)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `The subject in "${sequence}" is not currently available`,
        });
      }

      const where = sequenceWhere(sequence);

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
        {} as { [key: string]: string },
      );

      const isLessonAllowed = (slug: string) => {
        if (isSubjectSupported(subjectSlug)) {
          return true;
        }

        if (isUnitSupported(lessonToUnitLookup[slug])) {
          return true;
        }

        if (isLessonSupported(slug)) {
          return true;
        }

        return false;
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

      // FIXME add the year filter if provided

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
        path: '/key-stages/{keyStage}/subject/{subject}/assets',
        description:
          'This endpoint returns signed download URLs and types for the assets currently available on Oak for a given key stage and subject, optionally filtered by type and unit, grouped by lesson',
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

      type LessonQueryVariables = {
        _contains: {
          keystage_slug: string;
          subject_slug: string;
        };
        unit?: string;
      };

      const lessonQueryVariables = {
        _contains: {
          keystage_slug: keyStage,
          subject_slug: subject,
        },
      } as LessonQueryVariables;

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

      const isLessonAllowed = (slug: string) => {
        if (isSubjectSupported(subject)) {
          return true;
        }

        if (isUnitSupported(lessonToUnitLookup[slug])) {
          return true;
        }

        if (isLessonSupported(slug)) {
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
        tags: ['assets', 'lessons'],
        path: '/lessons/{lesson}/assets',
        errorResponses: [],
        description:
          'This endpoint returns signed download URLS and types for the assets currently available on Oak for a given lesson',
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
        tags: ['assets', 'lessons'],
        path: '/lessons/{lesson}/assets/{type}',
        description:
          'This endpoint will stream the downloadable asset for the given lesson and type',
        contentTypes: ['application/octet-stream'],
        // example: {
        //   request: {
        //     lesson: 'child-workers-in-the-victorian-era',
        //     type: 'slideDeck',
        //   },
        //   // I don't like this, but there's no way in the library to say
        //   // "this is a stream of bytes"
        //   response: { 200: 'application/octet-stream' },
        // },
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
    .output(z.any()) // no output, but file is streamed to the request
    .query(async () => {
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
