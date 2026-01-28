import { PassThrough } from 'stream';

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import type { Context } from '@/lib/context';
import { withUser } from '@/lib/context';
import { protect } from '@/lib/protect';
import type { File } from '@google-cloud/storage';
import codes from 'http-codes';
import archiver from 'archiver';
import { getGoogleCloudStorage } from '@/lib/bulk-data/data-stores';
export const dynamic = 'force-dynamic';

const bucketName = process.env.BULK_DATA_BUCKET || 'oak-prod-ldn-bulk-uploader';

const storage = getGoogleCloudStorage();

const handler = async (req: NextRequest): Promise<Response> => {
  // 1. get the user
  console.log('[bulk] Handler started');

  const user = await withUser(req);
  console.log('[bulk] User retrieved:', user?.id);
  const ctx = {
    user,
    resHeaders: req.headers,
    req,
  } as unknown as Context;

  // manually check the protect
  console.log('[bulk] Checking protect...');
  await new Promise<void>((resolve, reject) => {
    protect({
      ctx,
      next: () => Promise.resolve().then(resolve),
      meta: { noCost: false },
    }).catch(reject);
  });
  console.log('[bulk] Protect check passed');

  const body = (await req.json()) as { subjects?: string[] };
  const subjects = body.subjects || [];
  console.log('[bulk] Subjects requested:', subjects);
  const allFiles: File[] = [];

  for (const subject of subjects) {
    console.log(`[bulk] Fetching files for subject: ${subject}`);
    const [files] = await storage
      .bucket(bucketName)
      .getFiles({ prefix: `${subject}/${subject}.json`, delimiter: '/' });

    console.log(`[bulk] Found ${files?.length || 0} files for ${subject}`);
    if (files && files.length > 0) {
      allFiles.push(...files);
    }
  }

  console.log('[bulk] Total files to archive:', allFiles.length);
  const archive = archiver('zip', { zlib: { level: 1 } });

  const zipStream = new PassThrough();
  archive.pipe(zipStream);

  for (const file of allFiles) {
    console.log(`[bulk] Adding file to archive: ${file.name}`);
    archive.append(file.createReadStream(), {
      name: file.name.split('/').pop() || file.name,
    });
  }

  console.log('[bulk] Finalizing archive...');
  await archive.finalize();
  console.log('[bulk] Archive finalized, returning response');

  return new Response(zipStream as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/zip',
    },
  });
};

async function handlerWrapper(req: NextRequest): Promise<Response> {
  try {
    return await handler(req);
  } catch (e: unknown) {
    const { code, message } = e as { code: string; message: string };

    const statusCode =
      typeof code === 'string' && code in codes
        ? codes[code as keyof typeof codes]
        : 500;

    return new NextResponse(JSON.stringify({ message, code }), {
      status: statusCode,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export { handlerWrapper as POST };

// by default Vercel set the max limit to 5 minutes
// https://vercel.com/docs/functions/limitations#max-duration
// export const maxDuration = 60 * 5; // seconds
