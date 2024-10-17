import { redis } from '~/lib/redis';
import { defaultRateLimit } from './rateLimit';

export type User = {
  key: string;
  name: string;
  id: string;
  email?: string;
  rateLimit?: number;
};

export async function findUserByKey(key: string): Promise<User | null> {
  const res = (await redis.json.get(
    'apikeys',
    `$[?(@.key=="${key}")]`
  )) as User[];

  if (res.length === 1) {
    const user = res[0];
    if (user.rateLimit === undefined) {
      user.rateLimit = defaultRateLimit;
    }
    return user;
  }
  return null;
}
