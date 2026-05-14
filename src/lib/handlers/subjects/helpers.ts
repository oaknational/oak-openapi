import type {
  SequenceView,
  SubjectPhase,
  SubjectPhaseView,
} from '@/lib/owaClient';
import type { Ks4ProgrammeFactors, SequenceResult } from './types';
import {
  getClient,
  gql,
  sequenceView,
  sequenceViewWhereInput,
  subjectPhaseView,
  currentCycle,
} from '@/lib/owaClient';
import { TRPCError } from '@trpc/server';
import { examBoards, pathways, tiers } from '@/lib/oakConsts';

export function phaseToSequences(subject: SubjectPhase): SequenceResult[] {
  const keyStageLookup: Record<string, string[]> = {
    primary: ['ks1', 'ks2'],
    secondary: ['ks3', 'ks4'],
  };
  const sequences = subject.phases.reduce(
    (acc: SequenceResult[], { slug, title }) => {
      if (
        slug === 'secondary' &&
        subject.ks4_options &&
        subject.ks4_options.length
      ) {
        const keyStages = phaseToKeyStages(subject).filter((_) =>
          keyStageLookup[slug].includes(_.keyStageSlug),
        );
        acc.push(
          ...subject.ks4_options.map((examBoard) => ({
            sequenceSlug: `${subject.slug}-${slug}-${examBoard.slug}`,
            years: yearsFromKeyStages(keyStages),
            keyStages,
            phaseSlug: slug,
            phaseTitle: title,
            ks4Options: examBoard,
          })),
        );
      } else {
        const keyStages = phaseToKeyStages(subject).filter((_) =>
          keyStageLookup[slug].includes(_.keyStageSlug),
        );
        acc.push({
          sequenceSlug: `${subject.slug}-${slug}`,
          years: yearsFromKeyStages(keyStages),
          keyStages,
          phaseSlug: slug,
          phaseTitle: title,
          ks4Options: null,
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

export async function getKs4ProgrammeFactors(
  subject: SubjectPhase,
): Promise<Ks4ProgrammeFactors> {
  const examBoardOptions = (subject.ks4_options ?? []).filter((option) =>
    examBoards.includes(option.slug),
  );
  const pathwayOptions = (subject.ks4_options ?? []).filter((option) =>
    pathways.includes(option.slug),
  );
  const tierOptions = await getKs4TierOptions(subject);

  const factors: Ks4ProgrammeFactors = {};

  if (examBoardOptions.length > 0) {
    factors.examBoard = examBoardOptions;
  }
  if (pathwayOptions.length > 0) {
    factors.pathway = pathwayOptions;
  }
  if (tierOptions.length > 0) {
    factors.tier = tierOptions;
  }

  return factors;
}

async function getKs4TierOptions(subject: SubjectPhase) {
  const hasKeyStage4 = subject.keystages.some(({ slug }) => slug === 'ks4');

  if (!hasKeyStage4) {
    return [];
  }

  const client = getClient();
  const query = gql`
    query ($where: ${sequenceViewWhereInput}!) @cached(ttl: 300) {
      ${sequenceView}(
        where: $where
        order_by: { tier_slug: asc }
      ) {
        tier
        tier_slug
      }
    }`;

  const res: SequenceView = await client.request(query, {
    where: {
      _and: [
        {
          _or: [
            { subject_slug: { _eq: subject.slug } },
            { subject_parent_slug: { _eq: subject.slug } },
          ],
        },
        { phase_slug: { _eq: 'secondary' } },
        { keystage_slug: { _eq: 'ks4' } },
        { state: { _eq: 'published' } },
        { non_curriculum: { _eq: false } },
      ],
    },
  });

  const tierLookup = new Map<string, { title: string; slug: string }>();

  for (const row of res[sequenceView]) {
    if (row.tier_slug && row.tier && tiers.includes(row.tier_slug)) {
      tierLookup.set(row.tier_slug, {
        title: row.tier,
        slug: row.tier_slug,
      });
    }
  }

  return Array.from(tierLookup.values());
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
