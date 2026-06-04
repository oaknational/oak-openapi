import * as z from 'zod/v4';
import {
  numberArrayResult,
  keyStagesResult,
  ks4ProgrammeFactorsResult,
} from '@/lib/handlers/subjects/types';

export const subjectSequenceResponseOpenAPISchema = z
  .object({
    sequenceSlug: z.string().meta({
      description: 'The unique identifier for each sequence',
    }),
    years: numberArrayResult,
    keyStages: keyStagesResult,
    phaseSlug: z.string().meta({
      description:
        'The unique identifier for the phase to which this sequence belongs',
    }),
    phaseTitle: z.string().meta({
      description: 'The title for the phase to which this sequence belongs',
    }),
    ks4ProgrammeFactors: ks4ProgrammeFactorsResult,
  })
  .meta({
    id: 'SubjectSequenceResponseSchema',
    example: {
      sequenceSlug: 'computing-secondary-core',
      years: [7, 8, 9, 10, 11],
      keyStages: [
        { keyStageTitle: 'Key Stage 3', keyStageSlug: 'ks3' },
        { keyStageTitle: 'Key Stage 4', keyStageSlug: 'ks4' },
      ],
      phaseSlug: 'secondary',
      phaseTitle: 'Secondary',
      ks4ProgrammeFactors: {
        examBoard: [
          { title: 'AQA', slug: 'aqa' },
          { title: 'Edexcel', slug: 'edexcel' },
          { title: 'OCR', slug: 'ocr' },
        ],
        pathway: [{ title: 'Core', slug: 'core' }],
        tier: [
          { title: 'Foundation', slug: 'foundation' },
          { title: 'Higher', slug: 'higher' },
        ],
      },
    },
  });
