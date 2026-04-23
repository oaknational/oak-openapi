import { gql } from 'graphql-request';
import type { GraphQLClient } from 'graphql-request';
import { SequenceView, sequenceView, type Sequence } from '@/lib/owaClient';
import type { Category, Metadata, Thread, UnitSchema } from './types';
import type {
  AdditionalProgrammeFactors,
  ProgrammeFactorOption,
  ProgrammeFactors,
} from '@/lib/handlers/programmeFactors';
import {
  createProgrammeSlug,
  getCanonicalUrlForUnit,
} from '@/lib/canonicalUrls';

export function testIfUnitVariant(slug: string): boolean {
  return /-\d+$/.test(slug);
}

export async function doesUnitExist(
  client: GraphQLClient,
  slug: string,
): Promise<boolean> {
  const query = gql`
    query ($slug: String!) @cached(ttl: 300) {
      ${sequenceView}(where: { slug: { _eq: $slug } }) {
        slug
      }
    }
  `;

  const res: SequenceView = await client.request(query, { slug });

  return res[sequenceView].length > 0;
}

export interface RootUnitData {
  unitTitle: string;
  canonicalUrl: string;
  notes: string;
  threads: Thread[];
  priorKnowledgeRequirements: string[];
  nationalCurriculumContent: string[];
  categories: Category[] | undefined;
  programmeFactors?: ProgrammeFactors;
  additionalProgrammeFactors?: AdditionalProgrammeFactors;
}

// Extracts the programme-factor values (examBoard/pathway/tier) that identify
// which variant of the sequence this is. Returns undefined when none apply.
function getProgrammeFactorsFromSequence(
  sequence: Sequence,
): ProgrammeFactors | undefined {
  const factors: ProgrammeFactors = {
    examBoard:
      sequence.examboard_slug && sequence.examboard
        ? { slug: sequence.examboard_slug, title: sequence.examboard }
        : undefined,
    pathway:
      sequence.pathway_slug && sequence.pathway
        ? { slug: sequence.pathway_slug, title: sequence.pathway }
        : undefined,
    tier:
      sequence.tier_slug && sequence.tier
        ? { slug: sequence.tier_slug, title: sequence.tier }
        : undefined,
  };

  return Object.values(factors).some(Boolean) ? factors : undefined;
}

