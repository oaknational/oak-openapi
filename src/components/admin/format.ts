// Not imported from @/lib/rateLimit: that module builds Upstash clients at
// module scope, which has no business in a browser bundle.
const DEFAULT_RATE_LIMIT = 1000;

/** Records created before createdAt/updatedAt existed carry null. */
export const EMPTY = '—';

export function formatDateTime(value: string | null): string {
  if (!value) {
    return EMPTY;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return EMPTY;
  }

  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-GB').format(value);
}

export function isUnlimited(rateLimit: number): boolean {
  return rateLimit === 0;
}

export function formatRateLimit(rateLimit: number): string {
  return isUnlimited(rateLimit)
    ? 'Unlimited'
    : `${formatNumber(rateLimit)} / hour`;
}

export const rateLimitHint = `Leave blank for the default of ${formatNumber(
  DEFAULT_RATE_LIMIT,
)}. Enter 0 for unlimited.`;

/** Clears one field's error as soon as the user edits it. */
export function withoutIssue(
  issues: Record<string, string>,
  field: string,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(issues).filter(([name]) => name !== field),
  );
}
