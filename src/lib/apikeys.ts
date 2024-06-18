import { redis } from '~/lib/redis';

export type User = { key: string; name: string; id: string };

export async function findUserByKey(key: string): Promise<User | null> {
  const res = (await redis.json.get(
    'apikeys',
    `$[?(@.key=="${key}")]`
  )) as User[];

  if (res.length === 1) {
    return res[0];
  }
  return null;
}
