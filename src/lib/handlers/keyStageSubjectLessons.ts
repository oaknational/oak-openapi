import { protectedProcedure } from '~/lib/auth';
import { router } from '~/lib/trpc';
import { keyStageSlugs, subjectSlugs } from 'lib/keyStageAndSubjects';
import { LessonView, getClient, gql, lessonView } from 'lib/owaClient';
import { z } from 'zod';

export const getKeyStageSubjectLessons = router({
  getKeyStageSubjectLessons: protectedProcedure
    .meta({
      openapi: {
        method: 'GET',
        tags: ['lists', 'lessons'],
        path: '/key-stages/{keyStage}/subject/{subject}/lessons',
        description:
          'Get all the lessons for a given key stage and subject grouped by unit.',
        example: {
          response: [
            {
              unitSlug: 'simple-compound-and-adverbial-complex-sentences',
              unitTitle: 'Simple, compound and adverbial complex sentences',
              lessons: [
                {
                  lessonSlug: 'four-types-of-simple-sentence',
                  lessonTitle: 'Four types of simple sentence',
                },
                {
                  lessonSlug:
                    'three-ways-for-co-ordination-in-compound-sentences',
                  lessonTitle:
                    'Three ways for co-ordination in compound sentences',
                },
              ],
            },
          ],
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
            "Subject slug to filter by, e.g. 'english' - note that casing is important here, and should be lowercase",
        }),
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
          unitSlug: z.string({ description: 'Unit slug' }),
          unitTitle: z.string({ description: 'Unit title' }),
          lessons: z.array(
            z.object({
              lessonSlug: z.string({ description: 'Lesson slug' }),
              lessonTitle: z.string({ description: 'Lesson title' }),
            })
          ),
        })
      )
    )
    .query(async ({ input }) => {
      const keyStage = decodeURIComponent(input.keyStage);
      const subject = decodeURIComponent(input.subject);

      const offset = input.offset;
      const limit = input.limit;

      const client = getClient();

      const query = gql`
        query ($keyStage: String!, $subject: String!, $offset: Int!
          $limit: Int!) {
          ${lessonView}(
            where: {
              keyStageSlug: { _eq: $keyStage }
              subjectSlug: { _eq: $subject }
              isLegacy: { _eq: false }
            },
            offset: $offset,
            limit: $limit,
            order_by: {unitSlug: asc}
          ) {
            lessonSlug
            lessonTitle
            unitSlug,
            unitTitle
          }
        }
      `;

      const variables = {
        keyStage,
        subject,
        offset,
        limit,
      };

      const res = (await client.request(query, variables)) as LessonView;
      const lessons = res[lessonView];

      if (lessons.length === 0) {
        return [];
      }

      // transform to be an array of the units with a list of lessons
      const units = lessons.reduce(
        (acc, { unitSlug, unitTitle, lessonSlug, lessonTitle }) => {
          const unit = acc.find((u) => u.unitSlug === unitSlug);

          // this is never true, but keeps TypeScript quiet
          if (!lessonSlug || !lessonTitle || !unitSlug || !unitTitle) {
            return acc;
          }

          const res = {
            lessonSlug,
            lessonTitle,
          };

          if (unit) {
            unit.lessons.push(res);
          } else {
            acc.push({
              unitSlug,
              unitTitle,
              lessons: [res],
            });
          }

          return acc;
        },
        [] as {
          unitSlug: string;
          unitTitle: string;
          lessons: { lessonSlug: string; lessonTitle: string }[];
        }[]
      );

      return units;
    }),
});
