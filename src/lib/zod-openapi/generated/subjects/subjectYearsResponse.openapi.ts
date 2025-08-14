import 'zod-openapi/extend';
import { numberArrayResult } from '@/lib/handlers/subjects/types';

export const subjectYearsResponseOpenAPISchema = numberArrayResult
  .openapi({
    example: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    description: 'The years for which this sequence has content available for',
  })
  .openapi({
    ref: 'SubjectYearsResponseSchema',
    example: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  });
