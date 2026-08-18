import { unitListSchema } from '@/lib/handlers/threads/types';
import example from './threadUnitsResponse.example.json' assert { type: 'json' };

export const threadUnitsResponseSchema = unitListSchema.meta({ example });
