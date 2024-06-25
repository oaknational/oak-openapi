import type { AppProps } from 'next/app';
import {
  OakThemeProvider,
  oakDefaultTheme,
  OakGlobalStyle,
} from '@oaknational/oak-components';

export default function OakOpenAPIApp({ Component }: AppProps) {
  return (
    <>
      <OakGlobalStyle />
      <OakThemeProvider theme={oakDefaultTheme}>
        <Component />
      </OakThemeProvider>
    </>
  );
}
