import { User, findUserByKey } from '~/lib/apikeys';
import { RateLimitInfo } from '~/lib/zod-types';
import { type CreateNextContextOptions } from '@trpc/server/adapters/next';
import { inferAsyncReturnType } from '@trpc/server';
import type { NextApiRequest } from 'next';

export type Context = inferAsyncReturnType<typeof createContext>;

const createContextWithUser = async (opts: CreateNextContextOptions) => {
  const user = await withUser(opts.req);
  return {
    req: opts.req,
    res: opts.res,
    rateLimit: undefined as RateLimitInfo | undefined,
    user,
  };
};

export const withUser = async (req: NextApiRequest) => {
  let user: User | null = null;

  if (req.headers.authorization) {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      user = await findUserByKey(token);
    }
  }

  return user;
};

export const createContext = createContextWithUser;
