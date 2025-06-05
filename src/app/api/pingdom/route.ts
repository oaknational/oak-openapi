import { getClient, gql, views } from '~/lib/owaClient';
import { performance } from 'node:perf_hooks';
import { NextResponse } from 'next/server';
import { Context } from '~/lib/context';

async function handler({ resHeaders }: Context) {
  const start = performance.now();
  const client = getClient();
  const query = gql`
    query {
    ${views
      .map((view) => {
        return `
          ${view}(limit: 1) {
            __typename
          }
      `;
      })
      .join('\n')}
    }
  `;

  resHeaders.set('Content-Type', 'application/xml');

  try {
    await client.request(query); // if the MV is missing then this will throw an error
    const end = performance.now();
    const duration = end - start;
    const response = new NextResponse(
      `<pingdom_http_custom_check><status>OK</status><response_time>${duration.toFixed(3)}</response_time></pingdom_http_custom_check>`,
      { status: 200, statusText: 'ok' },
    );
    return response;
  } catch (_) {
    const response = new NextResponse(
      '<pingdom_http_custom_check><status>failure</status></pingdom_http_custom_check>',
      { status: 200, statusText: 'failure' },
    );
    return response;
  }
}

export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as PATCH,
  handler as DELETE,
  handler as OPTIONS,
  handler as HEAD,
};
