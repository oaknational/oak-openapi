import { protectedProcedure } from '~/lib/protect';
import { router } from '~/lib/trpc';
import { TRPCError } from '@trpc/server';
import {
  Sequence,
  SequenceView,
  getClient,
  gql,
  sequenceView,
  sequenceViewWhereInput,
} from 'lib/owaClient';
import { z } from 'zod';
import { blockUnitForCopyrightText } from '../queryGate';

const threadSchema = z.object({
  slug: z.string(),
  title: z.string(),
  order: z.number(),
});

type Thread = z.infer<typeof threadSchema>;

const categorySchema = z.object({
  categoryTitle: z.string(),
  categorySlug: z.string().optional(),
});

export const output = z.object({
  unitSlug: z.string(),
  unitTitle: z.string(),
  yearSlug: z.string(),
  year: z.union([z.number(), z.string({ description: 'All years' })]),
  phaseSlug: z.string(),
  subjectSlug: z.string(),
  keyStageSlug: z.string(),
  notes: z.string().optional(),
  description: z.string().optional(),
  priorKnowledgeRequirements: z.array(z.string()),
  nationalCurriculumContent: z.array(z.string()),
  whyThisWhyNow: z.string().optional(),
  threads: z.array(threadSchema).optional(),
  categories: z.array(categorySchema).optional(),
  unitLessons: z.array(
    z.object({
      lessonSlug: z.string(),
      lessonTitle: z.string(),
      lessonOrder: z.number().optional(),
      state: z.enum(['published', 'new'], {
        description:
          "If the state is 'published' then it is also available on the /lessons/* endpoints. If the state is 'new' then it's not available yet.",
      }),
    }),
  ),
});

type Category = z.infer<typeof categorySchema>;
export type UnitSchema = z.infer<typeof output> & {
  examboardSlug?: string;
  examboard?: string;
};

export const getUnits = router({
  getUnit: protectedProcedure

    .meta({
      openapi: {
        method: 'GET',
        tags: ['units'],
        path: '/units/{unit}/summary',
        description:
          'This endpoint returns unit information for a given unit, including slug, title, number of lessons, prior knowledge requirements, national curriculum statements, prior unit details, future unit descriptions, and lesson titles that form the unit',
        example: {
          request: {
            unit: 'simple-compound-and-adverbial-complex-sentences',
          },
          response: {
            unitSlug: 'simple-compound-and-adverbial-complex-sentences',
            unitTitle: 'Simple, compound and adverbial complex sentences',
            yearSlug: 'year-3',
            year: 3,
            phaseSlug: 'primary',
            subjectSlug: 'english',
            keyStageSlug: 'ks2',
            threads: [
              {
                slug: 'developing-grammatical-knowledge',
                title: 'Developing grammatical knowledge',
                order: 10,
              },
            ],
            unitLessons: [
              {
                lessonSlug: 'four-types-of-simple-sentence',
                lessonTitle: 'Four types of simple sentence',
                lessonOrder: 1,
                state: 'published',
              },
              {
                lessonSlug:
                  'three-ways-for-co-ordination-in-compound-sentences',
                lessonTitle:
                  'Three ways for co-ordination in compound sentences',
                lessonOrder: 2,
                state: 'new',
              },
            ],
          },
        },
      },
    })
    .output(output)
    .input(z.object({ unit: z.string({ description: 'The unit slug' }) }))
    .query(async ({ input }) => {
      const { unit: slug } = input;
      const client = getClient();

      const blocked = await blockUnitForCopyrightText(client, slug);

      if (blocked) {
        throw new TRPCError({
          message: 'Unit not available for this query (blocked copyright text)',
          code: 'NOT_FOUND',
        });
      }

      const isUnitVariant = testIfUnitVariant(slug);

      // Ensure that non-curriculum units don't come through
      const whereNonCurriculum = { non_curriculum: { _eq: false } };

      let whereSlug;

      if (isUnitVariant) {
        whereSlug = { slug: { _like: `${slug.replace(/-\d+$/, '-')}%` } };
      } else {
        whereSlug = { slug: { _eq: slug } };
      }

      const where = { ...whereSlug, ...whereNonCurriculum };

      const query = gql`
        query getUnit($where: ${sequenceViewWhereInput}) @cached(ttl: 300) {
          ${sequenceView}(where: $where) {
            title
            slug
            description
            keystage_slug
            lessons
            phase_slug
            subject_slug
            unit_options
            why_this_why_now
            threads
            year
            examboard
            examboard_slug
            subjectcategories

            prior_knowledge_requirements
            national_curriculum_content
          }
        }
      `;

      const res: SequenceView = await client.request(query, { where });
      if (res[sequenceView].length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Unit not found' });
      }

      const sequenceData = res[sequenceView][0];

      return formatUnitSummary(slug, sequenceData);
    }),
});

