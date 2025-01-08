import { ks4Options, phases, subjects } from './oakConsts';

export type CurriculumSelectionSlugs = {
  phaseSlug: string;
  subjectSlug: string;
  ks4OptionSlug: string | null;
};

// modified from https://github.com/oaknational/Oak-Web-Application/blob/4fb366fbaa4d9cb3187a682ad9d4eb292db89db1/src/utils/curriculum/slugs.ts#L10-L33
export const parseSubjectPhaseSlug = (
  slug: string,
): CurriculumSelectionSlugs => {
  const parts = slug.split('-');

  const phaseIndex = parts.findIndex((part) => phases.includes(part));

  if (phaseIndex === -1) {
    throw new Error("Invalid slug, must include 'primary' or 'secondary'");
  }

  const res = {
    phaseSlug: parts[phaseIndex],
    subjectSlug: parts.slice(0, phaseIndex).join('-'),
    ks4OptionSlug: parts[phaseIndex + 1] ?? null,
  };

  // validate the subject and ks4 options
  if (!subjects.includes(res.subjectSlug)) {
    throw new Error(`Invalid subject: ${res.subjectSlug}`);
  }

  if (res.ks4OptionSlug && !ks4Options.includes(res.ks4OptionSlug)) {
    throw new Error(`Invalid exam board: ${res.ks4OptionSlug}`);
  }

  return res;
};
