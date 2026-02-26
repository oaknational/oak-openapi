import { NextResponse } from 'next/server';
import schema from './schema.json' assert { type: 'json' };

export const GET = () => {
  const schemaContent = JSON.stringify(schema, null, 2);
  return new NextResponse(schemaContent, {
    status: 200,
    headers: {
      'Content-Type': 'application/schema+json',
      'Content-Disposition': 'attachment; filename="schema.json"',
    },
  });
};
