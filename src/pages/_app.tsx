import type { AppProps } from 'next/app';
import {
  OakThemeProvider,
  oakDefaultTheme,
  OakGlobalStyle,
} from '@oaknational/oak-components';
import { Lexend } from 'next/font/google';

const lexend = Lexend({ subsets: ['latin'] });

export default function OakOpenAPIApp({ Component }: AppProps) {
  return (
    <>
      <OakGlobalStyle />

      <main className={lexend.className}>
        <OakThemeProvider theme={oakDefaultTheme}>
          <Component />
        </OakThemeProvider>
      </main>
    </>
  );
}
