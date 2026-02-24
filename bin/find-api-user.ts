import 'renvy';
import {
  findUserByEmail,
  findUserByKey,
  findUsers,
  updateUser,
  User,
  UserUpdateWithKey,
} from '@/lib/apikeys';
import { redis } from '@/lib/redis';

const str = process.argv[2];

if (!str) {
  // usage
  console.error('Usage: find-api-user <email or partial>');
  console.error('Examples:');
  console.error('  # finds matching users');
  console.error('  tsx find-api-user.ts example\n');
  console.error('  # dumps user data');
  console.error('  tsx find-api-user.ts user:email:foo@example.com');
  console.error('  tsx find-api-user.ts id:443');
  console.error(
    '  # find users with requests since date (YYYY-MM-DD or YYYY MM DD)',
  );
  console.error('  tsx find-api-user.ts since:2026-02-24');
  process.exit(1);
}

async function findUserById(id: number): Promise<User | null> {
  const keys = await redis.keys('user:*');

  for (const redisKey of keys) {
    if (redisKey.startsWith('user:email:')) {
      continue;
    }

    const key = redisKey.replace(/^user:/, '');
    const user = await findUserByKey(key, false);
    if (user && Number(user.id) === id) {
      return user;
    }
  }

  return null;
}

async function findUsersSince(dateStr: string): Promise<User[]> {
  // Parse date in format: 2026-02-24 or 2026 02 24
  const dateParts = dateStr.split(/[-/\s]+/);
  if (dateParts.length !== 3) {
    console.error(
      'Invalid date format. Use YYYY-MM-DD or YYYY MM DD (e.g., 2026-02-24)',
    );
    process.exit(1);
  }

  const year = parseInt(dateParts[0], 10);
  const month = parseInt(dateParts[1], 10) - 1; // JavaScript months are 0-indexed
  const day = parseInt(dateParts[2], 10);

  if (isNaN(year) || isNaN(month + 1) || isNaN(day)) {
    console.error(
      'Invalid date format. Use YYYY-MM-DD or YYYY MM DD (e.g., 2026-02-24)',
    );
    process.exit(1);
  }

  const targetDate = new Date(year, month, day);
  const keys = await redis.keys('user:*');
  const users: User[] = [];

  for (const redisKey of keys) {
    if (redisKey.startsWith('user:email:')) {
      continue;
    }

    const key = redisKey.replace(/^user:/, '');
    const user = await findUserByKey(key, false);

    if (user && user.lastRequest) {
      const lastRequestDate = new Date(user.lastRequest);

      if (lastRequestDate >= targetDate) {
        users.push(user);
      }
    }
  }

  return users;
}

async function maybeUpdateRateLimit(user: User): Promise<User | null> {
  if (!process.argv[3]) {
    return user;
  }

  const rate = parseInt(process.argv[3], 10);
  if (isNaN(rate)) {
    console.log(user);
    console.error('Invalid rate provided. Must be a number.');
    process.exit(1);
  }

  const update = { ...user, rateLimit: rate } as UserUpdateWithKey;
  await updateUser(update);

  if (user.email) {
    return findUserByEmail(user.email);
  }

  return findUserByKey(user.key, false);
}

let data: User | User[] | null = null;

if (str.startsWith('since:')) {
  const dateStr = str.replace('since:', '');
  data = await findUsersSince(dateStr);
} else if (str.startsWith('user:email:')) {
  const email = str.replace('user:email:', '');
  const user = await findUserByEmail(email);
  if (user) {
    data = await maybeUpdateRateLimit(user);
  }
} else if (str.startsWith('id:')) {
  const id = parseInt(str.replace('id:', ''), 10);
  if (isNaN(id)) {
    console.error('Invalid id provided. Use format id:443');
    process.exit(1);
  }

  const user = await findUserById(id);
  if (user) {
    data = await maybeUpdateRateLimit(user);
  }
} else {
  data = await findUsers(str);
}

console.log(data);
