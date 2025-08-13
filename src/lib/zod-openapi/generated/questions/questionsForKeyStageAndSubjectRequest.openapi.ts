import 'zod-openapi/extend';
import { keyStageSlugs, subjectSlugs } from '@/lib/keyStageAndSubjects';
import z from 'zod';

export const questionsForKeyStageAndSubjectRequestOpenAPISchema = z.object({
  keyStage: z
    .enum(keyStageSlugs as [string], {
      description:
        "Key stage slug to filter by, e.g. 'ks2' - note that casing is important here, and should be lowercase",
    })
    .openapi({ description: 'Key stage slug to filter by', example: 'ks1' }),
  subject: z
    .enum(subjectSlugs as [string], {
      description:
        "Subject slug to search by, e.g. 'science' - note that casing is important here",
    })
    .openapi({ description: 'Subject slug to search by', example: 'art' }),
  offset: z.number().optional().default(0),
  limit: z
    .number({
      description: 'Limit the number of results returned, max 100',
    })
    .lte(100)
    .optional()
    .default(10),
});
