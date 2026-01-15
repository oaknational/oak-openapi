import getCMSContent from '@/cms/queries/allCurriculumApiLandingPage/landingPage.query';
import LandingPage from '@/components/landingPage/LandingPage';

export default async function Page(): Promise<React.ReactElement> {
  const documentationData = await getCMSContent();
  return <LandingPage documentationData={documentationData} />;
}
