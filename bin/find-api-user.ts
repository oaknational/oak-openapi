import 'renvy';
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
  process.exit(1);
}

let data;

if (str.startsWith('user:email:')) {
  const key = await redis.get(str);
  data = await redis.hgetall(`user:${key}`);
} else {
  data = await redis.keys(`user:*${str}*`);
}

console.log(data);
