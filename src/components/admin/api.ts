import type {
  AdminRollKeyResponse,
  AdminUserDetailResponse,
  AdminUserResponse,
  AdminUsersResponse,
  CreateUserBody,
  ListUsersQuery,
  UpdateUserBody,
} from '@/app/api/admin/schemas';
import type { AdminErrorIssue } from '@/app/api/admin/responses';

/**
 * Thin typed wrappers over the admin API.
 *
 * These run in the browser, which replays the Basic auth credentials the user
 * already supplied for /admin on every same-origin request — which is why the
 * pages fetch client-side rather than calling the data layer on the server.
 */

export class AdminApiError extends Error {
  readonly status: number;
  readonly issues: AdminErrorIssue[];

  constructor(status: number, message: string, issues: AdminErrorIssue[] = []) {
    super(message);
    this.name = 'AdminApiError';
    this.status = status;
    this.issues = issues;
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: init?.body
      ? { 'Content-Type': 'application/json', ...init?.headers }
      : init?.headers,
  });

  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const failure = (body ?? {}) as {
      error?: string;
      issues?: AdminErrorIssue[];
    };
    throw new AdminApiError(
      response.status,
      failure.error ?? 'Something went wrong',
      failure.issues ?? [],
    );
  }

  return body as T;
}

export function createUser(body: CreateUserBody): Promise<AdminUserResponse> {
  return request('/api/admin/users', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function listUsers(
  query: Partial<ListUsersQuery> = {},
): Promise<AdminUsersResponse> {
  const params = new URLSearchParams();

  for (const [name, value] of Object.entries(query)) {
    if (value !== undefined && value !== '') {
      params.set(name, String(value));
    }
  }

  return request(`/api/admin/users?${params}`);
}

export function getUser(id: number): Promise<AdminUserDetailResponse> {
  return request(`/api/admin/users/${id}`);
}

export function updateUser(
  id: number,
  body: UpdateUserBody,
): Promise<AdminUserResponse> {
  return request(`/api/admin/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function rollKey(id: number): Promise<AdminRollKeyResponse> {
  return request(`/api/admin/users/${id}/roll-key`, {
    method: 'POST',
    body: JSON.stringify({ confirm: 'roll' }),
  });
}
