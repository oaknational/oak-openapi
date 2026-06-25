import * as z from 'zod/v4';
import { downloadTypeEnum } from '@/lib/handlers/assets/types';
import { limitSchema, offsetSchema } from '@/lib/handlers/commonTypes';
import { subjectSlugs } from '@/lib/keyStageAndSubjects';

export const programmeAssetsRequestOpenAPISchema = z.object({
  subject: z
    .enum(subjectSlugs)
    .meta({ description: 'The subject slug identifier', example: 'computing' }),
  programme: z.string().meta({
    description: 'The programme slug identifier',
    example: 'computing-secondary-year-7',
  }),
  offset: offsetSchema,
  limit: limitSchema,
  type: downloadTypeEnum.optional(),
});
