import { type NextRequest } from 'next/server';
import { User, findUserByKey } from '~/lib/apikeys';
import { RateLimitInfo } from './rateLimit';

// method setHeader, prop setStatus, method end
interface TrpcNextResponse {
  setHeader: (key: string, value: string) => void;
  setStatus: (statusCode: number) => void;
  end: () => void;
}

const createContextWithUser = async ({
  req,
  res,
}: {
  req: NextRequest;
  res: TrpcNextResponse;
}) => {
  const user = await withUser(req);

  // Log the request which is forwarded to datadog
  console.info(
    JSON.stringify({
      userId: user?.id,
      url: req.url,
      query: req.nextUrl.searchParams.toString(),
    }),
  );

  return {
    req: req,
    res,
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
