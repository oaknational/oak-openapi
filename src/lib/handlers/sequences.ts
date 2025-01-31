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
import slugify from 'slugify';
import { blockedSequenceSubjects } from '../blockedContent';
import { TRPCError } from '@trpc/server';

toSorted.shim();

type UnitFromDb = {
  title: string;
  slug: string;
  order: number;
};

const input = z.object({
  sequence: z.string(),
  year: z.number().optional(),
});

const unitEntity = z.object({
  unitTitle: z.string(),
  unitSlug: z.string(),
});

// unitNoOptions combines unitParent and unitEntity but not as a union
const unitNoOptions = z.object({
  unitSlug: z.string(),
  unitTitle: z.string(),
  unitOrder: z.number(),
});

// unitOptions is unitParent + unitEntity[] (as unitOption property)
const unitOptions = z.object({
  unitTitle: z.string(),
  unitOrder: z.number(),
  unitOptions: z.array(unitEntity),
});

// unitSchema is unitNoOptions or unitOptions
export const unitSchema = z.union([unitNoOptions, unitOptions]);

export type UnitNoOptions = z.infer<typeof unitNoOptions>;
export type UnitOptions = z.infer<typeof unitOptions>;
export type Unit = z.infer<typeof unitSchema>;

const nonSubjectSchema = z.object({
  year: z.number(),
  units: z.array(unitSchema),
});

const subjectSchema = z.object({
  subjectSlug: z.string(),
  subjectTitle: z.string(),
  units: z.array(unitSchema),
});

const tierSchema = z.object({
  tier: z.string(),
  units: z.array(unitSchema),
});

const subjectTiersSchema = z.object({
  subjectSlug: z.string(),
  subjectTitle: z.string(),
  tiers: z.array(tierSchema),
});

const subjectsSchema = z.object({
  year: z.number(),
  subjects: z.array(z.union([subjectSchema, subjectTiersSchema])),
});

const tiersSchema = z.object({
  year: z.number(),
  tiers: z.array(tierSchema),
});

const output = z.array(
  z.union([nonSubjectSchema, subjectsSchema, tiersSchema]),
);

export type SequenceUnits = z.infer<typeof output>;
export type NonSubjectSchema = z.infer<typeof nonSubjectSchema>;
export type SubjectSchema = z.infer<typeof subjectSchema>;
type SubjectTiersSchema = z.infer<typeof subjectTiersSchema>;
type TiersSchema = z.infer<typeof tiersSchema>;

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

function pushUnit(unit: UnitFromDb): Unit {
  const { title, slug, order } = unit;

  return {
    unitTitle: title.trim(),
    unitSlug: slug.trim(),
    unitOrder: order,
  };
}

function mapUnits(units: Sequence[]) {
  return units.reduce<Unit[]>((acc, curr) => {
    if (curr.unit_options.length > 0) {
      const unitOptions = curr.unit_options.map(({ slug, title }) => ({
        unitSlug: slug,
        unitTitle: title,
      }));
      acc.push({
        unitTitle: curr.title,
        unitOrder: curr.order,
        unitOptions,
      });
    } else {
      acc.push(pushUnit(curr as UnitFromDb));
    }

    return acc;
  }, []);
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
      ).sort((a, b) => a - b);

      const subjectSlugToTitle = new Map<string, string>(
        rawData.map((_) => [_.subject_slug, _.subject]),
      );

      const result = [];

      for (const year of years) {
        // reduce down to only the units for this particular year
        const byYear = rawData.filter(
          (unit) => parseInt(unit.year, 10) === year,
        );

        // now check if there's any subject categories
        // if there are, we need to start grouping by subject, and then
        // check for tiers.

        // this isn't ideal, because the subjectcategories field is an array
        // that I'm assuming has a length of 1 (brittle) and then I'm attempting
        // to slugify the title.
        let useSlugMap = true;
        const subjects = new Set(
          byYear
            .filter((unit) => unit.subjectcategories.length > 0)
            .map((unit) => {
              if (unit.subject_parent) {
                return unit.subject_slug;
              }
              useSlugMap = false;
              return unit.subjectcategories[0].title;
            }),
        );

        if (subjects.size === 0) {
          // when there's no subjects for the year, we first check
          // to see if there's tiers (such as maths-secondary), and if so,
          // then we drop into the tiers and group by _that_.

          const tiers = new Set(
            byYear.map((_) => _.tier_slug).filter((_) => _ !== null),
          );

          if (tiers.size > 0) {
            const tierData: TiersSchema = {
              year,
              tiers: Array.from(tiers).map((tier) => {
                return {
                  tier,
                  units: mapUnits(byYear.filter((_) => _.tier_slug === tier)),
                };
              }),
            };

            result.push(tierData);
          } else {
            // otherwise it's a simple and direct line to the units.
            result.push({
              year,
              units: mapUnits(byYear),
            } as NonSubjectSchema);
          }
        } else {
          // otherwise we need to start collecting all the subjects

          const subjectData = (subject: string) => ({
            subjectTitle: useSlugMap
              ? subjectSlugToTitle.get(subject)
              : subject,
            subjectSlug: useSlugMap
              ? subject
              : slugify(subject).toLocaleLowerCase(),
          });

          const res = [];
          for (const subject of subjects) {
            const units = byYear.filter((unit) => {
              if (unit.subject_parent) {
                return unit.subject_slug === subject;
              }

              return (
                unit.subjectcategories.length > 0 &&
                unit.subjectcategories[0].title === subject
              );
            });

            const tiers = new Set(
              units.map((_) => _.tier_slug).filter((_) => _ !== null),
            );

            if (tiers.size > 0) {
              const tierData = Array.from(tiers).map((tier) => {
                return {
                  tier,
                  units: mapUnits(units.filter((_) => _.tier_slug === tier)),
                };
              });

              res.push({
                ...subjectData(subject),
                tiers: tierData, // contains tier + units
              } as SubjectTiersSchema);
            } else {
              res.push({
                ...subjectData(subject),
                units: mapUnits(units),
              } as SubjectSchema);
            }
          }
          result.push({ year, subjects: res });
        }
      }

      if (yearFilter) {
        return result.filter((_) => _.year === yearFilter);
      }

      return result;
    }),
});
