import { NextRequest, NextResponse } from 'next/server';
import { addUser } from '@/lib/apikeys';

async function handler(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
  }

  const { name, email, company } = await req.json();

  if (!name || !email || !company) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 },
    );
  }

  try {
    const apiKey = await addUser({ name, email, company });
    return NextResponse.json({ apiKey });
  } catch (error) {
    console.error('Error generating API key:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}

export { handler as GET, handler as POST, handler as PUT };
