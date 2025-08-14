import { PassThrough } from 'stream';

import { type NextRequest, NextResponse } from 'next/server';
import { type Context, withUser } from '@/lib/context';
import { protect } from '@/lib/protect';
import { File } from '@google-cloud/storage';
import codes from 'http-codes';
import archiver from 'archiver';
import { getGoogleCloudStorage } from '@/lib/bulk-data/data-stores';
export const dynamic = 'force-dynamic';

const bucketName = process.env.BULK_DATA_BUCKET || 'oak-prod-ldn-bulk-uploader';

const storage = getGoogleCloudStorage();

const handler = async (req: NextRequest) => {
  // 1. get the user

  const user = await withUser(req);
  const ctx = {
    user,
    resHeaders: req.headers,
  } as Context;

  // manually check the protect
  await new Promise(async (resolve, reject) => {
    try {
      await protect({
        ctx,
        next: async () => resolve(void 0),
        meta: { noCost: false },
      });
    } catch (error) {
      reject(error);
    }
  });

  const body = await req.json();
  const subjects = body.subjects || [];
  const allFiles: File[] = [];

  for (const subject of subjects) {
    const [files] = await storage
      .bucket(bucketName)
      .getFiles({ prefix: `${subject}/${subject}.json`, delimiter: '/' });

    if (files && files.length > 0) {
      allFiles.push(...files);
    }
  }

  const archive = archiver('zip', { zlib: { level: 9 } });

  const zipStream = new PassThrough();
  archive.pipe(zipStream);

  for (const file of allFiles) {
    archive.append(file.createReadStream(), {
      name: file.name.split('/').pop() || file.name,
    });
  }

  archive.finalize();

  return new Response(zipStream as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/zip',
    },
  });
};

async function handlerWrapper(req: NextRequest) {
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

export {
  handlerWrapper as GET,
  handlerWrapper as POST,
  handlerWrapper as PUT,
  handlerWrapper as PATCH,
  handlerWrapper as DELETE,
  handlerWrapper as OPTIONS,
  handlerWrapper as HEAD,
};

export const maxDuration = 120; // seconds