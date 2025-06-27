import { subjectResult } from '@/lib/handlers/subjects/types';
import { z } from 'zod';

export const allSubjectsResponseSchema = z.array(subjectResult);

export type SubjectsResult = z.infer<typeof allSubjectsResponseSchema>;