export function testIfUnitVariant(slug: string): boolean {
  return /-\d+$/.test(slug);
}

export function formatUnitSummary(
  slug: string,
  sequenceData: Sequence,
): UnitSchema {
  const isUnitVariant = testIfUnitVariant(slug);
  type RootUnitData = {
    unitTitle: string;
    notes: string;
    threads: Thread[];
    priorKnowledgeRequirements: string[];
    nationalCurriculumContent: string[];
    categories: Category[] | undefined;
  };

  if (isUnitVariant) {
    // RADAR this is a hack that we hope to remove when
    // published_mv_curriculum_sequence_b_13_0_12 is live
    // until then, we need to do the unit option dance

    const unitOption = sequenceData.unit_options.find(
      (unitOption) => unitOption.slug === slug,
    );

    if (unitOption) {
      sequenceData.slug = unitOption.slug;
      sequenceData.title = unitOption.title;
      sequenceData.lessons = unitOption.lessons;
      sequenceData.why_this_why_now = unitOption.why_this_why_now;
      sequenceData.description = unitOption.description;
    }
  }

  let categories: Category[] | undefined;

  if (
    sequenceData.subjectcategories &&
    sequenceData.subjectcategories.length > 0
  ) {
    categories = sequenceData.subjectcategories.map((cat) => ({
      categoryTitle: cat.title,
      categorySlug: cat.slug,
    }));
  }

  // we populate from the sequence view
  const root: RootUnitData = {
    unitTitle: sequenceData.title,
    notes: sequenceData.notes,
    threads: sequenceData.threads,
    priorKnowledgeRequirements: Array.from(
      new Set(sequenceData.prior_knowledge_requirements || []),
    ),
    categories: categories,
    nationalCurriculumContent: Array.from(
      new Set(
        (sequenceData.national_curriculum_content || []).map(
          ({ title }) => title,
        ),
      ),
    ),
  };

  type Metadata = {
    unitTitle: string;
    year: number | 'All years';
    yearSlug: string;
    phaseSlug: string;
    subjectSlug: string;
    keyStageSlug: string;
    unitLessons: {
      lessonSlug: string;
      lessonTitle: string;
      lessonOrder: number;
      state: 'published' | 'new';
    }[];

    examboard?: string;
    examboardSlug?: string;

    // cycle 2
    whyThisWhyNow?: string;
    description?: string;
  };

  // TS: allow me to declare it empty first
  const metadata = {} as Metadata;

  metadata.unitTitle = sequenceData.title;
  metadata.description = sequenceData.description;

  if (sequenceData.year === 'all-years') {
    metadata.yearSlug = `all-years`;
    metadata.year = 'All years';
  } else {
    metadata.yearSlug = `year-${sequenceData.year}`;
    metadata.year = parseInt(sequenceData.year, 10);
  }
  metadata.phaseSlug = sequenceData.phase_slug;

  // note that it's intentional that the examboard is NOT included in the zod
  // output on the openapi meta, as it's specifically used by the bulk download
  // and not the API (because in fact this content should be an array)
  if (sequenceData.examboard_slug) {
    metadata.examboardSlug = sequenceData.examboard_slug;
    metadata.examboard = sequenceData.examboard;
  }
  metadata.subjectSlug = sequenceData.subject_slug;
  metadata.keyStageSlug = sequenceData.keystage_slug;
  metadata.whyThisWhyNow = sequenceData.why_this_why_now;
  metadata.unitLessons = sequenceData.lessons
    .map((lesson) => ({
      lessonSlug: lesson.slug,
      lessonTitle: lesson.title,
      lessonOrder: lesson.order,
      state: lesson._state,
    }))
    .sort((a, b) => (a.lessonOrder || 0) - (b.lessonOrder || 0));

  if (!metadata.whyThisWhyNow) {
    delete metadata.whyThisWhyNow;
  }

  if (sequenceData.unit_options.length > 0) {
    // get the unitTitle from the unit_option who's slug matches the variantSlug
    const unitOption = sequenceData.unit_options.find(
      (unitOption) => unitOption.slug === slug,
    );

    if (unitOption) {
      metadata.unitTitle = unitOption.title;
    }
  }

  return {
    unitSlug: slug,
    ...root,
    ...metadata,
  };
}