export function formatUnitSummary(
  slug: string,
  sequenceData: Sequence,
  additionalProgrammeFactors?: AdditionalProgrammeFactors,
): UnitSchema {
  const isUnitVariant = testIfUnitVariant(slug);

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

  if (typeof sequenceData.prior_knowledge_requirements === 'string') {
    try {
      sequenceData.prior_knowledge_requirements = JSON.parse(
        sequenceData.prior_knowledge_requirements,
      ) as string[];
    } catch {
      // nop
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

  const programmeSlug = createProgrammeSlug(
    sequenceData.subject_slug,
    sequenceData.keystage_slug,
    sequenceData.examboard_slug,
    sequenceData.tier_slug,
    sequenceData.pathway_slug,
  );

  // we populate from the sequence view
  const root: RootUnitData = {
    unitTitle: sequenceData.title,
    canonicalUrl: programmeSlug
      ? getCanonicalUrlForUnit(slug, programmeSlug)
      : sequenceData.canonicalUrl || '',
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
    programmeFactors: getProgrammeFactorsFromSequence(sequenceData),
    additionalProgrammeFactors,
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

  if (sequenceData.pathway) {
    metadata.pathway = sequenceData.pathway;
    metadata.pathwaySlug = sequenceData.pathway_slug;
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

    metadata.unitOptionGroup = sequenceData.unitOptionGroup;
  }

  // add the tier if it's there
  if (sequenceData.tier_slug) {
    metadata.tier = {
      tierSlug: sequenceData.tier_slug,
      tierTitle: sequenceData.tier,
    };
  }

  if (sequenceData.subject_parent !== sequenceData.subject) {
    metadata.examSubjects = [
      {
        examSubjectSlug: sequenceData.subject_slug,
        examSubjectTitle: sequenceData.subject,
      },
    ];
  }

  return {
    unitSlug: slug,
    ...root,
    ...metadata,
  };
}

// localeCompare helper that treats null/undefined as "less than" any string,
// so sequences missing a programme factor sort before those that have one.
function compareNullableStrings(
  a: string | null | undefined,
  b: string | null | undefined,
): number {
  if (!a && !b) {
    return 0;
  }

  if (!a) {
    return -1;
  }

  if (!b) {
    return 1;
  }

  return a.localeCompare(b);
}

// Deterministic sort for sequences sharing a unit slug: orders by examBoard,
// then pathway, then tier, then slug — giving the caller a stable pick order
// when multiple programme variants match.
export function sortSequencesByProgrammeSpecificity(
  a: Sequence,
  b: Sequence,
): number {
  return (
    compareNullableStrings(a.examboard_slug, b.examboard_slug) ||
    compareNullableStrings(a.pathway_slug, b.pathway_slug) ||
    compareNullableStrings(a.tier_slug, b.tier_slug) ||
    a.slug.localeCompare(b.slug)
  );
}

// Narrows a list of sequences to those matching the supplied programme-factor
// filters. Used to disambiguate when a single unit slug has multiple variants.
export function filterSequencesByProgrammeFactors(
  sequences: Sequence[],
  filters: {
    examBoard?: string;
    pathway?: string;
    tier?: string;
  },
): Sequence[] {
  return sequences.filter((sequence) => {
    if (filters.examBoard && sequence.examboard_slug !== filters.examBoard) {
      return false;
    }

    if (filters.pathway && sequence.pathway_slug !== filters.pathway) {
      return false;
    }

    if (filters.tier && sequence.tier_slug !== filters.tier) {
      return false;
    }

    return true;
  });
}

// Collects the distinct slug/title pairs for a single programme factor across
// the given sequences, excluding the slug of the currently-picked variant so
// we only list alternatives the caller could switch to. Returns undefined
// when no alternatives remain.
function collectProgrammeFactorOptions(
  sequences: Sequence[],
  factor: {
    slug: keyof Pick<Sequence, 'examboard_slug' | 'pathway_slug' | 'tier_slug'>;
    title: keyof Pick<Sequence, 'examboard' | 'pathway' | 'tier'>;
  },
  currentSlug?: string | null,
): ProgrammeFactorOption[] | undefined {
  const distinct = new Map<string, ProgrammeFactorOption>();

  for (const sequence of sequences) {
    const slug = sequence[factor.slug];
    const title = sequence[factor.title];

    if (!slug || !title || slug === currentSlug || distinct.has(slug)) {
      continue;
    }

    distinct.set(slug, {
      slug,
      title,
    });
  }

  const values = Array.from(distinct.values()).sort((a, b) =>
    a.slug.localeCompare(b.slug),
  );

  return values.length > 0 ? values : undefined;
}

// Surfaces the programme-factor choices a caller could switch to for a unit
// slug (e.g. other exam boards, tiers). The current variant's own factors are
// excluded so the list only contains alternatives.
export function getAdditionalProgrammeFactors(
  sequences: Sequence[],
  current?: Sequence,
): AdditionalProgrammeFactors | undefined {
  const examBoards = collectProgrammeFactorOptions(
    sequences,
    { slug: 'examboard_slug', title: 'examboard' },
    current?.examboard_slug,
  );
  const pathways = collectProgrammeFactorOptions(
    sequences,
    { slug: 'pathway_slug', title: 'pathway' },
    current?.pathway_slug,
  );
  const tiers = collectProgrammeFactorOptions(
    sequences,
    { slug: 'tier_slug', title: 'tier' },
    current?.tier_slug,
  );

  if (!examBoards && !pathways && !tiers) {
    return undefined;
  }

  return {
    examBoards,
    pathways,
    tiers,
  };
}
