import { prisma } from '@/lib/db';
import { protectedProcedure } from '@/lib/protect';
import { router } from '@/lib/trpc';
import {
  searchTranscriptRequestOpenAPISchema,
  searchTranscriptResponseOpenAPISchema,
} from '@/lib/zod-openapi/generated/searchTranscripts';
import { errorResponses } from '@/lib/errorResponses';

export const searchTranscripts = router({
  searchTranscripts: protectedProcedure
    .meta({
      openapi: {
        method: 'GET',
        tags: ['search'],
        path: '/search/transcripts',
        summary: 'Lesson search by video transcript',
        errorResponses,
        description: `Use this when a term is more likely to appear in what a teacher says on video than in the lesson title — for example, a concept, a quotation, or a worked example that isn't called out in metadata.

Returns up to 5 lessons whose transcripts contain similar text, each with a transcript snippet showing the match. No filters are applied; the search runs across every published lesson transcript.

Do not use this for:
- Finding a lesson from a term that appears in the title (use GET /search/lessons, which supports key-stage, subject, and unit filters)
- Fetching the full metadata for a known lesson (use GET /lessons/{lesson}/summary)
- Retrieving the transcript itself once you have the slug (use GET /lessons/{lesson}/transcript)

Example queries: "the mitochondria are the powerhouse", "to be or not to be", "carry the one"`,
      },
    })
    .input(searchTranscriptRequestOpenAPISchema)
    .output(searchTranscriptResponseOpenAPISchema)
    .query(async ({ input }) => {
      const { q } = input;

      interface SearchRow {
        lesson_id: string;
        source_content: string;
      }

      // console.time('snippet search');

      const search: SearchRow[] =
        await prisma.$queryRaw`SELECT lesson_id, source_content FROM snippets WHERE to_tsvector('english', source_content) @@ to_tsquery(${q
          .split(' ')
          .join(
            ' & ',
          )}) ORDER BY similarity(source_content, ${q}) DESC limit 5`;

      // console.timeEnd('snippet search');

      const ids = search.map((r) => r.lesson_id);

      interface Record {
        id: string;
        title: string;
        slug: string;
      }
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
