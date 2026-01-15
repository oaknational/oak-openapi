import { redis } from '@/lib/redis';
import { defaultRateLimit } from './rateLimit';
import { v4 as uuid } from 'uuid';

export interface UserUpdate {
  email?: null | string;
  name?: null | string;
  company?: null | string;
  rateLimit?: number;
  key?: string;
  requests?: number;
  uuid?: string;
}

export type UserUpdateWithKey = UserUpdate & {
  key: string; // enforced
};

export type User = UserUpdate & {
  key: string; // enforced
  id: number;
};

export async function updateUser(opts: UserUpdateWithKey): Promise<string> {
  if (!opts.key) {
    throw new Error('opts.key is required');
  }

  const userExists = await redis.exists(`user:${opts.key}`);

  if (!userExists) {
    throw new Error('User does not exist');
  }

  return manageUser(opts);
}

export function addUser(opts: UserUpdate = {}): Promise<string> {
  return manageUser(opts);
}

// generally internal method
export async function manageUser({
  email = null,
  name = null,
  company = null,
  rateLimit = defaultRateLimit,
  requests = 0,
  key,
}: UserUpdate = {}): Promise<string> {
  if (!key) {
    key = uuid() as unknown as string;
  }
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
      const existingUser = (await redis.hgetall(
        `user:${key}`,
      )) as unknown as User;
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
  log = true,
): Promise<User | null> {
  const user: User | null = (await redis.hgetall(`user:${key}`)) as User | null;

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

export async function findUserByEmail(email: string): Promise<User | null> {
  const key = (await redis.get(`user:email:${email}`)) as string;
  if (!key) {
    return null;
  }
  return findUserByKey(key, false);
}

export async function findUsers(partial: string): Promise<User[]> {
  const keys = await redis.keys(`user:*${partial}*`);
  const users: User[] = [];

  for (const key of keys) {
    console.log(`Fetching user from key: ${key}`);
    const user = await findUserByEmail(key.replace(/^user:email:/, ''));
    if (user) {
      users.push(user);
    }
  }

  return users;
}
