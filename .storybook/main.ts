import type { StorybookConfig } from "@storybook/nextjs";

const config: StorybookConfig = {
  stories: [
    "../src/components/introduction.mdx",
    "../src/**/*.stories.@(js|jsx|ts|tsx)",
  ],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "storybook-css-modules-preset",
    "@storybook/addon-storysource",
    "@storybook/addon-a11y",
  ],
  framework: {
    name: "@storybook/nextjs",
    options: {},
  },
  docs: {
    autodocs: "tag",
  },
  staticDirs: ["../public"],
  webpackFinal: async (config) => {
    // This modifies the existing image rule to exclude `.svg` files
    // since we want to handle them with `@svgr/webpack`.
    const imageRule = config.module?.rules?.find((rule) => {
      if (typeof rule !== "object" || rule === null) {
        return false;
      }

      if (rule.test instanceof RegExp) {
        return rule.test.test(".svg");
      }
      return false;
    });

    if (imageRule && typeof imageRule === "object") {
      imageRule.exclude = /\.svg$/;
    }

    config.module?.rules?.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    return config;
  },
};

export default config; 