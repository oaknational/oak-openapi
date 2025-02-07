import toSorted from 'array.prototype.tosorted';
import { protectedProcedure } from '~/lib/protect';
import { router } from '~/lib/trpc';
import { z } from 'zod';
// import { blockedSubjects } from '../blockedContent';
// import { TRPCError } from '@trpc/server';
import {
  getClient,
  gql,
  Sequence,
  SequenceView,
  sequenceView,
  sequenceViewWhereInput,
} from '../owaClient';
import { parseSubjectPhaseSlug } from '../sequenceSlugParser';
import { examBoards } from '../oakConsts';
import { blockedSequenceSubjects } from '../blockedContent';
import { TRPCError } from '@trpc/server';

toSorted.shim();

const input = z.object({
  sequence: z.string(),
  year: z.number().optional(),
});

const categorySchema = z.object({
  categoryTitle: z.string(),
  categorySlug: z.string().optional(),
});

const unitOptionSchema = z.object({
  unitTitle: z.string(),
  unitSlug: z.string(),
});

const unitWithOptionsSchema = z.object({
  unitTitle: z.string(),
  unitOrder: z.number(),
  unitOptions: z.array(unitOptionSchema),
  categories: z.array(categorySchema).optional(),
});

const unitNoOptionsSchema = z.object({
  unitTitle: z.string(),
  unitOrder: z.number(),
  unitSlug: z.string(),
  categories: z.array(categorySchema).optional(),
});

const unitSchema = z.union([unitWithOptionsSchema, unitNoOptionsSchema]);

const tierSchema = z.object({
  tier: z.string(),
  units: z.array(unitSchema),
});

const examSubjectsSchemaWithTiers = z.object({
  examSubjectTitle: z.string(),
  examSubjectSlug: z.string().optional(),
  tiers: z.array(tierSchema),
});

const examSubjectsSchemaWithoutTiers = z.object({
  examSubjectTitle: z.string(),
  examSubjectSlug: z.string().optional(),
  units: z.array(unitSchema),
});

const yearSequenceKS4WithExamSubjectsSchema = z.object({
  year: z.number(),
  examSubjects: z.array(
    z.union([examSubjectsSchemaWithTiers, examSubjectsSchemaWithoutTiers]),
  ),
});

const yearSequenceKS4WithoutExamSubjectsSchema = z.object({
  year: z.number(),
  tiers: z.array(tierSchema),
});

const yearSequenceSchema = z.object({
  year: z.number(),
  units: z.array(unitSchema),
});

const sequenceSchema = z.union([
  yearSequenceSchema,
  yearSequenceKS4WithExamSubjectsSchema,
  yearSequenceKS4WithoutExamSubjectsSchema,
]);

const output = z.array(sequenceSchema);

type SequenceSchema = z.infer<typeof sequenceSchema>;
export type YearSequence = z.infer<typeof yearSequenceSchema>;
export type ExamSubjectsWithTiers = z.infer<typeof examSubjectsSchemaWithTiers>;
export type ExamSubjectsWithoutTiers = z.infer<
  typeof examSubjectsSchemaWithoutTiers
>;
type Tier = z.infer<typeof tierSchema>;
type Category = z.infer<typeof categorySchema>;
export type yearSequenceKS4WithExamSubjects = z.infer<
  typeof yearSequenceKS4WithExamSubjectsSchema
>;
export type UnitWithOptions = z.infer<typeof unitWithOptionsSchema>;
export type UnitWithoutOptions = z.infer<typeof unitNoOptionsSchema>;

// export type SequenceUnits = z.infer<typeof output>;
// export type NonSubjectSchema = z.infer<typeof nonSubjectSchema>;
// type TiersSchema = z.infer<typeof tiersSchema>;

type WhereCondition = {
  _and: Array<{
    _or?: Array<{
      subject_slug?: { _eq: string };
      subject_parent_slug?: { _eq: string };
    }>;
    phase_slug?: { _eq: string };
    state?: { _eq: string };
    year?: { _eq: string };
  }>;
};

export function sequenceWhere(sequence: string, year?: string) {
  const { phaseSlug, subjectSlug, ks4OptionSlug } =
    parseSubjectPhaseSlug(sequence);

  const baseWhere: WhereCondition = {
    _and: [
      {
        _or: [
          { subject_slug: { _eq: subjectSlug } },
          { subject_parent_slug: { _eq: subjectSlug } },
        ],
      },
      { phase_slug: { _eq: phaseSlug } },
      { state: { _eq: 'published' } },
    ],
  };

  if (year) {
    baseWhere._and.push({ year: { _eq: year } });
  }

  const isExamboard = ks4OptionSlug
    ? examBoards.includes(ks4OptionSlug)
    : false;

  const examboardSlug = isExamboard ? ks4OptionSlug : null;
  const pathwaySlug = !isExamboard ? ks4OptionSlug : null;

  const examboardCondition = examboardSlug
    ? {
        _or: [
          { examboard_slug: { _eq: examboardSlug } },
          {
            _and: [
              { examboard_slug: { _is_null: true } },
              {
                _or: [
                  { pathway_slug: { _neq: 'core' } },
                  { pathway_slug: { _is_null: true } },
                ],
              },
            ],
          },
        ],
      }
    : { examboard_slug: { _is_null: true } };

  const pathwayCondition = pathwaySlug
    ? {
        _or: [
          { pathway_slug: { _eq: pathwaySlug } },
          { pathway_slug: { _is_null: true } },
        ],
      }
    : { pathway_slug: { _is_null: true } };

  return {
    ...baseWhere,
    _and: [
      ...baseWhere._and,
      isExamboard ? examboardCondition : pathwayCondition,
    ],
  };
}

