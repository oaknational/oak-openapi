import { lessonsAssetsType } from '@/lib/handlers/assets/types';
import example from './subjectAssetsResponse.example.json' assert { type: 'json' };

export const subjectAssetsResponseSchema = lessonsAssetsType.meta({ example });
