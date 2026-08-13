import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  findUserByEmail,
  findUserById,
  findUserByKey,
  updateUser,
} from '@/lib/apikeys';
import { getRateLimiter } from '@/lib/rateLimit';
import { jsonError, jsonServerError } from '../../responses';
import type {
  AdminUsage,
  AdminUserDetailResponse,
  AdminUserResponse,
} from '../../schemas';
import { toAdminUser, updateUserSchema, userIdSchema } from '../../schemas';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

async function readUsage(
  user: Awaited<ReturnType<typeof findUserById>>,
): Promise<AdminUsage> {
  if (!user) {
    throw new Error('user is required');
  }

  // `true` is the no-cost path, so viewing a user in the admin UI does not
  // spend their quota.
  const rate = await getRateLimiter(user.rateLimit).check(user, true);

  return rate.isSubjectToRateLimiting
    ? {
        isSubjectToRateLimiting: true,
        limit: rate.limit,
        remaining: rate.remaining,
        reset: rate.reset,
      }
    : {
        isSubjectToRateLimiting: false,
        limit: null,
        remaining: null,
        reset: null,
      };
}

export async function GET(
  _req: NextRequest,
  { params }: RouteContext,
): Promise<Response> {
  const parsedId = userIdSchema.safeParse((await params).id);

  if (!parsedId.success) {
    return jsonError(400, 'Invalid user id', parsedId.error);
  }

  try {
    const user = await findUserById(parsedId.data);

    if (!user) {
      return jsonError(404, 'User not found');
    }

    return NextResponse.json<AdminUserDetailResponse>({
      user: toAdminUser(user),
      usage: await readUsage(user),
    });
  } catch (error) {
    return jsonServerError('Error reading API user:', error);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: RouteContext,
): Promise<Response> {
  const parsedId = userIdSchema.safeParse((await params).id);

  if (!parsedId.success) {
    return jsonError(400, 'Invalid user id', parsedId.error);
  }

  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return jsonError(400, 'Invalid JSON body');
  }

  const parsed = updateUserSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError(400, 'Invalid request', parsed.error);
  }

  try {
    const user = await findUserById(parsedId.data);

    if (!user) {
      return jsonError(404, 'User not found');
    }

    if (parsed.data.email && parsed.data.email !== user.email) {
      const clash = await findUserByEmail(parsed.data.email);
      if (clash && clash.key !== user.key) {
        return jsonError(409, 'Another user already has that email address');
      }
    }

    await updateUser({ key: user.key, ...parsed.data });
    const updated = await findUserByKey(user.key, false);

    if (!updated) {
      return jsonError(404, 'User not found');
    }

    return NextResponse.json<AdminUserResponse>({ user: toAdminUser(updated) });
  } catch (error) {
    return jsonServerError('Error updating API user:', error);
  }
}
