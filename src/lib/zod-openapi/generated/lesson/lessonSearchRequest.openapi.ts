import 'zod-openapi/extend';
import { z } from 'zod';
import { keyStageSlugs, subjectSlugs } from '@/lib/keyStageAndSubjects';

export const lessonSearchRequestOpenAPISchema = z
  .object({
    q: z.string(),
    keyStage: z
      .enum(keyStageSlugs as [string], {
        description:
          "Key stage slug to filter by, e.g. 'ks2' - note that casing is important here, and should be lowercase",
      })
      .optional(),
    subject: z
      .enum(subjectSlugs as [string], {
        description:
          "Subject slug to filter by, e.g. 'english' - note that casing is important here, and should be lowercase",
      })
      .optional(),
    unit: z
      .string({
        description: 'Optional unit slug to additionally filter by',
      })
      .optional(),
  })
  .openapi({
    example: { q: 'gothic', subject: 'english' },
    ref: 'LessonSearchRequestSchema',
  });
