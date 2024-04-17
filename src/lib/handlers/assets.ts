import { TRPCError } from '@trpc/server';
import { GraphQLClient, gql } from 'graphql-request';
import { z } from 'zod';

import { protectedProcedure } from '~/lib/auth';
import { router } from '../trpc';
import { getClient } from '../owaClient';
import { keyStageSlugs, subjectSlugs } from '../keyStageAndSubjects';

// note: I've put these two together in the code because they're
// directly linked
const view = 'published_mv_lesson_openapi_1_0_0';
export type VideoObjectView = {
  published_mv_lesson_openapi_1_0_0: VideoObjects[];
};

const downloadView = 'published_mv_downloads_3_0_4';
export type DownloadView = {
  published_mv_downloads_3_0_4: DownloadObjects[];
};

export interface DownloadObjects {
  lessonSlug: string;
  lessonTitle: string;
  unitSlug: string;
  downloads: Download[];
}

export type VideoObjects = {
  lessonSlug: string;
  video_object: VideoObject;
};

export interface VideoObject {
  id: string;
  status: string;
  tracks: Track[];
  duration: number;
  created_at: string;
  mp4_support: string;
  passthrough: string;
  aspect_ratio: string;
  mux_asset_id: string;
  playback_ids: PlaybackId[];
  encoding_tier: string;
  master_access: string;
  mux_playback_id: string;
  resolution_tier: string;
  signed_stream_id: string;
  static_renditions: StaticRenditions;
  max_resolution_tier: string;
  max_stored_frame_rate: number;
  max_stored_resolution: string;
}

export interface Track {
  id: string;
  type: string;
  duration?: number;
  max_width?: number;
  max_height?: number;
  max_frame_rate?: number;
  max_channels?: number;
  max_channel_layout?: string;
  name?: string;
  status?: string;
  text_type?: string;
  passthrough?: string;
  text_source?: string;
  language_code?: string;
  closed_captions?: boolean;
}

export interface PlaybackId {
  id: string;
  policy: string;
}

export interface StaticRenditions {
  files: File[];
  status: string;
}

export interface File {
  ext: string;
  name: string;
  width: number;
  height: number;
  bitrate: number;
  filesize: string;
}

export type Download = {
  ext: string;
  label: string;
  type: string;
  url?: string;
};

type AssetCategory = 'slidedeck' | 'worksheet' | 'video' | 'unknown';

type DownloadType =
  | 'presentation'
  | 'intro-quiz-questions'
  | 'intro-quiz-answers'
  | 'exit-quiz-questions'
  | 'exit-quiz-answers'
  | 'worksheet-pdf'
  | 'worksheet-pptx'
  | 'supplementary-pdf'
  | 'supplementary-docx'
  | 'video-mp4';

const typeEnum = z.enum(
  [
    'presentation',
    'intro-quiz-questions',
    'intro-quiz-answers',
    'exit-quiz-questions',
    'exit-quiz-answers',
    'worksheet-pdf',
    'worksheet-pptx',
    'supplementary-pdf',
    'supplementary-docx',
    'video-mp4',
  ],
  {
    description:
      'Use the this type and the lesson slug in conjunction to get a signed download URL to the asset type from the /api/download endpoint.',
  }
);

let domain = 'http://localhost:2626';

if (process.env.VERCEL_URL) {
  domain = `https://${process.env.VERCEL_URL}`;
}

if (process.env.VERCEL_ENV === 'production' && process.env.PRODUCTION_API_URL) {
  domain = process.env.PRODUCTION_API_URL;
}

const baseUrl = `${domain}/api/v0`;

const assetOutput = z.object({
  category: z.enum([
    'slidedeck',
    'worksheet_answers',
    'worksheet',
    'video',
    'unknown',
  ]),
  title: z.string().optional(),
  url: z.string().optional(),
  type: typeEnum,
});

const graphqlClient = getClient();

