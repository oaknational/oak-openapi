import 'zod-openapi/extend';
import { z } from 'zod';

export const lessonAssetResponseOpenAPISchema = z
  .record(
    z.string({ description: 'The HTTP status code' }),
    z.string({ description: 'The content type of the download' }),
  )
  .optional()
  .openapi({
    ref: 'LessonAssetResponseSchema',
    example: { '200': 'application/octet-stream' },
  });
