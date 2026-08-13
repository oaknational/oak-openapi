'use client';
import dynamic from 'next/dynamic';
import type { SwaggerUIProps } from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import '@/app/(pages)/playground/playground.css';

const SwaggerUI = dynamic<SwaggerUIProps>(() => import('swagger-ui-react'), {
  ssr: false,
});

interface MutableSwaggerResponse {
  status: number;
  type?: string;
  ok?: boolean;
  statusText?: string;
  headers: Record<string, string | undefined>;
  text?: string;
  data?: unknown;
  obj?: unknown;
}

const interceptResponse: NonNullable<SwaggerUIProps['responseInterceptor']> = (
  res,
) => {
  const mutableResponse = res as unknown as MutableSwaggerResponse;
  const isRedirect =
    mutableResponse.status === 0 ||
    mutableResponse.type === 'opaqueredirect' ||
    (mutableResponse.status >= 300 && mutableResponse.status < 400);

  if (isRedirect) {
    mutableResponse.ok = true; // stop Swagger UI treating it as a failed request
    mutableResponse.status = mutableResponse.status || 302;
    mutableResponse.statusText = 'Redirect intercepted (not followed)';
    mutableResponse.headers['content-type'] = 'application/json';

    const location =
      mutableResponse.headers.location ||
      mutableResponse.headers.Location ||
      'unknown (opaque response — cross-origin redirect)';
    const responseBody = {
      message:
        'Redirects are not followed in the playground - please check using curl or your own HTTP client.',
      location,
    };
    const body = JSON.stringify(responseBody);

    mutableResponse.text = body;
    mutableResponse.data = body;
    mutableResponse.obj = responseBody;
  }
  return res;
};

export default function Playground(): React.ReactElement {
  return (
    <>
      <SwaggerUI
        url={`/api/v0/swagger.json`}
        tryItOutEnabled={true}
        requestInterceptor={(req) => {
          req.redirect = 'manual'; // don't follow redirects
          return req;
        }}
        responseInterceptor={interceptResponse}
      />
    </>
  );
}
