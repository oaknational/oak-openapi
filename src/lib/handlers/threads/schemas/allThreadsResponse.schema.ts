import * as z from 'zod/v4';
import { threadSchema } from '@/lib/handlers/threads/types';

export const allThreadsResponseSchema = z.array(threadSchema);
