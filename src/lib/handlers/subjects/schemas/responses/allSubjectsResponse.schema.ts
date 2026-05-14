import { subjectSummaryResult } from '@/lib/handlers/subjects/types';
import * as z from 'zod/v4';

export const allSubjectsResponseSchema = z.array(subjectSummaryResult);

export type SubjectsResult = z.infer<typeof allSubjectsResponseSchema>;
