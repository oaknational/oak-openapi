import { type NextRequest } from 'next/server';
import { User, findUserByKey } from '~/lib/apikeys';
import { type CreateNextContextOptions } from '@trpc/server/adapters/next';
import { inferAsyncReturnType } from '@trpc/server';
import type { NextApiRequest } from 'next';
import { RateLimitInfo } from './rateLimit';

export type Context = inferAsyncReturnType<typeof createContext>;

const createContextWithUser = async (req: NextRequest) => {
  const user = await withUser(req);

  // Log the request which is forwarded to datadog
  // console.info(
  //   JSON.stringify({
  //     userId: user?.id,
  //     url: req.url,
  //     query: req.query,
  //   }),
  // );

  return {
    req: req,
    // res: opts.res,
    rateLimit: undefined as RateLimitInfo | undefined,
    user,
  };
};

export const withUser = async (req: NextRequest) => {
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
