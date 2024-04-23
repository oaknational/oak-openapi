let domain = 'http://localhost:2626';

if (process.env.VERCEL_URL) {
  domain = `https://${process.env.VERCEL_URL}`;
}

if (process.env.VERCEL_ENV === 'production' && process.env.PRODUCTION_API_URL) {
  domain = process.env.PRODUCTION_API_URL;
}

export const baseUrl = `${domain}/api/v0`;
