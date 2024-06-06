import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export type User = { key: string; name: string; id: string };

export const keys: User[] = await redis.json
  .get('apikeys')
  .catch((e: Error) => {
    console.log(`Failed to collect apikeys: ${e.toString()}`);
    return [];
  })
  .then((keys) => keys as User[]);

export async function findUserByKey(key: string): Promise<User | null> {
  const res = await redis.json.get('apikeys', `$[?(@.key=="${key}")]`);
  if (res) {
    return res as User;
  }
  return null;
}
