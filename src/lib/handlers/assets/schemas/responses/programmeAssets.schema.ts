import { lessonsAssetsType } from '@/lib/handlers/assets/types';
import example from './programmeAssets.example.json' assert { type: 'json' };

export const programmeAssetsResponseSchema = lessonsAssetsType.meta({
  example,
});
