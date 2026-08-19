import { subjectResult } from '@/lib/handlers/subjects/types';
import example from './subjectResponse.example.json' assert { type: 'json' };

export const subjectResponseSchema = subjectResult.meta({ example });
