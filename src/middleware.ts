import { NextRequest, NextResponse } from 'next/server';


export function middleware(req: NextRequest) {
  const authHeader = req.headers.get('authorization');

  if (!authHeader) {
    const res = new NextResponse(null, { status: 401 });
    res.headers.set('WWW-Authenticate', 'Basic');
    return res;
  }

  const [, base64Credentials] = authHeader.split(' ');
  const [username, password] = Buffer.from(base64Credentials, 'base64')
    .toString()
    .split(':');

  const validUsername = process.env.AUTH_USERNAME;
  const validPassword = process.env.AUTH_PASSWORD;

  if (username === validUsername && password === validPassword) {
    return NextResponse.next();
  }

  const res = new NextResponse(null, { status: 401 });
  res.headers.set('WWW-Authenticate', 'Basic');
  return res;
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
