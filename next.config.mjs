// const {
//   BugsnagBuildReporterPlugin,
//   BugsnagSourceMapUploaderPlugin,
// } = require('webpack-bugsnag-plugins');

// const { PHASE_PRODUCTION_BUILD, PHASE_TEST } = require('next/constants');

// const bugsnagApiKey = process.env.NEXT_PUBLIC_BUGSNAG_API;

// if (!bugsnagApiKey) {
//   throw new Error('Missing env var NEXT_PUBLIC_BUGSNAG_API');
// }

// const BUGSNAG_API_KEY = process.env.BUGSNAG_API_KEY;

// if (!BUGSNAG_API_KEY || typeof BUGSNAG_API_KEY !== 'string') {
//   throw new Error('Missing env var BUGSNAG_API_KEY');
// }

/** @type {(phase: string) => Promise<import("next").NextConfig>} */
const getConfig = async () => {
  /** @type {import('next').NextConfig} */
  const config = {
    compiler: {
      styledComponents: true,
    },
    reactStrictMode: true,
    swcMinify: true,
    images: {
      domains: ['oaknationalacademy-res.cloudinary.com'],
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
