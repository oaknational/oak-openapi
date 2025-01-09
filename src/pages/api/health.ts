import { NextApiRequest, NextApiResponse } from 'next';
import { getClient, gql, views } from '~/lib/owaClient';

export default async function handler(_: NextApiRequest, res: NextApiResponse) {
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

  try {
    await client.request(query); // if the MV is missing then this will throw an error
    res.status(200).json({ status: 'ok' });
  } catch (_) {
    res.status(500).json({ status: 'fail' });
  }
}
