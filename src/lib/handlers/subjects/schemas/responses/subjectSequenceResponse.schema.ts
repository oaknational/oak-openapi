import * as z from 'zod/v4';
import { sequenceResult } from '@/lib/handlers/subjects/types';

export const subjectSequenceResponseSchema = z.array(sequenceResult);
