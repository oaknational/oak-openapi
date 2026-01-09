import {
  phaseSlugs,
  keystageSlugs,
  keystageDescriptions,
  subjectSlugs,
  subjects as subjectSchema,
  examboardSlugs,
  pathwaySlugs,
} from '@oaknational/oak-curriculum-schema';

export const phases = Object.keys(phaseSlugs.options);
export const keystages = Object.keys(keystageSlugs.options);
export const keystageTitles = Object.keys(keystageDescriptions.options);
export const subjects = Object.keys(subjectSlugs.options);
export const subjectTitles = Object.keys(subjectSchema.options);
export const examBoards = Object.keys(examboardSlugs.options);
export const pathways = Object.keys(pathwaySlugs.options);
export const ks4Options = [...examBoards, ...pathways];
