import { redis } from '@/lib/redis';
import { defaultRateLimit } from './rateLimit';
import { v4 as uuid } from 'uuid';

type UserUpdate = {
  email?: null | string;
  name?: null | string;
  company?: null | string;
  rateLimit?: number;
  key?: string;
  requests?: number;
};

export type User = UserUpdate & {
  key: string; // enforced
  id: number;
};

export async function updateUser(opts: {
  key: string; // required
  email?: string;
  name?: null | string;
  company?: null | string;
  rateLimit?: number;
}) {
  if (!opts.key) {
    throw new Error('opts.key is required');
  }

  const userExists = await redis.exists(`user:${opts.key}`);

  if (!userExists) {
    throw new Error('User does not exist');
  }

  return manageUser(opts);
}

export function addUser(opts: UserUpdate = {}) {
  return manageUser(opts);
}

// generally internal method
export async function manageUser({
  email = null,
  name = null,
  company = null,
  rateLimit = defaultRateLimit,
  requests = 0,
  key = uuid(),
}: UserUpdate = {}): Promise<string> {
  const userExists = await redis.exists(`user:${key}`);

  if (userExists) {
    // If the user exists, update the fields without modifying the `key` field
    const updates = {
      email,
      name,
      company,
      rateLimit: rateLimit || null,
    };

    if (email) {
      // check if the email address has changed
      // and if it has, update the index
      const existingUser = await redis.hgetall(`user:${key}`);
      if (existingUser && existingUser.email !== email) {
        await redis.del(`user:email:${existingUser.email}`);
      }
      await redis.set(`user:email:${email}`, key);
    }

    // Perform an update for existing fields without touching `id`
    await redis.hset(`user:${key}`, updates);
  } else {
    const id = await redis.incr('next_user_id');

    const user = {
      id,
      key,
      email,
      name,
      company,
      rateLimit,
      requests,
    };

    // Store the user in Redis using key as the lookup identifier
    await redis.hset(`user:${key}`, user);

    if (email) {
      await redis.set(`user:email:${email}`, key);
    }
  }

  return key;
}

export async function findUserByKey(
  key: string,
  log: boolean = true,
): Promise<User | null> {
  const user: User | null = await redis.hgetall(`user:${key}`);

  if (user) {
    // track how many requests in total (for a fast way to find busy
    // or idle users)
    if (log) {
      await redis.hincrby(`user:${key}`, 'requests', 1);
      await redis.hset(`user:${key}`, { lastRequest: new Date().toJSON() });
    }

    if (user.rateLimit === undefined || user.rateLimit === null) {
      user.rateLimit = defaultRateLimit;
    }
    return user;
  }
  return null;
}
