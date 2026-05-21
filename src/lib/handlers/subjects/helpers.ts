import type {
  SubjectPhase,
  SubjectPhaseView,
  SyntheticProgrammeByYear,
  SyntheticProgrammeFields,
  SyntheticProgrammesByYearView,
} from '@/lib/owaClient';
import type {
  Ks4ProgrammeFactors,
  SequenceResult,
  SubjectResult,
} from './types';
import {
  getClient,
  gql,
  programmesByYearView,
  subjectPhaseView,
  currentCycle,
} from '@/lib/owaClient';
import { TRPCError } from '@trpc/server';
import { examBoards, pathways, tiers } from '@/lib/oakConsts';
import { subjectTitleForSlug } from '@/lib/keyStageAndSubjects';

export function phaseToSequences(subject: SubjectPhase): SequenceResult[] {
  const keyStageLookup: Record<string, string[]> = {
    primary: ['ks1', 'ks2'],
    secondary: ['ks3', 'ks4'],
  };
  const sequences = subject.phases.reduce(
    (acc: SequenceResult[], { slug, title }) => {
      const keyStages = phaseToKeyStages(subject).filter((_) =>
        keyStageLookup[slug].includes(_.keyStageSlug),
      );
      if (
        slug === 'secondary' &&
        subject.ks4_options &&
        subject.ks4_options.length
      ) {
        acc.push(
          ...subject.ks4_options.map((examBoard) => ({
            sequenceSlug: `${subject.slug}-${slug}-${examBoard.slug}`,
            years: yearsFromKeyStages(keyStages),
            keyStages,
            phaseSlug: slug,
            phaseTitle: title,
          })),
        );
      } else {
        acc.push({
          sequenceSlug: `${subject.slug}-${slug}`,
          years: yearsFromKeyStages(keyStages),
          keyStages,
          phaseSlug: slug,
          phaseTitle: title,
        });
      }

      return acc;
    },
    [] as SequenceResult[],
  );

  return sequences;
}

interface KeyStageResponse {
  keyStageSlug: string;
  keyStageTitle: string;
}

export function phaseToKeyStages(subject: SubjectPhase): KeyStageResponse[] {
  return subject.keystages.map(({ slug, title }) => {
    return { keyStageSlug: slug, keyStageTitle: title };
  });
}

export function yearsFromKeyStages(
  keyStages: { keyStageSlug: string; keyStageTitle: string }[],
): number[] {
  const years = keyStages.reduce((acc: number[], { keyStageSlug }) => {
    switch (keyStageSlug) {
      case 'ks1':
        acc.push(1, 2);
        break;
      case 'ks2':
        acc.push(3, 4, 5, 6);
        break;
      case 'ks3':
        acc.push(7, 8, 9);
        break;
      case 'ks4':
        acc.push(10, 11);
        break;
    }
    return acc;
  }, []);

  // RS we don't support this yet, because there's no endpoint to consume the value
  // if (years.length === 11) {
  //   years.push('all-years');
  // }

  return years;
}

/**
 * Build the full `/subjects/{subject}` response from
 * `published_mv_synthetic_programmes_by_year_18_2_0`.
 *
 * The MV returns one row per programme-by-year (with separate rows per
 * examboard/pathway variant at KS4). We dedupe across years to assemble the
 * subject-level summary, and group by phase + ks4 option (examboard or
 * pathway) to build sequenceSlugs, matching the existing API contract.
 */
export async function getSubjectFromProgrammes(
  subject: string,
): Promise<SubjectResult> {
  if (subject === 'financial-education') {
    throw new TRPCError({ message: 'Subject not found', code: 'NOT_FOUND' });
  }

  const client = getClient();
  // The MV stores child subjects (e.g. biology/chemistry under science) as
  // standalone rows whose `programme_fields.subject_parent` carries the
  // parent's display title — but no `subject_parent_slug`. So when the
  // request is for a parent subject we also match on that title, which is
  // resolved from the subject slug via the curriculum data.
  const parentTitle = subjectTitleForSlug(subject);
  const query = gql`
    query ($subjectMatch: jsonb!, $parentMatch: jsonb!) @cached(ttl: 300) {
      ${programmesByYearView}(
        where: {
          _or: [
            { programme_fields: { _contains: $subjectMatch } }
            { programme_fields: { _contains: $parentMatch } }
          ]
          is_legacy: { _eq: false }
        }
      ) {
        programme_slug
        programme_fields
      }
    }`;

  const res: SyntheticProgrammesByYearView = await client.request(query, {
    subjectMatch: { subject_slug: subject },
    // For non-parent subjects no row carries this `subject_parent` value, so
    // the clause is a harmless no-op rather than over-fetching.
    parentMatch: { subject_parent: parentTitle ?? '' },
  });

  const rows: SyntheticProgrammeByYear[] = res[programmesByYearView] ?? [];

  if (rows.length === 0) {
    throw new TRPCError({ message: 'Subject not found', code: 'NOT_FOUND' });
  }

  // Prefer a row where the subject is directly the requested one for the
  // display title; otherwise fall back to the parent name surfaced on a
  // child row.
  const parentRow = rows.find(
    (r) => r.programme_fields.subject_slug === subject,
  );
  const childWithParent = rows.find((r) => r.programme_fields.subject_parent);
  const subjectTitle =
    parentRow?.programme_fields.subject ??
    childWithParent?.programme_fields.subject_parent ??
    rows[0].programme_fields.subject;
  const subjectSlug = subject;

  const keyStages = uniqueKeyStages(rows);
  const years = uniqueYears(rows);
  const sequenceSlugs = buildSequenceSlugs(rows, subjectSlug);
  const ks4ProgrammeFactors = buildKs4ProgrammeFactors(rows);

  return {
    subjectTitle,
    subjectSlug,
    sequenceSlugs,
    keyStages,
    years,
    ks4ProgrammeFactors,
  };
}

