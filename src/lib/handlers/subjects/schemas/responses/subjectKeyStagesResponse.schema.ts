import { keyStagesResult } from '@/lib/handlers/subjects/types';

export const subjectKeyStagesResponseSchema = keyStagesResult.openapi({
  description:
    'The key stage slug identifiers for which this subject has content available for',
});
