import { protectedProcedure } from '~/lib/protect';
import { router } from '~/lib/trpc';
import { TRPCError } from '@trpc/server';
import {
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

export const output = z.object({
  unitSlug: z.string(),
  unitTitle: z.string(),
  tags: z.array(z.string()),
  yearSlug: z.string(),
  year: z.number(),
  phaseSlug: z.string(),
  subjectSlug: z.string(),
  keyStageSlug: z.string(),
  notes: z.string().optional(),
  description: z.string().optional(),
  priorKnowledgeRequirements: z.array(z.string()),
  nationalCurriculumContent: z.array(z.string()),
  whyThisWhyNow: z.string().optional(),
  threads: z.array(threadSchema).optional(),
  unitLessons: z.array(
    z.object({
      lessonSlug: z.string(),
      lessonTitle: z.string(),
      lessonOrder: z.number().optional(),
    }),
  ),
});

type UnitSchema = z.infer<typeof output>;

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
              },
              {
                lessonSlug:
                  'three-ways-for-co-ordination-in-compound-sentences',
                lessonTitle:
                  'Three ways for co-ordination in compound sentences',
                lessonOrder: 2,
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

      const isUnitVariant = /-\d+$/.test(slug);

      let where;
      if (isUnitVariant) {
        where = { slug: { _like: `${slug.replace(/-\d+$/, '-')}%` } };
      } else {
        where = { slug: { _eq: slug } };
      }

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
          }
        }
      `;

      const res: SequenceView = await client.request(query, { where });
      if (res[sequenceView].length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Unit not found' });
      }

      type RootUnitData = {
        unitTitle: string;
        tags: string[];
        notes: string;
        threads: Thread[];
        priorKnowledgeRequirements: string[];
        nationalCurriculumContent: string[];
      };

      const sequenceData = res[sequenceView][0];

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

      // we populate from the sequence view
      const root: RootUnitData = {
        unitTitle: sequenceData.title,
        tags: sequenceData.tags || [],
        notes: sequenceData.notes,
        threads: sequenceData.threads,
        priorKnowledgeRequirements: (
          sequenceData.prior_knowledge_requirements || []
        ).map(({ title }) => title),
        nationalCurriculumContent: (
          sequenceData.national_curriculum_content || []
        ).map(({ title }) => title),
      };

      type Metadata = {
        unitTitle: string;
        year: number;
        yearSlug: string;
        phaseSlug: string;
        subjectSlug: string;
        keyStageSlug: string;
        unitLessons: {
          lessonSlug: string;
          lessonTitle: string;
          lessonOrder: number;
        }[];

        // cycle 2
        whyThisWhyNow?: string;
        description?: string;
      };

      // TS: allow me to declare it empty first
      const metadata = {} as Metadata;

      metadata.unitTitle = sequenceData.title;
      metadata.description = sequenceData.description;
      metadata.yearSlug = `year-${sequenceData.year}`;
      metadata.year = parseInt(sequenceData.year, 10);
      metadata.phaseSlug = sequenceData.phase_slug;
      metadata.subjectSlug = sequenceData.subject_slug;
      metadata.keyStageSlug = sequenceData.keystage_slug;
      metadata.whyThisWhyNow = sequenceData.why_this_why_now;
      metadata.unitLessons = sequenceData.lessons
        .map((lesson) => ({
          lessonSlug: lesson.slug,
          lessonTitle: lesson.title,
          lessonOrder: lesson.order,
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

      const reply: UnitSchema = {
        unitSlug: slug,
        ...root,
        ...metadata,
      };

      return reply;
    }),
});
