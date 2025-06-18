import 'zod-openapi/extend';
import { z } from 'zod';
import { sequenceResult } from '@/lib/handlers/subjects/types';

export const subjectSequenceResponseOpenAPISchema = z
  .array(sequenceResult)
  .openapi({
    example: [
      {
        sequenceSlug: 'art-primary',
        years: [1, 2, 3, 4, 5, 6],
        keyStages: [
          { keyStageTitle: 'Key Stage 1', keyStageSlug: 'ks1' },
          { keyStageTitle: 'Key Stage 2', keyStageSlug: 'ks2' },
        ],
        phaseSlug: 'primary',
        phaseTitle: 'Primary',
        ks4Options: null,
      },
      {
        sequenceSlug: 'art-secondary',
        years: [1, 2, 3, 4, 5, 6],
        keyStages: [
          { keyStageTitle: 'Key Stage 1', keyStageSlug: 'ks1' },
          { keyStageTitle: 'Key Stage 2', keyStageSlug: 'ks2' },
        ],
        phaseSlug: 'secondary',
        phaseTitle: 'Secondary',
        ks4Options: null,
      },
    ],
    ref: 'SubjectSequenceResponseSchema',
  });
