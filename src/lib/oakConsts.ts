import schema from '@oaknational/oak-curriculum-schema';

export const phases = Object.keys(schema.phaseSlugs.Values);
export const keystages = Object.keys(schema.keystageSlugs.Values);
export const keystageTitles = Object.keys(schema.keystageDescriptions.Values);
export const subjects = Object.keys(schema.subjectSlugs.Values);
export const subjectTitles = Object.keys(schema.subjects.Values);
export const examBoards = Object.keys(schema.examboardSlugs.Values);
export const pathways = Object.keys(schema.pathwaySlugs.Values);
export const ks4Options = [...examBoards, ...pathways];
