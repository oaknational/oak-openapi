import 'zod-openapi/extend';
import { inputSchema } from '@/lib/handlers/subjects/types';

export const subjectKeyStagesRequestOpenAPISchema = inputSchema.openapi({
  example: { subject: 'art' },
});
