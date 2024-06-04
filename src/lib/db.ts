import { Pool } from 'pg';

type Options = {
  connectionString?: string;
  ssl?: {
    rejectUnauthorized: boolean;
    ca: string;
  };
};

const options: Options = {
  connectionString: process.env.AI_DATABASE_URL?.split('?')[0],
};

if (process.env.AI_DATABASE_URL?.includes('?')) {
  options.ssl = {
    rejectUnauthorized: false,
    ca: cert(), // RADAR unsure why this works when the cert is an empty string
  };
}

export const aiPool: Pool = new Pool(options);

function cert() {
  return process.env.AI_DATABASE_CERT as string;
}
