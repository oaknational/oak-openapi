import { TRPCError } from '@trpc/server';
import { gql } from 'graphql-request';
import { z } from 'zod';

// Import type only
import { protectedProcedure } from '~/lib/auth';
import { router } from '~/lib/trpc';
import type { DownloadView } from './assets';
import { LessonView, getClient, lessonView } from '../owaClient';

// NOTE: this is a proxy for the download service, which is not implemented in this repository
// https://downloads-api.thenational.academy/ aka https://github.com/oaknational/curriculum-downloads-api
export const downloadRouter = router({
  getDownload: protectedProcedure
    .meta({
      openapi: {
        method: 'GET',
        tags: ['downloads'],
        path: '/download/{slug}/type/{type}',
        description: 'Get a signed download URL to the asset type',
      },
    })
    .input(
      z.object({
        slug: z.string({
          description: 'The lesson slug',
        }),
        type: z.enum([
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
        ]),
      })
    )
    .output(
      z.object({
        url: z.string({
          description: 'The signed download URL',
        }),
      })
    )
    .query(async ({ input, ctx }) => {
      const { slug, type } = input;

      const graphqlClient = getClient();

      const query = gql`
        select: {
          slug: true,
          Downloads: {
            select: {
              download: true,
            },
          },
        },
        where: {
          slug,
        },
      }`;

      const res: LessonView = await graphqlClient.request(query);

      if (!res) {
        throw new TRPCError({
          message: 'No lessons found',
          code: 'NOT_FOUND',
        });
      }

      if (
        (!res.Downloads || res.Downloads.length === 0) &&
        type !== 'video-mp4'
      ) {
        throw new TRPCError({
          message: 'No downloads found',
          code: 'NOT_FOUND',
        });
      }

      if (type === 'video-mp4') {
        // get the videos from Hasura - though eventually I want to get all the
        // data from Hasura
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
        const videoObjectQuery: LessonView = await graphqlClient.request(
          query,
          { lessonSlug: slug }
        );

        const videoView = videoObjectQuery[lessonView];
        const video = videoView.find((_) => _.lessonSlug === slug);

        if (
          videoView.length === 0 ||
          !video ||
          video.video_object.status !== 'ready'
        ) {
          throw new TRPCError({
            message: 'No downloads found',
            code: 'NOT_FOUND',
          });
        }

        const url = `https://stream.mux.com/${video.video_object.mux_playback_id}/high.mp4`;

        return {
          url,
        };
      }

      const found = res.Downloads.find((d) => {
        if (!d.download || Array.isArray(d.download) === false) {
          return false;
        }

        return (d.download as DownloadView[]).find((_) => _.type === type);
      });

      if (!found) {
        throw new TRPCError({
          message: 'Download type not found',
          code: 'NOT_FOUND',
        });
      }

      const apikey = ctx.req.headers.authorization?.split(' ')[1];

      const json = await fetch(
        `https://downloads-api.thenational.academy/api/lesson/${slug}/download?selection=${input.type}&openapi_key=${apikey}`
      ).then((res) => res.json());

      return json.data;
    }),
});