function assetDownloadWithVideos(
  lessonSlug: string,
  downloads: Download[],
  videoObjects: VideoObjects[]
) {
  const videos = videoObjects.find((_) => _.lessonSlug === lessonSlug);

  if (
    videos?.video_object.status === 'ready' &&
    videos?.video_object.mux_playback_id
  ) {
    downloads.push({
      ext: 'mp4',
      label: 'Video',
      type: 'video-mp4',
      url: `${baseUrl}/download/${lessonSlug}/type/video-mp4`,
    });
  }

  return downloads.map((d) => {
    let category: AssetCategory = 'unknown';

    if (['pdf', 'doc', 'docx'].includes(d.ext)) {
      category = 'worksheet';
    }
    if (['ppt', 'pptx'].includes(d.ext)) {
      category = 'slidedeck';
    }
    if (d.ext === 'mp4') {
      category = 'video';
    }

    return {
      category,
      title: d.label,
      type: d.type as DownloadType,
      url: `${baseUrl}/download/${lessonSlug}/type/${d.type}`,
    };
  });
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
        type: typeEnum.optional(),
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
          lessonTitle: z.string({
            description: 'Lesson title',
          }),
          assets: z.array(assetOutput),
        })
      )
    )
    .query(async ({ input }) => {
      // FIXME: move to slugs instead of titles
      const key = decodeURIComponent(input.keyStage);
      const subject = decodeURIComponent(input.subject);
      const unit = input.unit || null;
      const typeFilter = input.type || null;

      // BIG FIXME - ordinarily I'd use the slugs as the joining data point,
      // except that "our" database (the ai-beta one) has key stage slugs as
      // "key-stage-3" which, compared to the OWA database, doesn't match
      // and needs to be "ks3". So instead, I'm using the title, which feels
      // brittle, but does work.

      const queryVideos = gql`
        query GetAssets(
          $keyStage: String!
          $subject: String!
        ) {
          ${view}(
            where: { keyStageSlug: { _eq: $keyStage }, subjectSlug: { _eq: $subject } }
          ) {
            lessonSlug
            unitSlug
            video_object
          }
        }
      `;

      const queryDownloads = gql`
        query GetDownloads($keyStage: String!, $subject: String!) {
          ${downloadView}(
            where: {
              keyStageSlug: { _eq: $keyStage }
              subjectSlug: { _eq: $subject }
            }
          ) {
            lessonSlug
            lessonTitle
            unitSlug
            downloads
          }
        }
      `;

      const variables = {
        keyStage: key,
        subject,
      };

      const downloadsQuery: DownloadView = await graphqlClient.request(
        queryDownloads,
        variables
      );

      const res = downloadsQuery[downloadView];

      const videoObjectQuery: VideoObjectView = await graphqlClient.request(
        queryVideos,
        variables
      );

      return res
        .filter((res) => {
          if (!unit) return true;
          return res.unitSlug === unit;
        })
        .map(({ downloads, lessonSlug, lessonTitle }) => {
          return {
            lessonSlug,
            lessonTitle,
            assets: assetDownloadWithVideos(
              lessonSlug,
              downloads,
              videoObjectQuery[view]
            ).filter((asset) => {
              if (!typeFilter) return true;
              return asset.type === typeFilter;
            }),
          };
        });
    }),
  getLessonAssets: protectedProcedure
    .meta({
      openapi: {
        method: 'GET',
        tags: ['assets', 'lessons'],
        path: '/lessons/{lesson}/assets',
        description:
          'The downloadable assets for a specific lesson, including: slidedecks, worksheets, worksheet answers and videos.',
      },
    })
    .input(
      z.object({
        lesson: z.string({
          description: 'The lesson slug',
        }),
      })
    )
    .output(z.array(assetOutput))
    .query(async ({ input }) => {
      const { lesson: lessonSlug } = input;

      const queryDownloads = gql`
        query GetDownloads($lessonSlug: String!) {
          ${downloadView}(
            where: {
              lessonSlug: { _eq: $lessonSlug }
            }
          ) {
            lessonSlug
            lessonTitle
            downloads
          }
        }
      `;

      // also get the video assets
      const query = gql`
        query GetAssets($lessonSlug: String!) {
          ${view}(
            where: { lessonSlug: { _eq: $lessonSlug } }
          ) {
            lessonSlug
            video_object
          }
        }
      `;

      const variables = {
        lessonSlug,
      };

      const downloadsQuery: DownloadView = await graphqlClient.request(
        queryDownloads,
        variables
      );

      const res = downloadsQuery[downloadView];

      if (!res || res.length === 0 || !res[0]) {
        throw new TRPCError({
          message: 'No lessons found',
          code: 'NOT_FOUND',
        });
      }

      const videoObjectQuery: VideoObjectView = await graphqlClient.request(
        query,
        variables
      );

      const downloads = res[0]?.downloads;

      return assetDownloadWithVideos(
        lessonSlug,
        downloads,
        videoObjectQuery[view]
      );
    }),
});
