import 'zod-openapi/extend';
import { inputSchema } from '@/lib/handlers/subjects/types';

export const subjectSequenceRequestOpenAPISchema = inputSchema.openapi({
  example: { subject: 'art' },
  ref: 'SubjectSequenceRequestSchema',
});
