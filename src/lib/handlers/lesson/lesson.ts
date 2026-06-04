import groupBy from 'object.groupby';
import { protectedProcedure } from '@/lib/protect';
import { router } from '@/lib/trpc';
import { TRPCError } from '@trpc/server';
import { getClient, gql, lessonSearchView, lessonView } from 'lib/owaClient';
import type { LessonSearchView, LessonView } from 'lib/owaClient';
import type * as z from 'zod/v4';
import { errorResponses } from '@/lib/errorResponses';

import {
  blockLessonForCopyrightText,
  checkLessonAllowedAsset,
} from '../../queryGate';
import Timing from '@/lib/serverTimings';
import {
  getUnitProgrammeFactorsFromLesson,
  getUnitProgrammeFactorsSignature,
  type UnitProgrammeFactors,
} from '@/lib/handlers/unitProgrammeFactors';

import type { LessonSearchResultType } from './schemas/lessonSearchResponse.schema';

import {
  lessonSearchRequestOpenAPISchema,
  lessonSearchResponseOpenAPISchema,
  lessonSummaryRequestOpenAPISchema,
  lessonSummaryResponseOpenAPISchema,
} from '@/lib/zod-openapi/generated/lesson';
import {
  getCanonicalUrlForLesson,
  getOakUrlForLesson,
} from '@/lib/canonicalUrls';

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
groupBy.shim();

const timing = new Timing();

