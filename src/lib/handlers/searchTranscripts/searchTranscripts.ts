import { prisma } from '@/lib/db';
import { protectedProcedure } from '@/lib/protect';
import { router } from '@/lib/trpc';
import {
  searchTranscriptRequestOpenAPISchema,
  searchTranscriptResponseOpenAPISchema,
} from '@/lib/zod-openapi/generated/searchTranscripts';

export const searchTranscripts = router({
  searchTranscripts: protectedProcedure
    .meta({
      openapi: {
        method: 'GET',
        tags: ['search'],
        path: '/search/transcripts',
        errorResponses: [],
        description:
          'Search for a term and find lessons that contain similar text in their video transcripts',
      },
    })
    .input(searchTranscriptRequestOpenAPISchema)
    .output(searchTranscriptResponseOpenAPISchema)
    .query(async ({ input }) => {
      const { q } = input;

      type SearchRow = {
        lesson_id: string;
        source_content: string;
      };

      // console.time('snippet search');

      const search: SearchRow[] =
        await prisma.$queryRaw`SELECT lesson_id, source_content FROM snippets WHERE to_tsvector('english', source_content) @@ to_tsquery(${q
          .split(' ')
          .join(
            ' & ',
          )}) ORDER BY similarity(source_content, ${q}) DESC limit 5`;

      // console.timeEnd('snippet search');

      const ids = search.map((r) => r.lesson_id);

      type Record = {
        id: string;
        title: string;
        slug: string;
      };
      const res: Record[] = await prisma.lesson.findMany({
        where: {
          id: {
            in: ids,
          },
        },
        select: {
          id: true,
          title: true,
          slug: true,
        },
        cacheStrategy: { ttl: 60 * 5, swr: 60 * 2 },
      });

      // sort the rows by the order of the ids array
      return res
        .map((r: Record) => ({
          lessonTitle: r.title,
          lessonSlug: r.slug,
          transcriptSnippet: search.find((s) => s.lesson_id === r.id)
            ?.source_content,
        }))
        .sort((a, b) => {
          return ids.indexOf(a.lessonSlug) - ids.indexOf(b.lessonSlug);
        });
    }),
});
