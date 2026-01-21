import type { SubjectPhase, SubjectPhaseView } from '@/lib/owaClient';
import type { SequenceResult } from './types';
import {
  getClient,
  gql,
  subjectPhaseView,
  currentCycle,
} from '@/lib/owaClient';
import { TRPCError } from '@trpc/server';

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
