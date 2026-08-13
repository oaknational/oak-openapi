import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { findUserById, rollApiKey } from '@/lib/apikeys';
import { jsonError, jsonServerError } from '../../../responses';
import type { AdminRollKeyResponse } from '../../../schemas';
import { rollKeySchema, toAdminUser, userIdSchema } from '../../../schemas';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
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

  const parsed = rollKeySchema.safeParse(body);

  if (!parsed.success) {
    return jsonError(400, 'Rolling a key requires { "confirm": "roll" }');
  }

  try {
    const user = await findUserById(parsedId.data);

    if (!user) {
      return jsonError(404, 'User not found');
    }

    const { previousKey, user: rolled } = await rollApiKey(user.key);

    return NextResponse.json<AdminRollKeyResponse>({
      user: toAdminUser(rolled),
      previousKey,
    });
  } catch (error) {
    return jsonServerError('Error rolling API key:', error);
  }
}
