// import { z } from 'zod';
// import { prisma } from '@/lib/db';
// import { protectedProcedure } from '@/lib/protect';
// import { router } from '@/lib/trpc';

// export const searchTranscripts = router({
//   searchTranscripts: protectedProcedure
//     .meta({
//       openapi: {
//         method: 'GET',
//         tags: ['search'],
//         path: '/search/transcripts',
//         description:
//           'Search for a term and find lessons that contain similar text in their video transcripts',
//         example: {
//           request: {
//             q: 'Who were the romans?',
//           },
//           response: [
//             {
//               lessonTitle: 'The Roman invasion of Britain ',
//               lessonSlug: 'the-roman-invasion-of-britain',
//               transcriptSnippet: 'The Romans were ready,',
//             },
//             {
//               lessonTitle:
//                 'The changes to life brought about by Roman settlement',
//               lessonSlug:
//                 'the-changes-to-life-brought-about-by-roman-settlement',
//               transcriptSnippet: 'when the Romans came.',
//             },
//             {
//               lessonTitle: "Boudica's rebellion against Roman rule",
//               lessonSlug: 'boudicas-rebellion-against-roman-rule',
//               transcriptSnippet: 'kings who resisted the Romans were,',
//             },
//             {
//               lessonTitle: 'How far religion changed under Roman rule',
//               lessonSlug: 'how-far-religion-changed-under-roman-rule',
//               transcriptSnippet: 'for the Romans.',
//             },
//           ],
//         },
//       },
//     })
//     .input(
//       z.object({
//         q: z.string({
//           description:
//             'A snippet of text to search for in the lesson video transcripts',
//         }),
//       }),
//     )
//     .output(
//       z.array(
//         z.object({
//           lessonTitle: z.string(),
//           lessonSlug: z.string(),
//           transcriptSnippet: z.string().optional(),
//         }),
//       ),
//     )
//     .query(async ({ input }) => {
//       const { q } = input;

//       type SearchRow = {
//         lesson_id: string;
//         source_content: string;
//       };

//       // console.time('snippet search');

//       const search: SearchRow[] =
//         await prisma.$queryRaw`SELECT lesson_id, source_content FROM snippets WHERE to_tsvector('english', source_content) @@ to_tsquery(${q
//           .split(' ')
//           .join(
//             ' & ',
//           )}) ORDER BY similarity(source_content, ${q}) DESC limit 5`;

//       // console.timeEnd('snippet search');

//       const ids = search.map((r) => r.lesson_id);

//       type Record = {
//         id: string;
//         title: string;
//         slug: string;
//       };
//       const res: Record[] = await prisma.lesson.findMany({
//         where: {
//           id: {
//             in: ids,
//           },
//         },
//         select: {
//           id: true,
//           title: true,
//           slug: true,
//         },
//         cacheStrategy: { ttl: 60 * 5, swr: 60 * 2 },
//       });

//       // sort the rows by the order of the ids array
//       return res
//         .map((r: Record) => ({
//           lessonTitle: r.title,
//           lessonSlug: r.slug,
//           transcriptSnippet: search.find((s) => s.lesson_id === r.id)
//             ?.source_content,
//         }))
//         .sort((a, b) => {
//           return ids.indexOf(a.lessonSlug) - ids.indexOf(b.lessonSlug);
//         });
//     }),
// });
