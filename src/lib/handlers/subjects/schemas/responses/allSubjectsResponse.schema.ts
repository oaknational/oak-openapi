import { subjectSlugs } from '@/lib/keyStageAndSubjects';
import * as z from 'zod/v4';

export const allSubjectsResponseSchema = z.array(
  z.enum(subjectSlugs as [string]),
);

export type SubjectsResult = z.infer<typeof allSubjectsResponseSchema>;
