const {
  BugsnagBuildReporterPlugin,
  BugsnagSourceMapUploaderPlugin,
} = require('webpack-bugsnag-plugins');

// const {
//   getAppVersion,
//   getReleaseStage,
//   RELEASE_STAGE_PRODUCTION,
//   RELEASE_STAGE_TESTING,
// } = require("./scripts/build_config_helpers.js");

const { PHASE_PRODUCTION_BUILD, PHASE_TEST } = require('next/constants');

const bugsnagApiKey = process.env.NEXT_PUBLIC_BUGSNAG_API;

if (!bugsnagApiKey) {
  throw new Error('Missing env var NEXT_PUBLIC_BUGSNAG_API');
}

const BUGSNAG_API_KEY = process.env.BUGSNAG_API_KEY;

if (!BUGSNAG_API_KEY || typeof BUGSNAG_API_KEY !== 'string') {
  throw new Error('Missing env var BUGSNAG_API_KEY');
}

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
    // transpilePackages: ["@oakai/api", "@oakai/db"],
    // We already do linting on GH actions
    eslint: {
      ignoreDuringBuilds: !!process.env.CI,
    },
    // Make sure production source maps exist for e.g. Bugsnag
    productionBrowserSourceMaps: true,
    serverRuntimeConfig: {
      // These netlify env variables are only available at build-time
      // unless we explicitly copy them to serverRuntimeConfig, unlike
      // those which come from the env we configure ourselves
      BRANCH: process.env.BRANCH,
      DEPLOY_CONTEXT: process.env.CONTEXT,
    },
    // webpack: (config) => {
    //   return config;
    // },
  };

  return config;
};

module.exports = getConfig;
