import { protectedProcedure } from '~/lib/protect';
import { router } from '~/lib/trpc';
import { TRPCError } from '@trpc/server';
import { getClient, gql } from 'lib/owaClient';
import { z } from 'zod';
import { checkLessonAllowedAsset } from '../queryGate';
import { Storage } from '@google-cloud/storage';

let storage;

// Check if GOOGLE_APPLICATION_CREDENTIALS_JSON is set
if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
  const credentials = JSON.parse(
    process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON
  );

  // Initialize storage client with credentials
  storage = new Storage({ credentials });
} else {
  // Use default method, which relies on GOOGLE_APPLICATION_CREDENTIALS path
  storage = new Storage();
}

const transcriptBucket = 'oak-captions-2023-production';

export const getLessonTranscript = router({
  getLessonTranscript: protectedProcedure
    .meta({
      openapi: {
        method: 'GET',
        tags: ['lessons'],
        path: '/lessons/{lesson}/transcript',
        description:
          'This endpoint returns the transcript from the video from a lesson',
        example: {
          request: {
            lesson: 'checking-understanding-of-basic-transformations',
          },
          response: {},
        },
      },
    })
    .input(
      z.object({
        lesson: z.string({ description: 'The slug of the lesson' }),
      })
    )
    .output(z.object({ transcript: z.string(), vtt: z.string() }))
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
          lessons(
            where: { slug: { _eq: $slug }, _state: { _eq: "published" } }
          ) {
            lesson_uid
            slug
          }
        }
      `;

      type LessonResponse = {
        lessons: {
          lesson_uid: string;
          slug: string;
        }[];
      };

      const res: LessonResponse = await client.request(query, {
        slug,
      });

      const lesson = res.lessons[0];

      if (!lesson) {
        throw new TRPCError({
          message: 'No lessons found',
          code: 'NOT_FOUND',
        });
      }

      const { lesson_uid: uid, slug: lessonSlug } = lesson;

      const prefix = `${uid}-${lessonSlug}`;

      const [files] = await storage.bucket(transcriptBucket).getFiles({
        prefix,
      });

      const [file] = files;

      const [contents] = await file.download(); // Download the file contents
      const vtt = contents
        .toString()
        .replace(/\r/g, '')
        .replace(/<\/?[^>]+(>|$)/g, '');
      const transcript = vtt
        .split('\n\n')
        .slice(1)
        .map((_) => _.split('\n').pop())
        .join(' ');

      return { vtt, transcript };
    }),
});
