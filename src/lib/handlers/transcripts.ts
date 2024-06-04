import { z } from 'zod';
import { aiPool } from '~/lib/db';
import { protectedProcedure } from '~/lib/auth';
import { router } from '~/lib/trpc';

export const getTranscripts = router({
  searchTranscripts: protectedProcedure
    .meta({
      openapi: {
        method: 'GET',
        tags: ['search'],
        path: '/search/transcripts',
        description:
          'Search for a term and find lessons that contain similar text in their video transcripts',
        example: {
          request: {
            q: 'Who were the romans?',
          },
          response: [
            {
              lessonTitle: 'What is the history of London?',
              lessonSlug: 'what-is-the-history-of-london-6dgp8r',
            },
            {
              lessonTitle: 'The Roman invasion of Britain ',
              lessonSlug: 'the-roman-invasion-of-britain',
            },
            {
              lessonTitle:
                'The changes to life brought about by Roman settlement',
              lessonSlug:
                'the-changes-to-life-brought-about-by-roman-settlement',
            },
            {
              lessonTitle: 'The buildings of Roman Britain ',
              lessonSlug: 'the-buildings-of-roman-britain',
            },
            {
              lessonTitle: 'How far religion changed under Roman rule',
              lessonSlug: 'how-far-religion-changed-under-roman-rule',
            },
          ],
        },
      },
    })
    .input(
      z.object({
        q: z.string({
          description: 'The lesson slug',
        }),
      })
    )
    .output(
      z.array(z.object({ lessonTitle: z.string(), lessonSlug: z.string() }))
    )
    .query(async ({ input }) => {
      const { q } = input;

      console.log('starting search for:', q);
      console.time('snippet search');

      const search = await aiPool.query(
        `SELECT lesson_id FROM snippets WHERE to_tsvector('english', source_content) @@ to_tsquery($1) ORDER BY similarity(source_content, $2) DESC limit 5`,
        [q.split(' ').join(' & '), q]
      );
      console.timeEnd('snippet search');

      const ids = search.rows.map((r) => r.lesson_id);

      console.log('snippet complete: ', ids.length, 'results');

      const res = await aiPool.query(
        `SELECT title as "lessonTitle", slug as "lessonSlug" FROM lessons WHERE id = ANY($1)`,
        [ids]
      );

      // sort the rows by the order of the ids array
      return res.rows.sort((a, b) => {
        return ids.indexOf(a.lessonSlug) - ids.indexOf(b.lessonSlug);
      });
    }),
});
