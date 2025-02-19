import dynamic from 'next/dynamic';
import '@stoplight/elements/styles.min.css';
import Head from 'next/head';

const API = dynamic(() => import('@stoplight/elements').then((m) => m.API), {
  ssr: false,
});

export default function Page() {
  return (
    <>
      <Head>
        <title>Oak API Playground</title>
      </Head>
      <API apiDescriptionUrl="/api/v0/swagger.json" />
    </>
  );
}
