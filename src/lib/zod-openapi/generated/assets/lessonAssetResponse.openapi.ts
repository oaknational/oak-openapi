import 'zod-openapi/extend';
import { z } from 'zod';

export const lessonAssetResponseOpenAPISchema = z
  .any()
  .openapi({
    example: { '200': 'application/octet-stream' },
    ref: 'LessonAssetResponseSchema',
  });
