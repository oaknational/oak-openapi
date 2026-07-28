import 'zod-openapi';
import * as z from 'zod/v4';
export const subjectSequenceRequestOpenAPISchema = z.object({
  sequence: z.string().describe('The sequence slug identifier').meta({
    example: 'english-secondary',
  }),
});
