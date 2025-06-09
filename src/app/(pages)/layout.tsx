'use client';

import {
  oakDefaultTheme,
  OakGlobalStyle,
  OakThemeProvider,
} from '@oaknational/oak-components';
import { PostHogProvider } from '@/context/AnalyticsProvider';
import StyledComponentsRegistry from '@/lib/registry';

export default function PagesLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <OakGlobalStyle />
      <PostHogProvider>
        <StyledComponentsRegistry>
          <OakThemeProvider theme={oakDefaultTheme}>
            {children}
          </OakThemeProvider>
        </StyledComponentsRegistry>
      </PostHogProvider>
    </>
  );
}
