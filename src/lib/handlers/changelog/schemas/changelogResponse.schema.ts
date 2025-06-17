import { z } from 'zod';
import { changelogLatestSchema } from './changelogLatest.schema';

export const changelogResponseSchema = z.array(changelogLatestSchema);
