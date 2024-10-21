import type { AppProps } from "next/app";
import {
  OakThemeProvider,
  oakDefaultTheme,
  OakGlobalStyle,
} from "@oaknational/oak-components";
import { PostHogProvider } from "~/context/AnalyticsProvider";

export default function OakOpenAPIApp({ Component }: AppProps) {
  return (
    <>
      <OakGlobalStyle />
      <PostHogProvider>
        <OakThemeProvider theme={oakDefaultTheme}>
          <Component />
        </OakThemeProvider>
      </PostHogProvider>
    </>
  );
}