export const getLessons = router({
  getLesson: protectedProcedure
    .meta({
      openapi: {
        method: 'GET',
        tags: ['lessons', 'lesson-data'],
        summary: 'Lesson summary by slug',
        path: '/lessons/{lesson}/summary',
        description: `Use this when you already have a lesson slug and need its full metadata: title, key stage, subject, unit, keywords, key learning points, misconceptions, pupil outcomes, teacher tips, and whether downloadable resources are available.

Returns the canonical lesson record for the given slug. The slug is the same identifier used across every lesson-scoped endpoint (e.g. 'imagining-you-are-the-characters-the-three-billy-goats-gruff').

Do not use this for:
- Finding a lesson from a free-text search term (use GET /search/lessons)
- Searching the spoken content of lesson videos (use GET /search/transcripts)
- Listing every lesson in a unit or subject (use GET /key-stages/{keyStage}/subject/{subject}/lessons)
- Fetching the transcript or downloadable assets (use GET /lessons/{lesson}/transcript or GET /lessons/{lesson}/assets)`,
        errorResponses,
      },
    })
    .input(lessonSummaryRequestOpenAPISchema)
    .output(lessonSummaryResponseOpenAPISchema)
    .query(async ({ input }) => {
      const slug = decodeURIComponent(input.lesson);
      const client = getClient();

      const blocked = await blockLessonForCopyrightText(client, slug);

      if (blocked.isBlocked()) {
        // blocking actually gets true for a real 404 too, so we're
        // going to do a quick check to see if the lesson exists at all, and if not, we'll return a 404 instead of a 451. This is because we don't want to leak information about what lessons are blocked by returning a different status code for blocked vs non-existent lessons.

        const existsQuery = gql`
          query ($slug: String!) @cached(ttl: 300) {
            ${lessonView}(
              where: { lessonSlug: { _eq: $slug }, isLegacy: { _eq: false } }
            ) {
              lessonSlug
            }
          }
        `;

        const existsRes: LessonView = await client.request(existsQuery, {
          slug,
        });

        if (existsRes[lessonView].length === 0) {
          // lesson doesn't exist - return 404
          throw new TRPCError({
            message: 'Lesson not found',
            code: 'NOT_FOUND',
          });
        }

        throw new TRPCError({
          message: `Lesson (${slug}) not available for this query (blocked for copyright text)`,
          code: 'BAD_REQUEST',
          cause: blocked.reason,
        });
      }

      const query = gql`
        query ($slug: String!) @cached(ttl: 300) {
          ${lessonView}(
            where: { lessonSlug: { _eq: $slug }, isLegacy: { _eq: false } }
          ) {
            lessonTitle
            unitSlug
            unitTitle
            examBoardSlug
            examBoardTitle
            tierSlug
            tierTitle
            subjectSlug
            subjectTitle
            keyStageSlug
            keyStageTitle
            lessonKeywords
            keyLearningPoints
            misconceptionsAndCommonMistakes
            pupilLessonOutcome
            teacherTips
            contentGuidance
            downloadsAvailable: hasDownloadableResources
            supervisionLevel
            programmeSlug
          }
        }
      `;

      timing.start('getLesson graphql');
      const res: LessonView = await client.request(query, {
        slug,
      });
      timing.end('getLesson graphql');

      const data = res[lessonView];

      if (data.length === 0) {
        throw new TRPCError({
          message: 'Lesson not found',
          code: 'NOT_FOUND',
        });
      }

      try {
        // The same lesson can appear in multiple unit variants (e.g. AQA
        // foundation vs OCR higher), so collapse rows to a unique
        // (unitSlug, programmeFactors) set and surface them all in `units`.
        // The non-unit-scoped fields (lessonTitle, subject, key stage, etc.)
        // are consistent across variants so we read them from any row.
        const seen = new Set<string>();
        const units: {
          unitSlug: string;
          unitTitle: string;
          programmeFactors?: UnitProgrammeFactors;
        }[] = [];

        for (const row of data) {
          if (!row.unitSlug || !row.unitTitle) {
            continue;
          }

          const programmeFactors = getUnitProgrammeFactorsFromLesson(row);
          const dedupeKey = `${row.unitSlug}|${getUnitProgrammeFactorsSignature(programmeFactors)}`;

          if (seen.has(dedupeKey)) {
            continue;
          }
          seen.add(dedupeKey);

          units.push({
            unitSlug: row.unitSlug,
            unitTitle: row.unitTitle,
            ...(programmeFactors ? { programmeFactors } : {}),
          });
        }

        units.sort((a, b) => {
          const slugCmp = a.unitSlug.localeCompare(b.unitSlug);
          if (slugCmp !== 0) return slugCmp;
          return getUnitProgrammeFactorsSignature(
            a.programmeFactors,
          ).localeCompare(getUnitProgrammeFactorsSignature(b.programmeFactors));
        });

        const lesson = {
          ...data[0],
          units,
          canonicalUrl: getCanonicalUrlForLesson(slug),
          oakUrl: getOakUrlForLesson(slug),
        } as z.infer<typeof lessonSummaryResponseOpenAPISchema>;

        // we need to loop through the lessons and change the downloadsAvailable
        // to check against the blockedLessons list. Ideally this would come from
        // the database, but currently it's not available and some parts of the
        // restricted flags are not fully implemented in the database
        if (lesson.downloadsAvailable) {
          const isBlockedForDownloads = await checkLessonAllowedAsset({
            client,
            lessonSlug: slug,
          });

          if (isBlockedForDownloads.isBlocked()) {
            lesson.downloadsAvailable = false;
          }
        }

        lessonSummaryResponseOpenAPISchema.parse(lesson);

        return lesson;
      } catch {
        throw new TRPCError({
          message: 'Internal server error',
          code: 'INTERNAL_SERVER_ERROR',
        });
      }
    }),
  searchByTextSimilarity: protectedProcedure
    .meta({
      openapi: {
        method: 'GET',
        tags: ['lessons', 'search'],
        path: '/search/lessons',
        summary: 'Lesson search by title',
        description: `Use this when you want to find lessons from a free-text term that matches the lesson title.

Returns up to 20 lessons ranked by title similarity. Each result includes the lesson slug, title, Oak URL, similarity score, and the unit(s) the lesson appears in. Optional 'keyStage', 'subject', and 'unit' query parameters narrow the search.

Do not use this for:
- Searching the spoken content of lesson videos (use GET /search/transcripts)
- Fetching the full metadata for a lesson you already know (use GET /lessons/{lesson}/summary)
- Listing every lesson in a key stage and subject without ranking (use GET /key-stages/{keyStage}/subject/{subject}/lessons)

Example queries: "KS3 science photosynthesis", "fractions year 5", "Macbeth soliloquy"`,
        errorResponses,
      },
    })
    .input(lessonSearchRequestOpenAPISchema)
    .output(lessonSearchResponseOpenAPISchema)
    .query(async ({ input }) => {
      // store q from input.q and sanitize for use as an sql query:
      const q = input.q;
      const unit = input.unit || null;
      const subject = input.subject || null;
      const keyStage = input.keyStage || null;

      interface SearchArgs {
        filter_keystage_slug?: string;
        filter_subject_slug?: string;
        filter_unit_slug?: string;
        search_term: string;
      }

      const args: SearchArgs = {
        search_term: q,
      };

      if (unit) {
        args.filter_unit_slug = unit;
      }

      if (subject) {
        args.filter_subject_slug = subject;
      }

      if (keyStage) {
        args.filter_keystage_slug = keyStage;
      }

      const client = getClient();

      const searchQuery = gql`
        query ($search_term: String!, $filter_unit_slug: String, $filter_subject_slug: String, $filter_keystage_slug: String) {
          ${lessonSearchView}(args: {
            search_term: $search_term,
            filter_unit_slug: $filter_unit_slug,
            filter_subject_slug: $filter_subject_slug,
            filter_keystage_slug: $filter_keystage_slug,
          }) {
            lessonSlug
            similarity
          }
        }
      `;

      const result: LessonSearchView = await client.request(searchQuery, {
        ...args,
      });

      const slugs = result[lessonSearchView].map(({ lessonSlug }) => {
        return lessonSlug;
      });

      type SimilarityMap = Record<string, number>;

      const similarity: SimilarityMap = result[lessonSearchView].reduce(
        (acc, { lessonSlug, similarity: sim }) => {
          acc[lessonSlug] = sim;
          return acc;
        },
        {} as SimilarityMap,
      );

      // reality is that this is never going to be string[]
      const variables: Record<string, string | number | string[]> = { slugs };

      const _and: string[] = ['lessonSlug: { _in: $slugs }'];
      const queryArgs = [];

      if (unit) {
        _and.push('unitSlug: { _eq: $unit }');
        queryArgs.push('$unit: String');
        variables.unit = unit;
      }

      if (subject) {
        _and.push('subjectSlug: { _eq: $subject }');
        queryArgs.push('$subject: String');
        variables.subject = subject;
      }

      if (keyStage) {
        _and.push('keyStageSlug: { _eq: $keyStage }');
        queryArgs.push('$keyStage: String');
        variables.keyStage = keyStage;
      }

      const where = `, _and: { ${_and.join(',')}}`;

      const query = gql`
        query ($slugs: [String!]!, ${queryArgs.join(',')}) {
          ${lessonView}(where: {${where}}) {
            lessonSlug
            lessonTitle
            keyStageSlug
            subjectSlug
            unitSlug
            unitTitle
            examBoardTitle
          }
        }
      `;

      interface LessonResult {
        lessonSlug: string;
        lessonTitle: string;
        keyStageSlug: string;
        subjectSlug: string;
        unitSlug: string;
        unitTitle: string;
        examBoardTitle: string;
      }

      interface LessonQueryResult {
        [lessonView]: LessonResult[];
      }

      const res: LessonQueryResult = await client.request(query, variables);

      if (res[lessonView].length === 0) {
        throw new TRPCError({
          message: 'No lessons found',
          code: 'NOT_FOUND',
        });
      }

      const groupedByLesson = Object.values(
        Object.groupBy(res[lessonView], ({ lessonSlug }) => lessonSlug),
      );

      return groupedByLesson
        .reduce((acc, res) => {
          // I can't see how this is ever true, but it's a TS thing.
          if (!res) {
            return acc;
          }

          const { lessonSlug, lessonTitle } = res[0];

          const units = res.map((_) => {
            return {
              unitSlug: _.unitSlug,
              unitTitle: _.unitTitle,
              examBoardTitle: _.examBoardTitle,
              keyStageSlug: _.keyStageSlug,
              subjectSlug: _.subjectSlug,
            };
          });

          acc.push({
            lessonSlug,
            lessonTitle,
            oakUrl: getOakUrlForLesson(lessonSlug),
            similarity: similarity[lessonSlug],
            units,
          });

          return acc;
        }, [] as LessonSearchResultType[])
        .toSorted((a, b) => b.similarity - a.similarity);
    }),
});
