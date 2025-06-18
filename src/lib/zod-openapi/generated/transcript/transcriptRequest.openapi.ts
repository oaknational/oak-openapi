import 'zod-openapi/extend';
import z from 'zod';

export const transcriptRequestOpenAPISchema = z
  .object({
    lesson: z.string({ description: 'The slug of the lesson' }),
  })
  .openapi({
    example: { lesson: 'checking-understanding-of-basic-transformations' },
    ref: 'TranscriptRequestSchema',
  });
