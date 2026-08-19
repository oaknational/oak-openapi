import * as z from 'zod/v4';
import example from './lessonAssetResponse.example.json' assert { type: 'json' };

export const lessonAssetResponseSchema = z.any().meta({ example });
