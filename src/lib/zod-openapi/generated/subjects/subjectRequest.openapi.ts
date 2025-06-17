import 'zod-openapi/extend';
import { inputSchema } from '@/lib/handlers/subjects/types';

export const subjectRequestOpenAPISchema = inputSchema.openapi({
  example: { subject: 'art' },
});
