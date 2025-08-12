import BulkDownloadPage from '@/components/bulkDownload/BulkDownloadPage';
import { getAllSubjects } from '@/lib/bulk-data/get-data';
import { getClient } from '@/lib/owaClient';

export type Subjects = {
  title: string;
  slug: string;
  primary: number;
  secondary: number;
}[];

export default async function Page() {
  const subjects = await getAllSubjects(getClient());

  console.log('Subjects fetched:', subjects);

  // reduce and restructure the subjects to match the expected format:
  const reducedSubjects: Subjects = subjects.reduce((acc, subject) => {
    const { sequenceSlug, subjectTitle: title } = subject;

    const parts = sequenceSlug.split('-');
    const phase = parts.pop();
    const slug = parts.join('-');

    const existing = acc.find((s) => s.slug === slug);
    if (existing) {
      if (phase === 'primary') {
        existing.primary = 1;
      }
      if (phase === 'secondary') {
        existing.secondary = 1;
      }

      return acc; // already exists
    }
    return [
      ...acc,
      {
        title,
        slug,
        primary: phase === 'primary' ? 1 : 0,
        secondary: phase === 'secondary' ? 1 : 0,
      },
    ];
  }, [] as Subjects);

  console.log(reducedSubjects.map(_ => _.slug));

  return <BulkDownloadPage subjects={reducedSubjects} />;
}
