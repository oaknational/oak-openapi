import type { User } from '@/lib/apikeys';
import { findUserByKey } from '@/lib/apikeys';
import type { RateLimitInfo } from './rateLimit';
import type { TRPCRequestInfo } from '@trpc/server/http';
import type { NextApiResponse } from 'next';

export type Context = Awaited<Promise<ReturnType<typeof createContext>>>;

interface FetchCreateContextFnOptions {
  req: Request;
  res: NextApiResponse;
  info: TRPCRequestInfo;
}

interface ContextWithUser {
  req: Request;
  resHeaders: {
    set: (key: string, value: string) => void;
  };
  rateLimit: RateLimitInfo | undefined;
  user: User | null;
}

const createContextWithUser = async ({
  req,
  info,
  res,
}: FetchCreateContextFnOptions): Promise<ContextWithUser> => {
  // low fat cors

  const headers = new Headers(req.headers);
  const resHeaders = {
    set: (key: string, value: string) => {
      res.setHeader(key, value);
      headers.set(key, value);
    },
    get: (key: string) => {
      return headers.get(key);
    },
  };

  resHeaders.set('access-control-allow-origin', '*');
  resHeaders.set('access-control-allow-methods', 'GET, POST, OPTIONS');
  resHeaders.set('access-control-allow-headers', 'Content-Type, Authorization');

  const user = await withUser(req);
  // Log the request which is forwarded to datadog
  console.info(
    JSON.stringify({
      userId: user?.id,
      url: req.url,
      query: info.url?.searchParams.toString(),
    }),
  );

  return {
    req,
    resHeaders,
    rateLimit: undefined as RateLimitInfo | undefined,
    user,
  };
};

export const withUser = async (req: Request): Promise<User | null> => {
  let user: User | null = null;

  const authorization = req.headers.get('authorization');

  if (authorization) {
    const token = authorization?.split(' ')[1];
    if (token) {
      user = await findUserByKey(token);
    }
  }

  return user;
};

export const createContext = createContextWithUser;
