'use client';

import {
  oakDefaultTheme,
  OakGlobalStyle,
  OakThemeProvider,
} from '@oaknational/oak-components';
import StyledComponentsRegistry from '@/lib/registry';

export default function StyleContext({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <>
      <StyledComponentsRegistry>
        <OakThemeProvider theme={oakDefaultTheme}>
          <OakGlobalStyle />
          {children}
        </OakThemeProvider>
      </StyledComponentsRegistry>
    </>
  );
}
