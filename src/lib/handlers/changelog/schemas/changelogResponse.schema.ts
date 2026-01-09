import * as z from 'zod/v4';
import { changelogLatestSchema } from './changelogLatestResponse.schema';

export const changelogResponseSchema = z.array(changelogLatestSchema);
