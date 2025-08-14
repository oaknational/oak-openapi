import { z } from 'zod';
import 'zod-openapi/extend';

export const offsetSchema = z
  .number({
    description:
      'If limiting results returned, this allows you to return the next set of results, starting at the given offset point',
  })
  .openapi({ example: 50 })
  .default(0)
  .optional();

export const limitSchema = z
  .number({
    description:
      'Limit the number of lessons, e.g. return a maximum of 100 lessons',
  })
  .openapi({ example: 10 })
  .lte(100)
  .optional()
  .default(10);
