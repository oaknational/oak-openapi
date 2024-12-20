// const s_maxage_seconds = 60 * 60 * 24; // 1 day
const maxage_seconds = 60 * 10; // 10 minutes for testing

import { t } from '~/lib/trpc';

export const defaultCaching = t.middleware(({ ctx, next }) => {
  if (!ctx.res || typeof ctx.res.setHeader !== 'function') {
    throw new Error('Response object does not support setting headers');
  }

  const cacheControl = `public, max-age=${maxage_seconds}`;

  // this header is crafted for cloudflare to pick up and store on the cdn.
  ctx.res.setHeader('Cache-Control', cacheControl);

  // add vercel specific cache header
  // ctx.res.setHeader(
  //   'Vercel-CDN-Cache-Control',
  //   `public, max-age=${s_maxage_seconds}`,
  // );

  // also apply "generic" CDN cache header
  // ctx.res.setHeader('CDN-Cache-Control', `public, max-age=${s_maxage_seconds}`);

  return next();
});
