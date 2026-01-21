import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { addUser } from '@/lib/apikeys';

interface ApiKeyRequestBody {
  name: string;
  email: string;
  company: string;
}

export interface ApiKeyResponse {
  apiKey?: string;
  error?: string;
}

async function handler(req: NextRequest): Promise<Response> {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
  }

  const { name, email, company } = (await req.json()) as ApiKeyRequestBody;

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
