import { baseUrl } from './baseUrl';

export function nextPageLink(
  requestUrl: string,
  offset: number,
  limit: number,
  options: { unit?: string } | undefined = undefined,
): string {
  const url = new URL(requestUrl, `http://${baseUrl}`);
  const searchParams = url.searchParams;

  searchParams.set('offset', (offset + limit).toString());
  searchParams.set('limit', limit.toString());
  if (options) {
    const { unit } = options;
    if (unit) {
      searchParams.set('unit', unit);
    }
  }

  return `${baseUrl}${url.pathname}?${searchParams.toString()}`;
}
