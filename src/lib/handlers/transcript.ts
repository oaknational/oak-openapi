// import { protectedProcedure } from '@/lib/protect';
// import { router } from '@/lib/trpc';
// import { TRPCError } from '@trpc/server';
// import {
//   getClient,
//   gql,
//   LessonContentView,
//   lessonContentView,
// } from 'lib/owaClient';
// import { z } from 'zod';
// import { checkLessonAllowedAsset } from '../queryGate';

// export const getLessonTranscript = router({
//   getLessonTranscript: protectedProcedure
//     .meta({
//       openapi: {
//         method: 'GET',
//         tags: ['lessons'],
//         path: '/lessons/{lesson}/transcript',
//         description:
//           'This endpoint returns the transcript from the video from a lesson',
//         example: {
//           request: {
//             lesson: 'checking-understanding-of-basic-transformations',
//           },
//           response: {
//             transcript:
//               "Hello, I'm Mrs. Lashley. I'm looking forward to guiding you through your learning today...",
//             vtt: "WEBVTT\n\n1\n00:00:06.300 --> 00:00:08.070\n<v ->Hello, I'm Mrs. Lashley.</v>\n\n2\n00:00:08.070 --> 00:00:09.240\nI'm looking forward to guiding you\n\n3\n00:00:09.240 --> 00:00:10.980\nthrough your learning today...",
//           },
//         },
//       },
//     })
//     .input(
//       z.object({
//         lesson: z.string({ description: 'The slug of the lesson' }),
//       }),
//     )
//     .output(z.object({ transcript: z.string(), vtt: z.string() }))
//     .query(async ({ input }) => {
//       const slug = decodeURIComponent(input.lesson);

//       const client = getClient();

//       const allowed = await checkLessonAllowedAsset(client, slug);

//       if (!allowed) {
//         throw new TRPCError({
//           message: 'Transcript not available for this query',
//           code: 'NOT_FOUND',
//         });
//       }

//       const query = gql`
//         query ($slug: String!) {
//           ${lessonContentView}(
//             where: { lesson_slug: { _eq: $slug } }
//           ) {
//             transcript_sentences
//             transcript_vtt
//           }
//         }
//       `;

//       const res: LessonContentView = await client.request(query, {
//         slug,
//       });

//       const transcript = res[lessonContentView][0]?.transcript_sentences;
//       const vtt = res[lessonContentView][0]?.transcript_vtt;

//       return { vtt: vtt.replace(/\r/g, ''), transcript };
//     }),
// });
