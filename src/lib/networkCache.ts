const stale_while_revalidate_seconds = 60 * 3; // 3 minutes
const s_maxage_seconds = 60 * 60 * 24; // 1 day

import { t } from '~/lib/trpc';

export const defaultCaching = t.middleware(({ ctx, next }) => {
  if (!ctx.res || typeof ctx.res.setHeader !== 'function') {
    throw new Error('Response object does not support setting headers');
  }

  const cacheControl = `public, durable, s-maxage=${s_maxage_seconds}, stale-while-revalidate=${stale_while_revalidate_seconds}`;

  ctx.res.setHeader('Cache-Control', cacheControl);
  return next();
});
