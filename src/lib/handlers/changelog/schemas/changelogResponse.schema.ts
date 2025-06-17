import { z } from 'zod';
import { changelogLatestSchema } from './changelogLatestResponse.schema';

export const changelogResponseSchema = z.array(changelogLatestSchema);
