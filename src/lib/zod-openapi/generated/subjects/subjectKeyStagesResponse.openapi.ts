import 'zod-openapi/extend';
import { keyStagesResult } from '@/lib/handlers/subjects/types';

export const subjectKeyStagesResponseOpenAPISchema = keyStagesResult
  .openapi({
    description:
      'The key stage slug identifiers for which this subject has content available for',
  })
  .openapi({
    example: [
      { keyStageTitle: 'Key Stage 1', keyStageSlug: 'ks1' },
      { keyStageTitle: 'Key Stage 2', keyStageSlug: 'ks2' },
      { keyStageTitle: 'Key Stage 3', keyStageSlug: 'ks3' },
      { keyStageTitle: 'Key Stage 4', keyStageSlug: 'ks4' },
    ],
    ref: 'SubjectKeyStagesResponseSchema',
  });
