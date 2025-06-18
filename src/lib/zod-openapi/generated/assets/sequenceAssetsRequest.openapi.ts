import 'zod-openapi/extend';
import z from 'zod';
import { downloadTypeEnum } from '@/lib/handlers/assets/types';

export const sequenceAssetsRequestOpenAPISchema = z
  .object({
    sequence: z.string(),
    year: z.number().optional(),
    type: downloadTypeEnum.optional(),
  })
  .openapi({
    example: { sequence: 'maths-secondary' },
    ref: 'SequenceAssetsRequestSchema',
  });
