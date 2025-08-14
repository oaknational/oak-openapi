import z from 'zod';
import { sequenceSlugSchema, sequenceYearSchema } from '../../sequences/types';
import { limitSchema, offsetSchema } from '../../commonTypes';

export const questionsForSequenceRequestSchema = z.object({
  sequence: sequenceSlugSchema,
  year: sequenceYearSchema,
  offset: offsetSchema,
  limit: limitSchema,
});
