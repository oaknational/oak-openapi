import 'renvy';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { findUserByEmail, rollApiKey, User } from '@/lib/apikeys';

const email = process.argv[2];
const autoConfirm = process.argv.includes('--yes');

if (!email) {
  console.error('Usage: roll-api-key <email> [--yes]');
  console.error('Examples:');
  console.error('  tsx bin/roll-api-key.ts someone@example.com');
  console.error('  tsx bin/roll-api-key.ts someone@example.com --yes');
  process.exit(1);
}

async function askForConfirmation(user: User): Promise<boolean> {
  console.log('User found:');
  console.log(`  ID: ${user.id}`);
  console.log(`  Name: ${user.name ?? '(none)'}`);
  console.log(`  Email: ${user.email ?? '(none)'}`);
  console.log(`  Current key: ${user.key}`);
  console.log('\nA new key will be generated and the current one deleted.');
  console.log('The current hour’s rate limit allowance will also reset.');

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

  if (!(await askForConfirmation(user))) {
    console.log('Cancelled. API key was not changed.');
    return;
  }

  const { previousKey, key } = await rollApiKey(user.key);

  console.log('\nAPI key rolled successfully.');
  console.log(`  Email: ${userEmail}`);
  console.log(`  Previous key: ${previousKey}`);
  console.log(`  New key: ${key}`);
}

rollApiKeyByEmail(email).catch((error) => {
  console.error(
    error instanceof Error ? error.message : 'Unknown error while rolling key.',
  );
  process.exit(1);
});
