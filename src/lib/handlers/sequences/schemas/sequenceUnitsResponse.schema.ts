import { sequenceSchema } from '@/lib/types';
import { z } from 'zod';

export const sequenceUnitsResponseSchema = z.array(sequenceSchema);

export type SequenceUnitsResponse = z.infer<typeof sequenceUnitsResponseSchema>;
