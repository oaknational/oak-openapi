import 'zod-openapi';
import * as z from 'zod/v4';
export const transcriptRequestOpenAPISchema = z.object({
  lesson: z.string().describe('The slug of the lesson').meta({
    example: 'checking-understanding-of-basic-transformations',
  }),
});
