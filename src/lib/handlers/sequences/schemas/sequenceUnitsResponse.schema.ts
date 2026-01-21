import { sequenceSchema } from '@/lib/handlers/sequences/types';
import * as z from 'zod/v4';

export const sequenceUnitsResponseSchema = z.array(sequenceSchema);

export type SequenceUnitsResponse = z.infer<typeof sequenceUnitsResponseSchema>;
