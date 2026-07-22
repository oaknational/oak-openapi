import path from 'node:path';

export const apiCatalogPath = '/.well-known/api-catalog';
export const apiCatalogProfile = 'https://www.rfc-editor.org/info/rfc9727';
export const apiCatalogContentType = `application/linkset+json; profile="${apiCatalogProfile}"`;
export const apiCatalogLinkHeader = `<${apiCatalogPath}>; rel="api-catalog"; type="application/linkset+json"; profile="${apiCatalogProfile}"; title="API catalog"`;
export const homepageDiscoveryLinkHeader = [
  apiCatalogLinkHeader,
  '</api/v0/swagger.json>; rel="service-desc"; type="application/json"; title="OpenAPI description"',
  '</docs/about-oaks-api/api-overview>; rel="service-doc"; type="text/html"; title="API overview"',
  '</playground>; rel="service-doc"; type="text/html"; title="Interactive API playground"',
].join(', ');

/** @type {(phase: string) => Promise<import("next").NextConfig>} */
const getConfig = async () => {
  /** @type {import('next').NextConfig} */
  const config = {
    devIndicators: false,
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
    async headers() {
      return [
        {
          source: '/',
          headers: [
            {
              key: 'Link',
              value: homepageDiscoveryLinkHeader,
            },
          ],
        },
        {
          source: apiCatalogPath,
          headers: [
            {
              key: 'Content-Type',
              value: apiCatalogContentType,
            },
            {
              key: 'Link',
              value: apiCatalogLinkHeader,
            },
          ],
        },
      ];
    },
    serverRuntimeConfig: {
      BRANCH: process.env.BRANCH,
      DEPLOY_CONTEXT: process.env.CONTEXT,
    },
  };

  return config;
};

export default getConfig;
