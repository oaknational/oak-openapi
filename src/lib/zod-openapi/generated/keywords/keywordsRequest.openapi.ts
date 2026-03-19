import 'zod-openapi';
import * as z from 'zod/v4';
import { keyStageSlugs, subjectSlugs } from '@/lib/keyStageAndSubjects';

export const keywordsRequestOpenAPISchema = z
  .object({
    unit: z
      .string()
      .optional()
      .describe(
        "Unit slug to search by, e.g. 'forces-and-magnets' - note that casing is important here (always lowercase)",
      ),
    lesson: z
      .string()
      .optional()
      .describe(
        "Lesson slug to search by, e.g. 'animating-text' - note that casing is important here (always lowercase)",
      ),
    subject: z
      .enum(subjectSlugs as [string])
      .optional()
      .describe(
        "Subject slug to search by, e.g. 'science' - note that casing is important here (always lowercase)",
      ),
    keyStage: z
      .enum(keyStageSlugs as [string])
      .optional()
      .describe("Key stage slug to filter by, e.g. 'ks2'"),
  })
  .refine(
    (data) =>
      data.subject !== undefined ||
      data.unit !== undefined ||
      data.lesson !== undefined,
    {
      message:
        'At least one of subject, unit or lesson must be provided - note that they are all the slug form of the values (e.g. "ks2" for key stage 2, "science" for the science subject, and "forces-and-magnets" for the forces and magnets unit), and that casing is important (always lowercase).',
    },
  );
