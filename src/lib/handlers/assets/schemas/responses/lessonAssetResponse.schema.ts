import { z } from 'zod';

export const lessonAssetResponseSchema = z
  .record(
    z.string({ description: 'The HTTP status code' }),
    z.string({ description: 'The content type of the download' }),
  )
  .optional();
