import 'zod-openapi/extend';
import { z } from 'zod';
import { keyStageSlugs, subjectSlugs } from '@/lib/keyStageAndSubjects';

export const lessonSearchRequestOpenAPISchema = z.object({
  q: z.string().openapi({
    description: 'Search query text snippet',
    example: 'gothic',
  }),
  keyStage: z
    .enum(keyStageSlugs as [string])
    .openapi({
      description:
        "Key stage slug to filter by, e.g. 'ks2' - note that casing is important here, and should be lowercase",
      example: 'ks2',
    })
    .optional(),
  subject: z
    .enum(subjectSlugs as [string])
    .openapi({
      description:
        "Subject slug to filter by, e.g. 'english' - note that casing is important here, and should be lowercase",
      example: 'english',
    })
    .optional(),
  unit: z
    .string()
    .openapi({
      description: 'Optional unit slug to additionally filter by',
      example: 'Gothic poetry',
    })
    .optional(),
});
