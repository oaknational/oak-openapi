import router from 'lib/router';
import { createContext } from 'lib/context';
import type { NextRequest } from 'next/server';
import { createOpenApiFetchHandler } from 'trpc-to-openapi';
import type { NextApiResponse } from 'next';

export const dynamic = 'force-dynamic';

const handler = async (req: NextRequest): Promise<Response> => {
  return await createOpenApiFetchHandler({
    endpoint: '/api/v0',
    router,
    createContext: async (opts) => {
      // Mock NextApiResponse for fetch adapter
      const resHeaders = new Map<string, string>();
      const mockRes: NextApiResponse = {
        setHeader: (key: string, value: string) => {
          resHeaders.set(key, value);
        },
      } as NextApiResponse;

      const context = await createContext({
        ...opts,
        res: mockRes,
      });

      // Apply headers to response
      const response = new Response(null, { status: 200 });
      resHeaders.forEach((value, key) => {
        response.headers.set(key, value);
      });

      return context;
    },
    req,
  });
};

function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET, POST, OPTIONS',
      'access-control-allow-headers': 'Content-Type, Authorization',
    },
  });
}

export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as PATCH,
  handler as DELETE,
  OPTIONS,
  handler as HEAD,
};
