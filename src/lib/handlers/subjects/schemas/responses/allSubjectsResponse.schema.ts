import { subjectResult } from '@/lib/handlers/subjects/types';
import * as z from 'zod/v4';

export const allSubjectsResponseSchema = z.array(subjectResult);

export type SubjectsResult = z.infer<typeof allSubjectsResponseSchema>;