export const getSequences = router({
  getSequenceUnits: protectedProcedure
    .meta({
      openapi: {
        tags: ['lists', 'units', 'sequences'],
        method: 'GET',
        path: '/sequences/{sequence}/units',
        description: '',
        example: {
          request: {
            sequence: 'science-secondary-edexcel',
          },
          response: [
            {
              year: 3,
              subjects: [
                {
                  subjectSlug: 'grammar',
                  subjectTitle: 'Grammar',
                  units: [
                    {
                      unitTitle:
                        'Simple, compound and adverbial complex sentences',
                      unitSlug:
                        'simple-compound-and-adverbial-complex-sentences',
                      order: 1,
                    },
                    {
                      unitTitle: 'Tense forms: simple, progressive and perfect',
                      unitSlug: 'tense-forms-simple-progressive-and-perfect',
                      order: 2,
                    },
                    {
                      unitTitle: 'Speech first punctuation and apostrophes',
                      unitSlug: 'speech-first-punctuation-and-apostrophes',
                      order: 3,
                    },
                  ],
                },
              ],
            },
          ],
        },
      },
    })
    .input(input)
    .output(output)
    .query(async ({ input }) => {
      const client = getClient();

      const yearFilter = input.year || 0;

      const { subjectSlug } = parseSubjectPhaseSlug(input.sequence);

      if (blockedSequenceSubjects.includes(subjectSlug)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `The subject "${subjectSlug}" is not currently available`,
        });
      }

      const where = sequenceWhere(input.sequence);

      const query = gql`
      query ($where: ${sequenceViewWhereInput}!) {
        ${sequenceView}(
          where: $where
          order_by: { order: asc }
        ) {
          title
          slug
          domain
          examboard_slug
          keystage_slug
          order
          pathway
          pathway_slug
          phase
          subject
          subjectcategories
          subject_parent
          subject_slug
          tier
          tier_slug
          unit_options
          year
        }
      }`;

      const res: SequenceView = await client.request(query, { where });

      const rawData = res[sequenceView];

      const years = Array.from(
        rawData.reduce<Set<number>>(
          (acc, curr) => acc.add(Number(curr.year)),
          new Set(),
        ),
      )
        .sort((a, b) => a - b)
        .filter((year) => {
          if (yearFilter) {
            return year === yearFilter;
          }
          return true;
        });

      const result: SequenceSchema[] = [];

      const ks4Years = years.filter((year) => year >= 10);

      years.forEach((year) => {
        const yearUnits = rawData.filter((_) => Number(_.year) === year);

        // then we're going to check for examSubjects / child subjects
        const seen = new Set<string>();

        // let's find out how many subjects there are,
        // if there's only one, then we don't break it into examSubjects
        for (const { subject } of yearUnits) {
          if (!seen.has(subject)) {
            seen.add(subject);
          }
        }

        // let's use the first unit in the year sequence
        const hasTiers = !!yearUnits[0].tier_slug;
        const hasExamSubjects = seen.size > 1;

        if (!ks4Years.includes(year)) {
          const units = formatUnits(yearUnits);

          result.push({
            year,
            units,
          });
          return; // early return
        }

        if (!hasExamSubjects) {
          const tiers = formatUnitsForTiers(yearUnits);

          result.push({
            year,
            tiers,
          });
          return;
        }

        const examSubjects: (
          | ExamSubjectsWithTiers
          | ExamSubjectsWithoutTiers
        )[] = [];

        // reset seen
        seen.clear();

        for (const { subject, subject_slug } of yearUnits) {
          if (!seen.has(subject)) {
            seen.add(subject);

            if (hasTiers) {
              examSubjects.push({
                examSubjectTitle: subject,
                examSubjectSlug: subject_slug,
                tiers: formatUnitsForTiers(yearUnits, subject).sort((a, b) =>
                  a.tier < b.tier ? -1 : 1,
                ),
              });
            } else {
              examSubjects.push({
                examSubjectTitle: subject,
                examSubjectSlug: subject_slug,
                units: formatUnits(yearUnits, (_) => _.subject === subject),
              });
            }
          }
        }

        result.push({
          year,
          examSubjects,
        });
      });

      return result;
    }),
});

type UnitFilter = (unit: Sequence) => boolean;

function formatUnits(units: Sequence[], filter: UnitFilter = () => true) {
  return units.filter(filter).map((unit) => {
    let categories: Category[] | undefined;

    if (unit.subjectcategories && unit.subjectcategories.length > 0) {
      categories = unit.subjectcategories.map((cat) => ({
        categoryTitle: cat.title,
      }));
    }

    if (unit.unit_options && unit.unit_options.length > 0) {
      return {
        unitTitle: unit.title,
        unitOrder: unit.order,
        unitOptions: unit.unit_options.map((option) => ({
          unitSlug: option.slug,
          unitTitle: option.title,
        })),
        categories,
      };
    } else {
      return {
        unitSlug: unit.slug,
        unitTitle: unit.title,
        unitOrder: unit.order,
        categories,
      };
    }
  });
}

function formatUnitsForTiers(
  units: Sequence[],
  subject?: string | undefined,
): Tier[] {
  const tiers = units.reduce<Tier[]>((acc, curr) => {
    const { tier_slug: tier } = curr;

    const existing = acc.find((_) => _.tier === tier);

    if (!existing) {
      acc.push({
        tier,
        units: formatUnits(
          units,
          (_: Sequence) =>
            _.tier_slug === tier && (subject ? _.subject === subject : true),
        ),
      });
    }

    return acc;
  }, []);

  return tiers;
}
