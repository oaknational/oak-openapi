import { z } from 'zod';
import { threadSchema } from '@/lib/handlers/threads/types';

export const allThreadsResponseSchema = z.array(threadSchema);
