import { lessonAssetsType } from '@/lib/handlers/assets/types';
import example from './lessonAssetsResponse.example.json' assert { type: 'json' };

export const lessonAssetsResponseSchema = lessonAssetsType.meta({ example });
