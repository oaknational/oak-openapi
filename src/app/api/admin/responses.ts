import { NextResponse } from 'next/server';
import type * as z from 'zod/v4';

export interface AdminErrorIssue {
  path: string;
  message: string;
}

export interface AdminErrorBody {
  error: string;
  issues?: AdminErrorIssue[];
}

/**
 * A consistent error body for the admin routes. Zod issues are flattened to
 * `{ path, message }` so the UI can render a field-level error summary.
 */
export function jsonError(
  status: number,
  error: string,
  zodError?: z.ZodError,
): NextResponse<AdminErrorBody> {
  const issues = zodError?.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }));

  return NextResponse.json(issues?.length ? { error, issues } : { error }, {
    status,
  });
}

/** Logs the real cause and returns a body that never leaks Redis internals. */
export function jsonServerError(
  context: string,
  cause: unknown,
): NextResponse<AdminErrorBody> {
  console.error(context, cause);
  return jsonError(500, 'Internal Server Error');
}
