// const stale_while_revalidate_seconds = 60 * 3; // 3 minutes
const s_maxage_seconds = 60 * 60 * 24; // 1 day

import { t } from '~/lib/trpc';

export const defaultCaching = t.middleware(({ ctx, next }) => {
  if (!ctx.res || typeof ctx.res.setHeader !== 'function') {
    throw new Error('Response object does not support setting headers');
  }

  // const cacheControl = `public, durable, s-maxage=${s_maxage_seconds}, stale-while-revalidate=${stale_while_revalidate_seconds}`;

  // add vercel specific cache header
  ctx.res.setHeader(
    'Vercel-CDN-Cache-Control',
    `public, max-age=${s_maxage_seconds}`,
  );

  // also apply "generic" CDN cache header
  ctx.res.setHeader('CDN-Cache-Control', `public, max-age=${s_maxage_seconds}`);

  // add client header, though in reality this will have little impact
  // ctx.res.setHeader('Cache-Control', cacheControl);

  return next();
});
