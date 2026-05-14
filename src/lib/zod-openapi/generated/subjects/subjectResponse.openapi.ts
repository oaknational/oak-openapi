import { subjectResult } from '@/lib/handlers/subjects/types';

export const subjectResponseOpenAPISchema = subjectResult.meta({
  id: 'SubjectResponseSchema',
  example: {
    subjectTitle: 'Science',
    subjectSlug: 'science',
    sequenceSlugs: [
      {
        sequenceSlug: 'science-primary',
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
        sequenceSlug: 'science-secondary-aqa',
        years: [7, 8, 9, 10, 11],
        keyStages: [
          { keyStageTitle: 'Key Stage 3', keyStageSlug: 'ks3' },
          { keyStageTitle: 'Key Stage 4', keyStageSlug: 'ks4' },
        ],
        phaseSlug: 'secondary',
        phaseTitle: 'Secondary',
        ks4Options: {
          title: 'AQA',
          slug: 'aqa',
        },
      },
      {
        sequenceSlug: 'science-secondary-edexcel',
        years: [7, 8, 9, 10, 11],
        keyStages: [
          { keyStageTitle: 'Key Stage 3', keyStageSlug: 'ks3' },
          { keyStageTitle: 'Key Stage 4', keyStageSlug: 'ks4' },
        ],
        phaseSlug: 'secondary',
        phaseTitle: 'Secondary',
        ks4Options: {
          title: 'Edexcel',
          slug: 'edexcel',
        },
      },
      {
        sequenceSlug: 'science-secondary-ocr',
        years: [7, 8, 9, 10, 11],
        keyStages: [
          { keyStageTitle: 'Key Stage 3', keyStageSlug: 'ks3' },
          { keyStageTitle: 'Key Stage 4', keyStageSlug: 'ks4' },
        ],
        phaseSlug: 'secondary',
        phaseTitle: 'Secondary',
        ks4Options: {
          title: 'OCR',
          slug: 'ocr',
        },
      },
    ],
    years: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    keyStages: [
      { keyStageTitle: 'Key Stage 1', keyStageSlug: 'ks1' },
      { keyStageTitle: 'Key Stage 2', keyStageSlug: 'ks2' },
      { keyStageTitle: 'Key Stage 3', keyStageSlug: 'ks3' },
      { keyStageTitle: 'Key Stage 4', keyStageSlug: 'ks4' },
    ],
    ks4ProgrammeFactors: {
      examBoard: [
        {
          title: 'AQA',
          slug: 'aqa',
        },
        {
          title: 'Edexcel',
          slug: 'edexcel',
        },
        {
          title: 'OCR',
          slug: 'ocr',
        },
      ],
      tier: [
        {
          title: 'Foundation',
          slug: 'foundation',
        },
        {
          title: 'Higher',
          slug: 'higher',
        },
      ],
    },
  },
});
