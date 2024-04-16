import { TRPCError } from '@trpc/server';
import { keys } from 'lib/apikeys';
import { RateLimitInfo } from '~/lib/zod-types';
import { type CreateNextContextOptions } from '@trpc/server/adapters/next';
import { inferAsyncReturnType } from '@trpc/server';
import type { NextApiRequest } from 'next';

// Overload ctx.auth to allow authenticating via internal API key without
// all of the session logic that comes along with clerk auth
export type APIKeyAuthObject = { userId: string };
export type GetAuth = (req: NextApiRequest) => Promise<APIKeyAuthObject>;
export type AuthContextProps = {
  auth: APIKeyAuthObject;
};
export type Context = inferAsyncReturnType<typeof createContext>;

async function findUserByKey(key: string): Promise<APIKeyAuthObject | null> {
  return keys.includes(key) ? { userId: key } : null;
}

/** Use this helper for:
 *  - testing, where we dont have to Mock Next.js' req/res
 *  - trpc's `createSSGHelpers` where we don't have req/res
 * @see https://beta.create.t3.gg/en/usage/trpc#-servertrpccontextts
 */
export const createContextInner = async ({
  auth,
}: Readonly<AuthContextProps>) => {
  return {
    auth,
  };
};

const createContextWithCustomAuth =
  (getAuth: GetAuth) => async (opts: CreateNextContextOptions) => {
    const auth = await getAuth(opts.req);
    const contextInner = await createContextInner({
      auth,
    } as AuthContextProps);
    return {
      ...contextInner,
      req: opts.req,
      res: opts.res,
      rateLimit: undefined as RateLimitInfo | undefined,
    };
  };

export const createContext = createContextWithCustomAuth(async (req) => {
  let user: APIKeyAuthObject | null = null;

  if (req.headers.authorization) {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      user = await findUserByKey(token);
    }
  }

  if (!user) {
    throw new TRPCError({
      message: 'API token not provide or invalid',
      code: 'UNAUTHORIZED',
    });
  }

  return user;
});
