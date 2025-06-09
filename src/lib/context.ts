import { User, findUserByKey } from '@/lib/apikeys';
import { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { RateLimitInfo } from './rateLimit';

export type Context = Awaited<Promise<ReturnType<typeof createContext>>>;

const createContextWithUser = async ({
  req,
  info,
  resHeaders,
}: FetchCreateContextFnOptions) => {
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

export const withUser = async (req: Request) => {
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
