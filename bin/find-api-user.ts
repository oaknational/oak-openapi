import 'renvy';
import {
  findUserByEmail,
  findUsers,
  updateUser,
  User,
  UserUpdateWithKey,
} from '@/lib/apikeys';

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

let data: User | User[] | null = null;

if (str.startsWith('user:email:')) {
  const email = str.replace('user:email:', '');
  data = await findUserByEmail(email);

  if (data && process.argv[3]) {
    const rate = parseInt(process.argv[3], 10);
    if (isNaN(rate)) {
      console.log(data);
      console.error('Invalid rate provided. Must be a number.');
      process.exit(1);
    }

    // update rate limit for user
    const update = { ...data, rateLimit: rate } as UserUpdateWithKey;
    await updateUser(update);
    data = await findUserByEmail(email);
  }
} else {
  data = await findUsers(str);
}

console.log(data);
