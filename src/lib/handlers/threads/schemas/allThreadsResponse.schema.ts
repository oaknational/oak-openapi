import * as z from 'zod/v4';
import { threadSchema } from '@/lib/handlers/threads/types';
import example from './allThreadsResponse.example.json' assert { type: 'json' };

export const allThreadsResponseSchema = z.array(threadSchema).meta({ example });
