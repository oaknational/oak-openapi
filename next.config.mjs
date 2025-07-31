import path from 'node:path';

/** @type {(phase: string) => Promise<import("next").NextConfig>} */
const getConfig = async () => {
  /** @type {import('next').NextConfig} */
  const config = {
    webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
      config.module.rules.push({
        test: /\.(graphql|gql)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: path.resolve('./src/loaders/gql.mjs'),
          },
        ],
      });

      return config;
    },

    compiler: {
      styledComponents: true,
    },
    reactStrictMode: true,
    images: {
      domains: ['oaknationalacademy-res.cloudinary.com', 'cdn.sanity.io'],
    },
    eslint: {
      ignoreDuringBuilds: !!process.env.CI,
    },
    productionBrowserSourceMaps: true,
    serverRuntimeConfig: {
      BRANCH: process.env.BRANCH,
      DEPLOY_CONTEXT: process.env.CONTEXT,
    },
  };

  return config;
};

export default getConfig;
