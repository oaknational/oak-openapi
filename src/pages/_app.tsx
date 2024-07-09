import type { AppProps } from 'next/app';
import {
  OakThemeProvider,
  oakDefaultTheme,
  OakGlobalStyle,
} from '@oaknational/oak-components';
import StyledComponentsRegistry from '~/lib/registry';

export default function OakOpenAPIApp({ Component }: AppProps) {
  return (
    <>
      <OakGlobalStyle />
      <StyledComponentsRegistry>
        <OakThemeProvider theme={oakDefaultTheme}>
          <Component />
        </OakThemeProvider>
      </StyledComponentsRegistry>
    </>
  );
}
