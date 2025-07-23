import getCMSContent from '@/cms/queries/allCurriculumApiLandingPage/landingPage.query';
import LandingPage from '@/components/landingPage/LandingPage';

export default async function Page() {
  const documentationData = await getCMSContent();
  return <LandingPage documentationData={documentationData} />;
}
