import dynamic from 'next/dynamic';
import Head from 'next/head';
import { SwaggerUIProps } from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import PlaygroundStyle from './styles/playgroundStyles';

const SwaggerUI = dynamic<SwaggerUIProps>(() => import('swagger-ui-react'), {
  ssr: false,
});

export default function Page() {
  return (
    <>
      <Head>
        <title>Oak API Playground</title>
      </Head>
      <PlaygroundStyle />
      <SwaggerUI url="/api/v0/swagger.json" />
    </>
  );
}
