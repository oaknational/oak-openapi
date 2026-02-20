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
  apiKey?: string | null;
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

  const apiKey = getApiKeyFromRequest(req);
  const user = await withUser(req, apiKey);
  // Log the request which is forwarded to datadog
  console.info(
    JSON.stringify({
      userId: user?.id,
      url: req.url,
      query: info.url?.searchParams.toString(),
    }),
  );

  return {
    apiKey,
    req,
    resHeaders,
    rateLimit: undefined as RateLimitInfo | undefined,
    user,
  };
};

export const getApiKeyFromRequest = (req: Request): string | null => {
  const authorization = req.headers.get('authorization');

  if (!authorization) {
    return null;
  }

  const [scheme, token] = authorization.split(' ');
  if (scheme.toLowerCase() !== 'bearer' || !token) {
    return null;
  }

  return token;
};

export const withUser = async (
  req: Request,
  apiKey?: string | null,
): Promise<User | null> => {
  const token = apiKey ?? getApiKeyFromRequest(req);

  if (!token) {
    return null;
  }

  return findUserByKey(token);
};

export const createContext = createContextWithUser;
