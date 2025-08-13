import 'zod-openapi/extend';
import { z } from 'zod';

export const threadUnitsRequestOpenAPISchema = z.object({
  threadSlug: z.string(),
});
