import 'renvy';
import { redis } from '@/lib/redis';
import { User } from '@/lib/apikeys';

interface UsersByCompany {
  [company: string]: (User & { apiKey: string })[];
}

async function listUsersByCompany(
  minDate?: string,
  debug = false,
): Promise<UsersByCompany> {
  const usersByCompany: UsersByCompany = {};
  let cursor = 0;
  let scanIteration = 0;
  let totalKeysProcessed = 0;
  const visitedCursors = new Set<number>();

  const log = (msg: string) => {
    if (debug) console.debug(msg);
  };

  // Parse and validate minDate, allow shortened format
  let minRequestDate: Date | null = null;
  if (minDate) {
    // If no time component, append T00:00:00Z to make it valid ISO format
    const dateStr = minDate.includes('T') ? minDate : `${minDate}T00:00:00Z`;
    minRequestDate = new Date(dateStr);
    if (isNaN(minRequestDate.getTime())) {
      throw new Error(
        `Invalid date format: ${minDate}. Use ISO 8601 (e.g., 2025-11-01 or 2025-11-01T00:00:00Z)`,
      );
    }
    log(`[INIT] Parsed minDate: ${minRequestDate.toISOString()}`);
  }

  log('[SCAN] Starting Redis SCAN operation...');

  // Use SCAN to iterate through keys without loading all at once
  do {
    log(`[SCAN] Iteration ${scanIteration}, cursor: ${cursor}`);

    // Prevent infinite loops by tracking visited cursors
    if (visitedCursors.has(cursor)) {
      log(`[SCAN] Detected cursor loop at ${cursor}, terminating SCAN`);
      break;
    }
    visitedCursors.add(cursor);

    const result = await redis.scan(cursor, { match: 'user:*', count: 100 });
    cursor = Number(result[0]);
    const keys = result[1] as string[];

    log(`[SCAN] Found ${keys.length} keys in iteration ${scanIteration}`);

    // Filter out email index keys
    const userKeys = keys.filter((key) => !key.startsWith('user:email:'));
    totalKeysProcessed += userKeys.length;

    if (userKeys.length === 0) {
      scanIteration++;
      continue;
    }

    log(`[FETCH] Bulk fetching ${userKeys.length} user records...`);

    // Fetch all users in parallel
    const userPromises = userKeys.map((key) =>
      redis.hgetall(key).then((user) => ({ key, user })),
    );
    const userResults = await Promise.all(userPromises);

    log(`[FETCH] Bulk fetch complete, processing ${userResults.length} users`);

    for (const { key, user } of userResults) {
      if (!user) {
        log(`[SKIP] Empty user data for: ${key}`);
        continue;
      }

      const typedUser = user as unknown as User;

      // Filter by minDate if provided
      if (minRequestDate) {
        if (!typedUser.lastRequest) {
          log(
            `[FILTER] User ${typedUser.id} filtered out: no lastRequest (does not meet minDate requirement)`,
          );
          continue;
        }
        const lastRequestDate = new Date(typedUser.lastRequest);
        if (lastRequestDate < minRequestDate) {
          log(
            `[FILTER] User ${typedUser.id} filtered out: lastRequest (${typedUser.lastRequest}) < minDate (${minRequestDate.toISOString()})`,
          );
          continue;
        }
      }

      const company = typedUser.company || 'Unassigned';
      const apiKey = typedUser.key;

      if (!usersByCompany[company]) {
        usersByCompany[company] = [];
        log(`[GROUP] Created new company group: ${company}`);
      }

      usersByCompany[company].push({
        ...typedUser,
        apiKey,
      });

      log(`[ADD] Added user ${typedUser.id} to company: ${company}`);
    }

    scanIteration++;
  } while (cursor !== 0);

  // Sort users within each company by lastRequest (most recent first)
  for (const company in usersByCompany) {
    usersByCompany[company].sort((a, b) => {
      const aDate = a.lastRequest ? new Date(a.lastRequest).getTime() : 0;
      const bDate = b.lastRequest ? new Date(b.lastRequest).getTime() : 0;
      return bDate - aDate;
    });
  }

  log(
    `[SCAN] Completed. Total keys processed: ${totalKeysProcessed}, Companies: ${Object.keys(usersByCompany).length}`,
  );

  return usersByCompany;
}

async function main() {
  const minDate = process.argv[2];
  const debug = process.argv.includes('--debug');

  if (debug) console.debug('[INIT] Starting active-users script');
  if (minDate) {
    if (debug) console.debug(`[INIT] Min date filter: ${minDate}`);
  } else {
    if (debug) console.debug('[INIT] No date filter applied');
  }

  try {
    if (debug) console.debug('[MAIN] Calling listUsersByCompany...');
    const usersByCompany = await listUsersByCompany(minDate, debug);

    if (debug)
      console.debug(
        `[MAIN] Retrieved ${Object.keys(usersByCompany).length} company groups`,
      );

    // Display summary
    const totalCompanies = Object.keys(usersByCompany).length;
    const totalUsers = Object.values(usersByCompany).reduce(
      (sum, users) => sum + users.length,
      0,
    );
    console.log('═══════════════════════════════════════════════════════');
    console.log(`📊 SUMMARY`);
    console.log(`   Companies: ${totalCompanies}`);
    console.log(`   Total users: ${totalUsers}`);
    if (minDate) {
      console.log(`   Filtered by date: >= ${minDate}`);
    }
    console.log('═══════════════════════════════════════════════════════');
    console.log('');

    // Display results grouped by company, limited to 1 user per group
    for (const [company, users] of Object.entries(usersByCompany)) {
      console.log(`📦 Company: ${company}`);
      console.log(`   Total users: ${users.length}`);
      console.log('   ---');

      users.slice(0, 1).forEach((user) => {
        // console.log(`   ID: ${user.id}`); // not required
        console.log(`   First user: ${user.name || 'N/A'}`);
        console.log(`   Email: ${user.email || 'N/A'}`);
        console.log(`   API Key: ${user.apiKey}`);
        console.log(`   Rate Limit: ${user.rateLimit || 'N/A'}`);
        console.log(`   Requests: ${user.requests || 0}`);
        console.log(
          `   Last Request: ${user.lastRequest || 'Never/Pre Feb 2025'}`,
        );
        console.log('');
      });
    }

    if (debug) console.debug('[MAIN] Display complete, exiting');
  } catch (error) {
    console.error('Error listing users:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

main();
