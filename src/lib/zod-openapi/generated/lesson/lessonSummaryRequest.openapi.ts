import 'zod-openapi';
import * as z from 'zod/v4';
export const lessonSummaryRequestOpenAPISchema = z.object({
  lesson: z.string().describe('The slug of the lesson').meta({
    example: 'using-vector-tools-to-draw-and-modify-shapes',
  }),
});
