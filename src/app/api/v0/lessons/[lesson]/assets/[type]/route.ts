import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { TRPCError } from '@trpc/server';
import { TRPC_ERROR_CODES_BY_KEY } from '@trpc/server/rpc';
import { StatusCodes } from 'http-status-codes';

import type { Context } from '@/lib/context';
import { getApiKeyFromRequest, withUser } from '@/lib/context';

// Map TRPC error codes to HTTP status codes
const trpcErrorCodeToHttpStatus: Record<string, number> = {
  PARSE_ERROR: StatusCodes.BAD_REQUEST,
  BAD_REQUEST: StatusCodes.BAD_REQUEST,
  UNAUTHORIZED: StatusCodes.UNAUTHORIZED,
  FORBIDDEN: StatusCodes.FORBIDDEN,
  NOT_FOUND: StatusCodes.NOT_FOUND,
  METHOD_NOT_SUPPORTED: StatusCodes.METHOD_NOT_ALLOWED,
  TIMEOUT: StatusCodes.REQUEST_TIMEOUT,
  CONFLICT: StatusCodes.CONFLICT,
  PRECONDITION_FAILED: StatusCodes.PRECONDITION_FAILED,
  PAYLOAD_TOO_LARGE: 413,
  UNPROCESSABLE_CONTENT: 422,
  TOO_MANY_REQUESTS: StatusCodes.TOO_MANY_REQUESTS,
  CLIENT_CLOSED_REQUEST: 499,
  INTERNAL_SERVER_ERROR: StatusCodes.INTERNAL_SERVER_ERROR,
};
import {
  getVideoFromMux,
  listFilesWithMimeType,
} from '@/lib/handlers/assets/helpers';
import { typeToMime, type DownloadTypeEnum } from '@/lib/handlers/assets/types';
import type { SignedAsset, Video } from '@/lib/owaClient';
import { protect } from '@/lib/protect';
import { assetBaseVideoUrl } from '@/lib/baseUrl';
import codes from 'http-codes';
import { assetsForLesson } from '@/lib/handlers/assets/assets';
import placeholderVideoLessons from '@/lib/queryGateData/placeholderVideoLessons.json' with { type: 'json' };
import { getGoogleCloudStorage } from '@/lib/bulk-data/data-stores';
import {
  captureApiRequestEvent,
  parseQueryParams,
} from '@/lib/analytics/posthogServer';
import { errorFormatter } from '@/lib/trpc';

export const dynamic = 'force-dynamic';

const storage = getGoogleCloudStorage();
const endpointPath = '/api/v0/lessons/{lesson}/assets/{type}';

const hasErrorCode = (error: unknown): error is { code: string } => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code: unknown }).code === 'string'
  );
};

const handler = async (
  req: NextRequest,
  { params }: { params: Promise<{ lesson: string; type: string }> },
): Promise<Response> => {
  const startedAt = Date.now();
  const apiKey = getApiKeyFromRequest(req);
  const queryParams = parseQueryParams(req.url);
  let args: { lesson: string; type: string } | undefined;
  let userId: number | undefined;

  const resHeaders = new Headers();

  try {
    // 1. get the user
    const user = await withUser(req, apiKey);
    userId = user?.id;
    const ctx = {
      user,
      resHeaders,
      req,
    } as unknown as Context;

    // manually check the protect
    await new Promise<void>((resolve, reject) => {
      protect({
        ctx,
        next: () => Promise.resolve().then(resolve),
        meta: { noCost: false },
      }).catch(reject);
    });

    const resolvedParams = await params;
    let { type } = resolvedParams;
    const { lesson } = resolvedParams;
    args = { lesson, type };

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
      const res = new NextResponse(stream as unknown as BodyInit, {
        headers: resHeaders,
      });
      res.headers.set('Content-Type', 'application/octet-stream');
      res.headers.set(
        'Content-Disposition',
        `attachment; filename="${filename}"`,
      );

      captureApiRequestEvent({
        url: req.url,
        apiKey,
        args,
        durationMs: Date.now() - startedAt,
        endpointPath,
        httpMethod: req.method || 'GET',
        queryParams,
        source: 'lesson_assets_route',
        success: true,
        userId,
      });

      return res;
    } else {
      const { stream } = asset as Video;
      let { download } = asset as Video;

      if (placeholderVideoLessons.includes(lesson)) {
        throw new TRPCError({
          message: `Failed to fetch: ${lesson} - video is not available`,
          cause: 'Video is a placeholder and not available',
          code: 'NOT_FOUND',
        });
      }

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

        const redirectResponse = NextResponse.redirect(url.toString(), 302);
        captureApiRequestEvent({
          url: req.url,
          apiKey,
          args,
          durationMs: Date.now() - startedAt,
          endpointPath,
          httpMethod: req.method || 'GET',
          queryParams,
          source: 'lesson_assets_route',
          success: true,
          userId,
        });

        return redirectResponse;
      }

      const filename = `${lesson}_${type.toLocaleLowerCase()}.${ext}`;

      if (!response.ok) {
        throw new TRPCError({
          message: `Failed to fetch: ${response.status} ${response.statusText}`,
          code: 'INTERNAL_SERVER_ERROR',
        });
      }

      const res = new NextResponse(response.body, { headers: resHeaders });

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

      captureApiRequestEvent({
        url: req.url,
        apiKey,
        args,
        durationMs: Date.now() - startedAt,
        endpointPath,
        httpMethod: req.method || 'GET',
        queryParams,
        source: 'lesson_assets_route',
        success: true,
        userId,
      });

      return res;
    }
  } catch (e: unknown) {
    let errorCode = 'UNKNOWN_ERROR';
    if (hasErrorCode(e)) {
      errorCode = e.code;
    } else if (e instanceof Error) {
      errorCode = e.name;
    }

    captureApiRequestEvent({
      url: req.url,
      apiKey,
      args,
      durationMs: Date.now() - startedAt,
      endpointPath,
      errorCode,
      httpMethod: req.method || 'GET',
      queryParams,
      source: 'lesson_assets_route',
      success: false,
      userId,
    });

    throw e;
  }
};

async function handlerWrapper(
  req: NextRequest,
  { params }: { params: Promise<{ lesson: string; type: string }> },
): Promise<Response> {
  try {
    return await handler(req, { params });
  } catch (e: unknown) {
    const { code, message } = e as { code: string; message: string };

    // if this is a TRPCError, we can map the code to status codes
    if (e instanceof TRPCError) {
      const errorPayload = errorFormatter({
        error: e,
        shape: {
          code: TRPC_ERROR_CODES_BY_KEY[e.code],
          message: e.message,
          data: {
            path: req.url,
            code: e.code,
            httpStatus:
              trpcErrorCodeToHttpStatus[e.code] ||
              StatusCodes.INTERNAL_SERVER_ERROR,
          },
        },
      });

      const status =
        trpcErrorCodeToHttpStatus[e.code] || StatusCodes.INTERNAL_SERVER_ERROR;

      return new NextResponse(
        JSON.stringify({ ...errorPayload, code: e.code }),
        {
          status,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

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
