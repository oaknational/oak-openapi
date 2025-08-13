import 'zod-openapi/extend';
import { keyStageSlugs, subjectSlugs } from '@/lib/keyStageAndSubjects';
import z from 'zod';

export const keyStageSubjectLessonsRequestOpenAPISchema = z.object({
  keyStage: z
    .enum(keyStageSlugs as [string], {
      description:
        "Key stage slug to filter by, e.g. 'ks2' - note that casing is important here, and should be lowercase",
    })
    .openapi({ description: 'Key stage slug to filter by', example: 'ks1' }),
  subject: z
    .enum(subjectSlugs as [string], {
      description:
        "Subject slug to filter by, e.g. 'english' - note that casing is important here, and should be lowercase",
    })
    .openapi({ description: 'Subject slug to search by', example: 'english' }),
  unit: z
    .string({
      description: 'Optional unit slug to additionally filter by',
    })
    .optional(),
  offset: z
    .number({
      description:
        'If limiting results returned, this allows you to return the next set of results, starting at the given offset point',
    })
    .optional()
    .default(0),
  limit: z
    .number({
      description:
        'Limit the number of results returned, e.g. return a maximum of 100 lesson titles. Defaults to 10 if left unspecified',
    })
    .lte(100)
    .optional()
    .default(10),
});
