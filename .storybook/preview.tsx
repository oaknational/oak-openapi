import type { Preview } from '@storybook/react';
import * as NextImage from 'next/image';
import { RouterContext } from 'next/dist/shared/lib/router-context.shared-runtime';

const OriginalNextImage = NextImage.default;

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Storybook mock for next/image
OriginalNextImage.defaultProps = {
  unoptimized: true,
};

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    options: {
      storySort: {
        method: 'alphabetical',
        order: ['Introduction'],
      },
    },
    viewMode: 'docs',
    previewTabs: {
      canvas: {
        hidden: true,
      },
    },
    nextRouter: {
      Provider: RouterContext.Provider,
    },
  },
};

export default preview;
