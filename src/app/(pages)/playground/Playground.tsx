'use client';
import dynamic from 'next/dynamic';
import { SwaggerUIProps } from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import PlaygroundStyle from '@/old/pages/styles/playgroundStyles';

const SwaggerUI = dynamic<SwaggerUIProps>(() => import('swagger-ui-react'), {
  ssr: false,
});

export default function Playground() {
  return (
    <>
      <PlaygroundStyle />
      <SwaggerUI url={`/api/v0/swagger.json`} />
    </>
  );
}
