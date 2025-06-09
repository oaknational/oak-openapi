import router from 'lib/router';
import { createContext } from 'lib/context';
import { type NextRequest } from 'next/server';
import { createOpenApiFetchHandler } from 'trpc-to-openapi';

export const dynamic = 'force-dynamic';

const handler = (req: NextRequest) => {
  return createOpenApiFetchHandler({
    endpoint: '/api/v0',
    router,
    createContext,
    req,
  });
};

export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as PATCH,
  handler as DELETE,
  handler as OPTIONS,
  handler as HEAD,
};
