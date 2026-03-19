import { protectedProcedure } from '@/lib/protect';
import { router } from '@/lib/trpc';

import type { UnitVariantLessonsView } from 'lib/owaClient';
import { getClient, gql, unitVariantLessonsView } from 'lib/owaClient';

import {
  keywordsRequestOpenAPISchema,
  keywordsResponseOpenAPISchema,
} from '@/lib/zod-openapi/generated/keywords';

export const getKeywords = router({
  getKeywords: protectedProcedure
    .meta({
      openapi: {
        method: 'GET',
        tags: ['lists'],
        path: '/keywords',
        summary: 'Keywords',
        description:
          'This endpoint returns a list of keywords for a given key stage and subject, based on the keywords associated with the lessons that are available for that key stage and subject. The keywords are returned in order of frequency, with the most common keywords appearing first.',
        errorResponses: [],
      },
    })
    .input(keywordsRequestOpenAPISchema)
    .output(keywordsResponseOpenAPISchema)
    .query(async ({ input }) => {
      // ctx
      const keyStage = decodeURIComponent(input.keyStage || '') || undefined;
      const subject = decodeURIComponent(input.subject || '') || undefined;
      const unit = input.unit ? decodeURIComponent(input.unit) : undefined;
      const lesson = input.lesson
        ? decodeURIComponent(input.lesson)
        : undefined;

      const client = getClient();

      const unitFilter = unit ? `unit_slug: { _eq: $unit }` : '';
      const lessonFilter = lesson ? `lesson_slug: { _eq: $lesson }` : '';

      const query = gql`
        query ($filter: jsonb!${unit ? ', $unit: String' : ''}${lesson ? ', $lesson: String' : ''}) {
          ${unitVariantLessonsView}(
            where: {
              is_legacy: { _eq: false }
              programme_fields: {
                _contains: $filter
              }
              ${unitFilter}
              ${lessonFilter}
            },
            order_by: {lesson_slug: asc}
          ) {
            lesson_slug: lesson_data(path: "slug")
            keywords: lesson_data(path: "keywords")
            subject_slug:programme_fields(path:"subject_slug")
            keystage_slug:programme_fields(path:"keystage_slug")
          }
        }
      `;

      const variables = {
        filter: {
          subject_slug: subject,
          keystage_slug: keyStage,
        },
        ...(unit && { unit }),
        ...(lesson && { lesson }),
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
          subjectSlug: string;
          keyStageSlug: string;
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
              subjectSlug: lesson.subject_slug,
              keyStageSlug: lesson.keystage_slug,
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
        .map(([keyword, { lessonSlugs, ...data }]) => ({
          keyword,
          lessonSlugs: Array.from(lessonSlugs),
          ...data,
        }));

      return keywords;
    }),
});
