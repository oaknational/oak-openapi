import { redis } from '~/lib/redis';
import { defaultRateLimit } from './rateLimit';
import { v4 as uuid } from 'uuid';

export type User = {
  id: number;
  key: string;
  name?: string | null;
  email?: string | null;
  rateLimit?: number;
};

export async function addUser({
  email = null,
  name = null,
  rateLimit = defaultRateLimit,
  key = uuid(),
}: {
  email?: null | string;
  name?: null | string;
  rateLimit?: number;
  key?: string;
} = {}): Promise<string> {
  const userExists = await redis.exists(`user:${key}`);

  if (!userExists) {
    const id = await redis.incr('next_user_id');

    const user = {
      id,
      key,
      email,
      name,
      rateLimit,
      requests: 0,
    };

    // Store the user in Redis using key as the lookup identifier
    await redis.hset(`user:${key}`, user);

    if (email) {
      await redis.set(`user:email:${email}`, key);
    }
  } else {
    // If the user exists, update the fields without modifying the `id`
    const updates = {
      email: email,
      name: name,
      rateLimit: rateLimit || null,
    };

    // Perform an update for existing fields without touching `id`
    await redis.hset(`user:${key}`, updates);
  }

  return key;
}

export async function findUserByKey(key: string): Promise<User | null> {
  const user: User | null = await redis.hgetall(`user:${key}`);

  if (user) {
    // track how many requests in total (for a fast way to find busy
    // or idle users)
    await redis.hincrby(`user:${key}`, 'requests', 1);

    if (user.rateLimit === undefined) {
      user.rateLimit = defaultRateLimit;
    }
    return user;
  }
  return null;
}
