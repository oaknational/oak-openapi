import { z } from 'zod';
import { sequenceResult } from '@/lib/handlers/subjects/types';

export const subjectSequenceResponseSchema = z.array(sequenceResult);
