'use client';
import dynamic from 'next/dynamic';
import type { SwaggerUIProps } from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import '@/app/(pages)/playground/playground.css';

const SwaggerUI = dynamic<SwaggerUIProps>(() => import('swagger-ui-react'), {
  ssr: false,
});

export default function Playground(): React.ReactElement {
  return (
    <>
      <SwaggerUI url={`/api/v0/swagger.json`} />
    </>
  );
}
