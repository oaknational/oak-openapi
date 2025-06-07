'use client';
import dynamic from 'next/dynamic';
import { SwaggerUIProps } from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import './playground.css';

const SwaggerUI = dynamic<SwaggerUIProps>(() => import('swagger-ui-react'), {
  ssr: false,
});

export default function Playground() {
  return (
    <>
      <SwaggerUI url={`/api/v0/swagger.json`} />
    </>
  );
}
