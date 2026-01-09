import * as z from 'zod/v4';

export const offsetSchema = z
  .number({
    description:
      'If limiting results returned, this allows you to return the next set of results, starting at the given offset point',
  })
  .meta({ example: 50 })
  .optional()
  .default(0);

export const limitSchema = z
  .number({
    description:
      'Limit the number of lessons, e.g. return a maximum of 100 lessons',
  })
  .meta({ example: 10 })
  .lte(100)
  .optional()
  .default(10);
