import {
  phaseSlugs,
  keystageSlugs,
  keystageDescriptions,
  subjectSlugs,
  subjects as subjectSchema,
  examboardSlugs,
  pathwaySlugs,
} from '@oaknational/oak-curriculum-schema';

export const phases: string[] = phaseSlugs.options;
export const keystages: string[] = keystageSlugs.options;
export const keystageTitles: string[] = keystageDescriptions.options;
export const subjects: string[] = subjectSlugs.options;
export const subjectTitles: string[] = subjectSchema.options;
export const examBoards: string[] = examboardSlugs.options;
export const pathways: string[] = pathwaySlugs.options;
export const ks4Options = [...examBoards, ...pathways];

export const keyStageToPhaseMap: Record<string, string> = {
  ks1: 'primary',
  ks2: 'primary',
  ks3: 'secondary',
  ks4: 'secondary',
};