/**
 * The slug suffix used to distinguish KS4 sequences within a phase.
 * Examboard wins over pathway when both are present on a KS4 row.
 */
function ks4OptionFor(
  fields: SyntheticProgrammeFields,
): { slug: string; order: number | null } | null {
  if (fields.keystage_slug !== 'ks4') {
    return null;
  }
  if (fields.examboard_slug) {
    return {
      slug: fields.examboard_slug,
      order: fields.examboard_display_order,
    };
  }
  if (fields.pathway_slug) {
    return {
      slug: fields.pathway_slug,
      order: fields.pathway_display_order,
    };
  }
  return null;
}

function uniqueKeyStages(
  rows: SyntheticProgrammeByYear[],
): { keyStageSlug: string; keyStageTitle: string }[] {
  const map = new Map<
    string,
    { slug: string; title: string; order: number | null }
  >();
  for (const { programme_fields: f } of rows) {
    if (!map.has(f.keystage_slug)) {
      map.set(f.keystage_slug, {
        slug: f.keystage_slug,
        title: f.keystage_description,
        order: f.keystage_display_order,
      });
    }
  }
  return Array.from(map.values())
    .sort(byOrderThenSlug)
    .map(({ slug, title }) => ({
      keyStageSlug: slug,
      keyStageTitle: title,
    }));
}

function uniqueYears(rows: SyntheticProgrammeByYear[]): number[] {
  const map = new Map<number, { year: number; order: number | null }>();
  for (const { programme_fields: f } of rows) {
    const year = yearAsNumber(f);
    if (year === null || map.has(year)) {
      continue;
    }
    map.set(year, { year, order: f.year_display_order });
  }
  return Array.from(map.values())
    .sort((a, b) => orderOr(a.order, a.year) - orderOr(b.order, b.year))
    .map((_) => _.year);
}

