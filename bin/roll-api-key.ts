import 'renvy';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { v4 as uuid } from 'uuid';
import { findUserByEmail, User } from '@/lib/apikeys';
import { redis } from '@/lib/redis';

const email = process.argv[2];
const autoConfirm = process.argv.includes('--yes');

if (!email) {
  console.error('Usage: roll-api-key <email> [--yes]');
  console.error('Examples:');
  console.error('  tsx bin/roll-api-key.ts someone@example.com');
  console.error('  tsx bin/roll-api-key.ts someone@example.com --yes');
  process.exit(1);
}

async function generateUniqueApiKey(): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const candidate = uuid();
    const exists = await redis.exists(`user:${candidate}`);
    if (!exists) {
      return candidate;
    }
  }

  throw new Error(
    'Unable to generate a unique API key after multiple attempts.',
  );
}

async function getStoredUserRecord(
  key: string,
): Promise<Record<string, unknown>> {
  const userRecord = (await redis.hgetall(`user:${key}`)) as Record<
    string,
    unknown
  >;

  if (!userRecord || Object.keys(userRecord).length === 0) {
    throw new Error(`No user record found for key ${key}`);
  }

  return userRecord;
}

async function askForConfirmation(
  user: User,
  nextKey: string,
): Promise<boolean> {
  console.log('User found:');
  console.log(`  ID: ${user.id}`);
  console.log(`  Name: ${user.name ?? '(none)'}`);
  console.log(`  Email: ${user.email ?? '(none)'}`);
  console.log(`  Current key: ${user.key}`);
  console.log(`  New key: ${nextKey}`);

  if (autoConfirm) {
    console.log('\n--yes provided, skipping prompt.');
    return true;
  }

  const rl = createInterface({ input, output });
  const answer = await rl.question(
    '\nRoll this API key? Type "roll" to confirm: ',
  );
  rl.close();

  return answer.trim().toLowerCase() === 'roll';
}

async function rollApiKeyByEmail(userEmail: string): Promise<void> {
  const user = await findUserByEmail(userEmail);

  if (!user) {
    console.error(`No user found for email: ${userEmail}`);
    process.exit(1);
  }

  const oldKey = user.key;
  const newKey = await generateUniqueApiKey();

  const confirmed = await askForConfirmation(user, newKey);

  if (!confirmed) {
    console.log('Cancelled. API key was not changed.');
    return;
  }

  const userRecord = await getStoredUserRecord(oldKey);
  const updatedRecord = { ...userRecord, key: newKey };

  await redis.hset(`user:${newKey}`, updatedRecord);
  await redis.set(`user:email:${userEmail}`, newKey);
  await redis.del(`user:${oldKey}`);

  const lookupAfterUpdate = await redis.get(`user:email:${userEmail}`);

  if (lookupAfterUpdate !== newKey) {
    throw new Error('Email lookup was not updated to the new API key.');
  }

  const updatedUser = await findUserByEmail(userEmail);

  if (!updatedUser || updatedUser.key !== newKey) {
    throw new Error('User record was not updated correctly.');
  }

  console.log('\nAPI key rolled successfully.');
  console.log(`  Email: ${userEmail}`);
  console.log(`  Previous key: ${oldKey}`);
  console.log(`  New key: ${newKey}`);
}

rollApiKeyByEmail(email).catch((error) => {
  console.error(
    error instanceof Error ? error.message : 'Unknown error while rolling key.',
  );
  process.exit(1);
});
