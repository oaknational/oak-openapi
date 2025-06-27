import { type NextRequest, NextResponse } from 'next/server';
import { type Context, withUser } from '@/lib/context';
import {
  getVideoFromMux,
  listFilesWithMimeType,
} from '@/lib/handlers/assets/helpers';
import { typeToMime, DownloadTypeEnum } from '@/lib/handlers/assets/types';
import { SignedAsset, Video } from '@/lib/owaClient';
import { protect } from '@/lib/protect';
import { Storage } from '@google-cloud/storage';
import { TRPCError } from '@trpc/server';
import { assetBaseVideoUrl } from '@/lib/baseUrl';
import codes from 'http-codes';
import { assetsForLesson } from '@/lib/handlers/assets/assets';

export const dynamic = 'force-dynamic';

let storage;

// Check if GOOGLE_APPLICATION_CREDENTIALS_JSON is set
if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
  const credentials = JSON.parse(
    process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON,
  );
  // Initialize storage client with credentials
  storage = new Storage({ credentials });
} else {
  // Use default method, which relies on GOOGLE_APPLICATION_CREDENTIALS path
  storage = new Storage();
}

const handler = async (
  req: NextRequest,
  { params }: { params: Promise<{ lesson: string; type: string }> },
) => {
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

  let { type } = await params;
  const { lesson } = await params;

  const { assets } = await assetsForLesson(lesson);

  const usePPTX = type === 'slideDeck';
  if (usePPTX) {
    type = type.replace('PPTX', '') as DownloadTypeEnum;
  }

  const asset = assets[type as DownloadTypeEnum];

  if (type !== 'video') {
    let { bucket_path } = asset as SignedAsset;
    const { bucket_name } = asset as SignedAsset;

    const list = await listFilesWithMimeType(
      storage,
      bucket_name,
      bucket_path.split('/').slice(0, -1).join('/'),
    );

    const ext = usePPTX ? 'pptx' : bucket_path.split('.').pop() || 'pdf';

    const mime = typeToMime.get(ext.toLowerCase());

    if (!mime) {
      throw new TRPCError({
        message: 'Unsupported file type',
        code: 'BAD_REQUEST',
      });
    }

    // find the file with the correct extension (pptx) or file name for pdf
    const found = list.find((file) => {
      if (usePPTX) {
        return file.mimeType === mime;
      } else {
        return file.name === bucket_path;
      }
    });

    if (found) {
      bucket_path = found.name;
    }

    const filename = `${lesson}_${type.toLocaleLowerCase()}.${ext.toLowerCase()}`;

    const stream = storage
      .bucket(bucket_name)
      .file(bucket_path)
      .createReadStream();

    // we need to convert the stream to a BodyInit even though it's a ReadableStream
    // and ReadableStreams are allowed to be passed to new Response(s) - but there's
    // something weird in the types that requires it to be converted to a BodyInit
    const res = new NextResponse(stream as unknown as BodyInit);
    res.headers.set('Content-Type', 'application/octet-stream');
    res.headers.set(
      'Content-Disposition',
      `attachment; filename="${filename}"`,
    );

    return res;
  } else {
    const { stream } = asset as Video;
    let { download } = asset as Video;

    if (!download) {
      // test if the download is there as our db is often out of sync with mux
      download = await getVideoFromMux(stream);
    }

    const response = await fetch(download || stream);

    const url = new URL(download || stream);
    const ext = url.pathname.split('.').pop();

    if (ext === 'm3u8') {
      // redirect to the video stream
      url.hostname = new URL(assetBaseVideoUrl).hostname;

      // TODO test me
      return NextResponse.redirect(url.toString(), 302);
    }

    const filename = `${lesson}_${type.toLocaleLowerCase()}.${ext}`;

    if (!response.ok) {
      throw new TRPCError({
        message: `Failed to fetch: ${response.status} ${response.statusText}`,
        code: 'INTERNAL_SERVER_ERROR',
      });
    }

    const res = new NextResponse(response.body);

    // Set headers for streaming the file to the client
    res.headers.set(
      'Content-Type',
      response.headers.get('content-type') || 'application/octet-stream',
    );
    res.headers.set(
      'Content-Disposition',
      `attachment; filename="${filename}"`,
    );

    if (response.body === null) {
      throw new TRPCError({
        message: 'Video could not be streamed',
        code: 'INTERNAL_SERVER_ERROR',
      });
    }

    return res;
  }
};

async function handlerWrapper(
  req: NextRequest,
  { params }: { params: Promise<{ lesson: string; type: string }> },
) {
  try {
    return await handler(req, { params });
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
