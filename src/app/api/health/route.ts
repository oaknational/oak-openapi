import { NextRequest, NextResponse } from 'next/server';
import { getClient, gql, views } from '~/lib/owaClient';

export default async function handler(_: NextRequest, res: NextResponse) {
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
    return NextResponse.json({ body: 'ok' });
  } catch (_) {
    return NextResponse.json({ body: 'fail' }, { status: 500 });
    // res.status(500).json({ status: 'fail' });
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
