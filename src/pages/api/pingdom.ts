import { NextApiRequest, NextApiResponse } from 'next';
import { getClient, gql, views } from '~/lib/owaClient';
import { performance } from 'node:perf_hooks';

export default async function handler(_: NextApiRequest, res: NextApiResponse) {
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

  res.setHeader('Content-Type', 'application/xml');

  try {
    await client.request(query); // if the MV is missing then this will throw an error
    const end = performance.now();
    const duration = end - start;
    res
      .status(200)
      .send(
        `<pingdom_http_custom_check><status>OK</status><response_time>${duration.toFixed(3)}</response_time></pingdom_http_custom_check>`,
      );
  } catch (_) {
    res
      .status(200)
      .send(
        '<pingdom_http_custom_check><status>failure</status></pingdom_http_custom_check>',
      );
  }
}
