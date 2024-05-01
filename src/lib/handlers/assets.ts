import { TRPCError } from '@trpc/server';
import { gql } from 'graphql-request';
import { z } from 'zod';

import { protectedProcedure } from '~/lib/auth';
import { router } from '../trpc';
import { Lesson, LessonView, getClient, lessonView } from '../owaClient';
import { keyStageSlugs, subjectSlugs } from '../keyStageAndSubjects';
import { baseUrl } from '../baseUrl';

// note: I've put these two together in the code because they're
// directly linked

// FIXME stop using this MV, need to move to my own
const downloadView = 'published_mv_downloads_5_0_2';
export type DownloadView = {
  published_mv_downloads_5_0_2: DownloadObjects[];
};

export interface DownloadObjects {
  lessonSlug: string;
  lessonTitle: string;
  unitSlug: string;
  downloads: Download[];
}

type Download = {
  ext: string;
  label: string;
  type: string;
  url?: string;
};

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

const assetOutput = z.object({
  title: z.string().optional(),
  url: z.string().optional(),
  type: typeEnum,
});

const graphqlClient = getClient();

function assetDownloadWithVideos(
  lessonSlug: string,
  downloads: Download[],
  videoObjects: Lesson[]
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
    return {
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
        example: {
          response: [
            {
              lessonSlug:
                'imagining-you-are-the-characters-the-three-billy-goats-gruff',
              lessonTitle:
                "Imagining you are the characters: 'The Three Billy Goats Gruff'",
              assets: [
                {
                  title: 'Slide deck',
                  url: `${baseUrl}/download/imagining-you-are-the-characters-the-three-billy-goats-gruff/type/presentation`,
                  type: 'presentation',
                },
                {
                  title: 'Starter quiz questions',
                  url: `${baseUrl}/download/imagining-you-are-the-characters-the-three-billy-goats-gruff/type/intro-quiz-questions`,
                  type: 'intro-quiz-questions',
                },
                {
                  title: 'Starter quiz answers',
                  url: `${baseUrl}/download/imagining-you-are-the-characters-the-three-billy-goats-gruff/type/intro-quiz-answers`,
                  type: 'intro-quiz-answers',
                },
                {
                  title: 'Exit quiz questions',
                  url: `${baseUrl}/download/imagining-you-are-the-characters-the-three-billy-goats-gruff/type/exit-quiz-questions`,
                  type: 'exit-quiz-questions',
                },
                {
                  title: 'Exit quiz answers',
                  url: `${baseUrl}/download/imagining-you-are-the-characters-the-three-billy-goats-gruff/type/exit-quiz-answers`,
                  type: 'exit-quiz-answers',
                },
                {
                  title: 'Worksheet',
                  url: `${baseUrl}/download/imagining-you-are-the-characters-the-three-billy-goats-gruff/type/worksheet-pdf`,
                  type: 'worksheet-pdf',
                },
                {
                  title: 'Worksheet',
                  url: `${baseUrl}/download/imagining-you-are-the-characters-the-three-billy-goats-gruff/type/worksheet-pptx`,
                  type: 'worksheet-pptx',
                },
                {
                  title: 'Additional material',
                  url: `${baseUrl}/download/imagining-you-are-the-characters-the-three-billy-goats-gruff/type/supplementary-pdf`,
                  type: 'supplementary-pdf',
                },
                {
                  title: 'Additional material',
                  url: `${baseUrl}/download/imagining-you-are-the-characters-the-three-billy-goats-gruff/type/supplementary-docx`,
                  type: 'supplementary-docx',
                },
                {
                  title: 'Video',
                  url: `${baseUrl}/download/imagining-you-are-the-characters-the-three-billy-goats-gruff/type/video-mp4`,
                  type: 'video-mp4',
                },
              ],
            },
          ],
          request: {
            keyStage: 'ks1',
            subject: 'english',
            type: 'presentation',
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
        type: typeEnum.optional(),
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
    .query(async ({ input, ctx }) => {
      const keyStage = input.keyStage;
      const subject = input.subject;
      const unit = input.unit || null;
      const typeFilter = input.type || null;

      const offset = input.offset;
      const limit = input.limit;

      let where =
        'keyStageSlug: { _eq: $keyStage } subjectSlug: { _eq: $subject } ';
      if (unit) where += `unitSlug: { _eq: $unit }`;

      const queryVideos = gql`
        query GetAssets(
          $keyStage: String!
          $subject: String!
          $offset: Int!
          $limit: Int!
          $unit: String
        ) {
          ${lessonView}(
            where: {
              ${where}
            }
            offset: $offset,
            limit: $limit,
            order_by: {lessonSlug: asc}
          ) {
            lessonSlug
            lessonTitle
            unitSlug
            video_object
          }
        }
      `;

      const queryDownloads = gql`
        query GetDownloads(
          $keyStage: String!
          $subject: String!
          $offset: Int!
          $limit: Int!
          $unit: String
        ) {
          ${downloadView}(
            where: {
              ${where}
            }
            offset: $offset,
            limit: $limit,
            order_by: {lessonSlug: asc}
          ) {
            lessonSlug
            lessonTitle
            unitSlug
            downloads
          }
        }
      `;

      const variables = {
        keyStage,
        subject,
        unit,
        offset,
        limit,
      } as {
        offset: number;
        limit: number;
        keyStage: string;
        subject: string;
        unit?: string;
      };

      if (!unit) {
        delete variables.unit;
      }

      const [downloadsQuery, videoObjectQuery] = await Promise.all([
        graphqlClient.request(
          queryDownloads,
          variables
        ) as Promise<DownloadView>,
        graphqlClient.request(queryVideos, variables) as Promise<LessonView>,
      ]);

      const res = downloadsQuery[downloadView];

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

      return res.map(({ downloads, lessonSlug, lessonTitle }) => {
        return {
          lessonSlug,
          lessonTitle,
          assets: assetDownloadWithVideos(
            lessonSlug,
            downloads,
            videoObjectQuery[lessonView]
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
        example: {
          request: {
            lesson: 'joining-using-and',
          },
          response: [
            {
              title: 'Slide deck',
              url: `${baseUrl}/download/four-types-of-simple-sentence/type/presentation`,
              type: 'presentation',
            },
            {
              title: 'Starter quiz questions',
              url: `${baseUrl}/download/four-types-of-simple-sentence/type/intro-quiz-questions`,
              type: 'intro-quiz-questions',
            },
            {
              title: 'Starter quiz answers',
              url: `${baseUrl}/download/four-types-of-simple-sentence/type/intro-quiz-answers`,
              type: 'intro-quiz-answers',
            },
            {
              title: 'Exit quiz questions',
              url: `${baseUrl}/download/four-types-of-simple-sentence/type/exit-quiz-questions`,
              type: 'exit-quiz-questions',
            },
            {
              title: 'Exit quiz answers',
              url: `${baseUrl}/download/four-types-of-simple-sentence/type/exit-quiz-answers`,
              type: 'exit-quiz-answers',
            },
            {
              title: 'Worksheet',
              url: `${baseUrl}/download/four-types-of-simple-sentence/type/worksheet-pdf`,
              type: 'worksheet-pdf',
            },
            {
              title: 'Worksheet',
              url: `${baseUrl}/download/four-types-of-simple-sentence/type/worksheet-pptx`,
              type: 'worksheet-pptx',
            },
            {
              title: 'Additional material',
              url: `${baseUrl}/download/four-types-of-simple-sentence/type/supplementary-pdf`,
              type: 'supplementary-pdf',
            },
            {
              title: 'Additional material',
              url: `${baseUrl}/download/four-types-of-simple-sentence/type/supplementary-docx`,
              type: 'supplementary-docx',
            },
            {
              title: 'Video',
              url: `${baseUrl}/download/four-types-of-simple-sentence/type/video-mp4`,
              type: 'video-mp4',
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
          ${lessonView}(
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

      const videoObjectQuery: LessonView = await graphqlClient.request(
        query,
        variables
      );

      const downloads = res[0]?.downloads;

      return assetDownloadWithVideos(
        lessonSlug,
        downloads,
        videoObjectQuery[lessonView]
      );
    }),
});
