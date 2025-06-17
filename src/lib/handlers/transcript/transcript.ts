import { protectedProcedure } from '@/lib/protect';
import { router } from '@/lib/trpc';
import { TRPCError } from '@trpc/server';
import {
  getClient,
  gql,
  LessonContentView,
  lessonContentView,
} from 'lib/owaClient';

import { checkLessonAllowedAsset } from '../../queryGate';
import {
  transcriptRequestOpenAPISchema,
  transcriptResponseOpenAPISchema,
} from '@/lib/zod-openapi/generated/transcript';

export const getLessonTranscript = router({
  getLessonTranscript: protectedProcedure
    .meta({
      openapi: {
        method: 'GET',
        tags: ['lessons'],
        path: '/lessons/{lesson}/transcript',
        description:
          'This endpoint returns the transcript from the video from a lesson',
        errorResponses: [],
      },
    })
    .input(transcriptRequestOpenAPISchema)
    .output(transcriptResponseOpenAPISchema)
    .query(async ({ input }) => {
      const slug = decodeURIComponent(input.lesson);

      const client = getClient();

      const allowed = await checkLessonAllowedAsset(client, slug);

      if (!allowed) {
        throw new TRPCError({
          message: 'Transcript not available for this query',
          code: 'NOT_FOUND',
        });
      }

      const query = gql`
        query ($slug: String!) {
          ${lessonContentView}(
            where: { lesson_slug: { _eq: $slug } }
          ) {
            transcript_sentences
            transcript_vtt
          }
        }
      `;

      const res: LessonContentView = await client.request(query, {
        slug,
      });

      const transcript = res[lessonContentView][0]?.transcript_sentences;
      const vtt = res[lessonContentView][0]?.transcript_vtt;

      return { vtt: vtt.replace(/\r/g, ''), transcript };
    }),
});
