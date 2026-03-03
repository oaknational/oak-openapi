import { protectedProcedure } from '@/lib/protect';
import { router } from '@/lib/trpc';
import type { LessonContentView } from 'lib/owaClient';
import { getClient, gql, lessonContentView } from 'lib/owaClient';

import { checkLessonAllowedAsset } from '../../queryGate';
import {
  transcriptRequestOpenAPISchema,
  transcriptResponseOpenAPISchema,
} from '@/lib/zod-openapi/generated/transcript';
import { TRPCError } from '@trpc/server';

export const getLessonTranscript = router({
  getLessonTranscript: protectedProcedure
    .meta({
      openapi: {
        method: 'GET',
        tags: ['lessons', 'lesson-data'],
        summary: 'Lesson transcript',
        path: '/lessons/{lesson}/transcript',
        description:
          'This endpoint returns the video transcript and video captions file for a given lesson.',
        errorResponses: [],
      },
    })
    .input(transcriptRequestOpenAPISchema)
    .output(transcriptResponseOpenAPISchema)
    .query(async ({ input }) => {
      const slug = decodeURIComponent(input.lesson);

      const client = getClient();

      const gated = await checkLessonAllowedAsset({ client, lessonSlug: slug });

      if (gated.isBlocked()) {
        throw new TRPCError({
          message: `Transcript not available: "${slug}"`,
          code: 'BAD_REQUEST',
          cause: gated.reason,
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
