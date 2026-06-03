import { subjectSlugs } from '@/lib/keyStageAndSubjects';
import * as z from 'zod/v4';

export const allSubjectsResponseOpenAPISchema = z
  .array(z.enum(subjectSlugs as [string]))
  .meta({
    id: 'AllSubjectsResponseSchema',
    example: ['art', 'computing', 'english'],
  });
