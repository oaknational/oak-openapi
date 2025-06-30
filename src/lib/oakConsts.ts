import {
  phaseSlugs,
  keystageSlugs,
  keystageDescriptions,
  subjectSlugs,
  subjects as subjectSchema,
  examboardSlugs,
  pathwaySlugs,
} from '@oaknational/oak-curriculum-schema';

export const phases = Object.keys(phaseSlugs.Values);
export const keystages = Object.keys(keystageSlugs.Values);
export const keystageTitles = Object.keys(keystageDescriptions.Values);
export const subjects = Object.keys(subjectSlugs.Values);
export const subjectTitles = Object.keys(subjectSchema.Values);
export const examBoards = Object.keys(examboardSlugs.Values);
export const pathways = Object.keys(pathwaySlugs.Values);
export const ks4Options = [...examBoards, ...pathways];
