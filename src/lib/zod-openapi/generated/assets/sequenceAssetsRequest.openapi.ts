import 'zod-openapi/extend';
import z from 'zod';
import { downloadTypeEnum } from '@/lib/handlers/assets/types';

export const sequenceAssetsRequestOpenAPISchema = z
  .object({
    sequence: z.string().openapi({ example: 'maths-secondary' }),
    year: z.number().optional(),
    type: downloadTypeEnum.optional(),
  })
  .openapi({ example: { sequence: 'maths-secondary' } });