function yearAsNumber(fields: SyntheticProgrammeFields): number | null {
  if (typeof fields.year_id === 'number') {
    return fields.year_id;
  }
  const parsed = Number.parseInt(fields.year, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function buildSequenceSlugs(
  rows: SyntheticProgrammeByYear[],
  subjectSlug: string,
): SequenceResult[] {
  // Group rows by phase, then within each phase by the KS4 variant slug used
  // as the sequence-slug suffix (examboard or pathway).
  const phases = new Map<
    string,
    {
      phaseSlug: string;
      phaseTitle: string;
      phaseOrder: number | null;
      rows: SyntheticProgrammeByYear[];
      variants: Map<string, { slug: string; order: number | null }>;
    }
  >();

  for (const row of rows) {
    const f = row.programme_fields;
    let phase = phases.get(f.phase_slug);
    if (!phase) {
      phase = {
        phaseSlug: f.phase_slug,
        phaseTitle: f.phase,
        phaseOrder: f.phase_display_order,
        rows: [],
        variants: new Map(),
      };
      phases.set(f.phase_slug, phase);
    }
    phase.rows.push(row);

    const variant = ks4OptionFor(f);
    if (variant && !phase.variants.has(variant.slug)) {
      phase.variants.set(variant.slug, variant);
    }
  }

  const sortedPhases = Array.from(phases.values()).sort(
    (a, b) =>
      orderOr(a.phaseOrder, 0) - orderOr(b.phaseOrder, 0) ||
      a.phaseSlug.localeCompare(b.phaseSlug),
  );

  const results: SequenceResult[] = [];

  for (const phase of sortedPhases) {
    if (phase.variants.size === 0) {
      results.push({
        sequenceSlug: `${subjectSlug}-${phase.phaseSlug}`,
        years: uniqueYears(phase.rows),
        keyStages: uniqueKeyStages(phase.rows),
        phaseSlug: phase.phaseSlug,
        phaseTitle: phase.phaseTitle,
      });
      continue;
    }

    const nonKs4Rows = phase.rows.filter(
      (_) => _.programme_fields.keystage_slug !== 'ks4',
    );
    const sortedVariants = Array.from(phase.variants.values()).sort(
      byOrderThenSlug,
    );

    for (const variant of sortedVariants) {
      const matchingKs4Rows = phase.rows.filter((row) => {
        const v = ks4OptionFor(row.programme_fields);
        return v?.slug === variant.slug;
      });
      const sequenceRows = [...nonKs4Rows, ...matchingKs4Rows];
      results.push({
        sequenceSlug: `${subjectSlug}-${phase.phaseSlug}-${variant.slug}`,
        years: uniqueYears(sequenceRows),
        keyStages: uniqueKeyStages(sequenceRows),
        phaseSlug: phase.phaseSlug,
        phaseTitle: phase.phaseTitle,
      });
    }
  }

  return results;
}

function buildKs4ProgrammeFactors(
  rows: SyntheticProgrammeByYear[],
): Ks4ProgrammeFactors {
  const examBoardMap = new Map<
    string,
    { title: string; slug: string; order: number | null }
  >();
  const pathwayMap = new Map<
    string,
    { title: string; slug: string; order: number | null }
  >();
  const tierMap = new Map<
    string,
    { title: string; slug: string; order: number | null }
  >();
  // A child subject row carries the parent's display name on `subject_parent`.
  // Distinct (subject_slug, subject) pairs across those rows give us the
  // childSubject options (biology/chemistry/… under science).
  const childSubjectMap = new Map<
    string,
    { title: string; slug: string; order: number | null }
  >();

  for (const { programme_fields: f } of rows) {
    if (f.keystage_slug !== 'ks4') {
      continue;
    }
    if (
      f.subject_parent &&
      f.subject_slug &&
      f.subject &&
      !childSubjectMap.has(f.subject_slug)
    ) {
      childSubjectMap.set(f.subject_slug, {
        title: f.subject,
        slug: f.subject_slug,
        order: f.subject_display_order,
      });
    }
    if (
      f.examboard_slug &&
      f.examboard &&
      examBoards.includes(f.examboard_slug) &&
      !examBoardMap.has(f.examboard_slug)
    ) {
      examBoardMap.set(f.examboard_slug, {
        title: f.examboard,
        slug: f.examboard_slug,
        order: f.examboard_display_order,
      });
    }
    if (
      f.pathway_slug &&
      f.pathway &&
      pathways.includes(f.pathway_slug) &&
      !pathwayMap.has(f.pathway_slug)
    ) {
      pathwayMap.set(f.pathway_slug, {
        title: f.pathway,
        slug: f.pathway_slug,
        order: f.pathway_display_order,
      });
    }
    if (
      f.tier_slug &&
      f.tier &&
      tiers.includes(f.tier_slug) &&
      !tierMap.has(f.tier_slug)
    ) {
      tierMap.set(f.tier_slug, {
        title: f.tier,
        slug: f.tier_slug,
        order: f.tier_display_order,
      });
    }
  }

  const factors: Ks4ProgrammeFactors = {};
  if (examBoardMap.size > 0) {
    factors.examBoard = Array.from(examBoardMap.values())
      .sort(byOrderThenSlug)
      .map(({ title, slug }) => ({ title, slug }));
  }
  if (pathwayMap.size > 0) {
    factors.pathway = Array.from(pathwayMap.values())
      .sort(byOrderThenSlug)
      .map(({ title, slug }) => ({ title, slug }));
  }
  if (tierMap.size > 0) {
    factors.tier = Array.from(tierMap.values())
      .sort(byOrderThenSlug)
      .map(({ title, slug }) => ({ title, slug }));
  }
  if (childSubjectMap.size > 0) {
    factors.childSubject = Array.from(childSubjectMap.values())
      .sort(byOrderThenSlug)
      .map(({ title, slug }) => ({ title, slug }));
  }
  return factors;
}

function byOrderThenSlug(
  a: { slug: string; order: number | null },
  b: { slug: string; order: number | null },
): number {
  const diff = orderOr(a.order, 0) - orderOr(b.order, 0);
  return diff !== 0 ? diff : a.slug.localeCompare(b.slug);
}

function orderOr(order: number | null, fallback: number): number {
  return order ?? fallback;
}

export async function getSubjectPhase(subject: string): Promise<SubjectPhase> {
  const client = getClient();
  const query = gql`
  query ($subject: String!, $currentCycle: String!) @cached(ttl: 300) {
    ${subjectPhaseView}(
      where: {
        cycle: { _eq: $currentCycle }
        slug: { _eq: $subject }
        _not: {slug: {_eq: "financial-education"}}
      }
    ) {
      title
      slug
      keystages
      phases
      ks4_options
      display_order
    }
  }`;

  const res: SubjectPhaseView = await client.request(query, {
    currentCycle,
    subject,
  });

  if (
    !res ||
    !Array.isArray(res[subjectPhaseView]) ||
    res[subjectPhaseView].length === 0
  ) {
    throw new TRPCError({
      message: 'Subject not found',
      code: 'NOT_FOUND',
    });
  }

  if (res[subjectPhaseView].length !== 1) {
    throw new TRPCError({
      message: `There was a problem requesting ${subject}, more than one result was returned`,
      code: 'INTERNAL_SERVER_ERROR',
    });
  }

  return res[subjectPhaseView][0];
}
