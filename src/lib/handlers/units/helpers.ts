import { gql } from 'graphql-request';
import type { GraphQLClient } from 'graphql-request';
import { SequenceView, sequenceView, type Sequence } from '@/lib/owaClient';
import type { Category, Metadata, Thread, UnitSchema } from './types';

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

export function formatUnitSummary(
  slug: string,
  sequenceData: Sequence,
): UnitSchema {
  const isUnitVariant = testIfUnitVariant(slug);
  interface RootUnitData {
    unitTitle: string;
    notes: string;
    threads: Thread[];
    priorKnowledgeRequirements: string[];
    nationalCurriculumContent: string[];
    categories: Category[] | undefined;
  }

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
