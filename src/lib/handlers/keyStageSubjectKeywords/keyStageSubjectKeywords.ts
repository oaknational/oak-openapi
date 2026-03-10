import { protectedProcedure } from '@/lib/protect';
import { router } from '@/lib/trpc';

import type { UnitVariantLessonsView } from 'lib/owaClient';
import { getClient, gql, unitVariantLessonsView } from 'lib/owaClient';

import {
  keyStageSubjectKeywordsRequestOpenAPISchema,
  keyStageSubjectKeywordsResponseOpenAPISchema,
} from '@/lib/zod-openapi/generated/keyStageSubjectKeywords';

export const getKeyStageSubjectKeywords = router({
  getKeyStageSubjectKeywords: protectedProcedure
    .meta({
      openapi: {
        method: 'GET',
        tags: ['lists'],
        path: '/key-stages/{keyStage}/subject/{subject}/keywords',
        summary: 'Keywords',
        description:
          'This endpoint returns a list of keywords for a given key stage and subject, based on the keywords associated with the lessons that are available for that key stage and subject. The keywords are returned in order of frequency, with the most common keywords appearing first.',
        errorResponses: [],
      },
    })
    .input(keyStageSubjectKeywordsRequestOpenAPISchema)
    .output(keyStageSubjectKeywordsResponseOpenAPISchema)
    .query(async ({ input }) => {
      // ctx
      const keyStage = decodeURIComponent(input.keyStage);
      const subject = decodeURIComponent(input.subject);

      const client = getClient();

      const query = gql`
        query ($filter: jsonb!) {
          ${unitVariantLessonsView}(
            where: {
              is_legacy: { _eq: false }
              programme_fields: {
                _contains: $filter
              }
            },
            order_by: {lesson_slug: asc}
          ) {
            lesson_slug: lesson_data(path: "slug")
            keywords: lesson_data(path: "keywords")
          }
        }
      `;

      const variables = {
        filter: {
          subject_slug: subject,
          keystage_slug: keyStage,
        },
      };

      const res = await client.request(query, variables);

      const lessons = (res as UnitVariantLessonsView)[unitVariantLessonsView];

      if (lessons.length === 0) {
        return [];
      }

      const keywordMap: Record<
        string,
        {
          description: string;
          lessonSlugs: Set<string>;
        }
      > = {};

      lessons.forEach((lesson) => {
        const keywords = lesson.keywords || [];
        keywords.forEach((keywordObj) => {
          const { keyword, description } = keywordObj;
          if (!keywordMap[keyword]) {
            keywordMap[keyword] = {
              description,
              lessonSlugs: new Set(),
            };
          }
          keywordMap[keyword].lessonSlugs.add(lesson.lesson_slug);
        });
      });

      const keywords = Object.entries(keywordMap)
        .toSorted(
          // sort by the keyword
          (a, b) => a[0].localeCompare(b[0]),
        )
        .map(([keyword, data]) => ({
          keyword,
          description: data.description,
          lessonSlugs: Array.from(data.lessonSlugs),
        }));

      return keywords;
    }),
});
