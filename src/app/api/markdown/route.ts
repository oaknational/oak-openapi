import type { NextRequest } from 'next/server';
import {
  htmlToMarkdown,
  estimateMarkdownTokens,
} from '@/lib/markdown/htmlToMarkdown';

const MARKDOWN_CONTENT_TYPE = 'text/markdown; charset=utf-8';
const MARKDOWN_BYPASS_HEADER = 'x-markdown-negotiation-bypass';
const MARKDOWN_PATH_HEADER = 'x-markdown-original-path';
const MARKDOWN_BUILD_HEADER = 'x-markdown-build-version';
const MARKDOWN_CACHE_CONTROL =
  'public, s-maxage=3600, stale-while-revalidate=86400';

function withAcceptVary(existing: string | null): string {
  if (!existing) {
    return 'Accept';
  }

  const values = existing
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  if (values.some((value) => value.toLowerCase() === 'accept')) {
    return values.join(', ');
  }

  values.push('Accept');
  return values.join(', ');
}

function makeOrigin(req: NextRequest): string {
  const forwardedProto = req.headers.get('x-forwarded-proto');
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host');

  if (forwardedProto && host) {
    return `${forwardedProto}://${host}`;
  }

  return req.nextUrl.origin;
}

function getNegotiatedPath(req: NextRequest): string | null {
  const headerPath = req.headers.get(MARKDOWN_PATH_HEADER);
  if (headerPath) {
    return headerPath;
  }

  const directPath = req.nextUrl.searchParams.get('path');
  if (directPath) {
    return directPath;
  }

  const rewriteTarget = req.headers.get('x-middleware-rewrite');
  if (!rewriteTarget) {
    return null;
  }

  try {
    const rewrittenUrl = new URL(rewriteTarget, req.nextUrl.origin);
    return rewrittenUrl.searchParams.get('path');
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest): Promise<Response> {
  const path = getNegotiatedPath(req);

  if (!path || !path.startsWith('/')) {
    return new Response('Missing or invalid path parameter', {
      status: 400,
      headers: {
        'content-type': 'text/plain; charset=utf-8',
      },
    });
  }

  const targetUrl = new URL(path, `${makeOrigin(req)}/`);
  const upstreamHeaders = new Headers(req.headers);
  upstreamHeaders.set('accept', 'text/html,application/xhtml+xml');
  upstreamHeaders.set(MARKDOWN_BYPASS_HEADER, '1');

  const upstreamResponse = await fetch(targetUrl, {
    method: 'GET',
    headers: upstreamHeaders,
    redirect: 'follow',
  });

  const contentType = upstreamResponse.headers.get('content-type') || '';

  if (!contentType.toLowerCase().includes('text/html')) {
    return upstreamResponse;
  }

  const html = await upstreamResponse.text();
  const markdown = htmlToMarkdown(html);
  const headers = new Headers(upstreamResponse.headers);

  headers.set('content-type', MARKDOWN_CONTENT_TYPE);
  headers.set('vary', withAcceptVary(headers.get('vary')));
  headers.set('cache-control', MARKDOWN_CACHE_CONTROL);
  headers.set('x-markdown-tokens', String(estimateMarkdownTokens(markdown)));

  const buildVersion = req.headers.get(MARKDOWN_BUILD_HEADER);
  if (buildVersion) {
    headers.set(MARKDOWN_BUILD_HEADER, buildVersion);
  }

  headers.delete('content-encoding');
  headers.delete('content-range');
  headers.delete('transfer-encoding');
  headers.delete('etag');
  headers.delete('last-modified');
  headers.delete('content-length');

  return new Response(markdown, {
    status: upstreamResponse.status,
    headers,
  });
}
