import { NextApiRequest, NextApiResponse } from 'next';
import { addUser } from '~/lib/apikeys';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { name, email, company } = req.body;

  if (!name || !email || !company) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const apiKey = await addUser({ name, email, company });
    return res.status(200).json({ apiKey });
  } catch (error) {
    console.error('Error generating API key:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
