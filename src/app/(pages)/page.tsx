import getCMSContent from '@/cms/queries/allCurriculumApiLandingPage/landingPage.query';
import LandingPage from '@/components/landingPage/LandingPage';
import { headers } from 'next/headers';

const MARKDOWN_RENDER_MODE_HEADER = 'x-markdown-render-mode';
const MARKDOWN_RENDER_MODE_BODY_ONLY = 'body-only';

export default async function Page(): Promise<React.ReactElement> {
  const requestHeaders = await headers();
  const markdownRenderMode = requestHeaders.get(MARKDOWN_RENDER_MODE_HEADER);
  const showChrome = markdownRenderMode !== MARKDOWN_RENDER_MODE_BODY_ONLY;
  const documentationData = await getCMSContent();
  return (
    <LandingPage
      documentationData={documentationData}
      showChrome={showChrome}
    />
  );
}
