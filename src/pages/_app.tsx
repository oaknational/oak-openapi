import type { AppProps } from 'next/app';
import {
  OakThemeProvider,
  oakDefaultTheme,
  OakGlobalStyle,
} from '@oaknational/oak-components';
import { PostHogProvider } from '~/context/AnalyticsProvider';
import { HubspotProvider } from 'next-hubspot';

export default function OakOpenAPIApp({ Component }: AppProps) {
  return (
    <>
      <OakGlobalStyle />
      <PostHogProvider>
        <HubspotProvider>
          <OakThemeProvider theme={oakDefaultTheme}>
            <Component />
          </OakThemeProvider>
        </HubspotProvider>
      </PostHogProvider>
    </>
  );
}
