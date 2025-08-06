import BulkDownloadPage from '@/components/bulkDownload/BulkDownloadPage';
import { getSubjectsWithLessonCounts } from '@/lib/bulk-data/get-data';

export type Subjects = {
  title: string;
  slug: string;
  primary: number;
  secondary: number;
}[];

export default async function Page() {
  const subjects = await getSubjectsWithLessonCounts();

  // reduce and restructure the subjects to match the expected format:
  const reducedSubjects: Subjects = subjects.reduce((acc, subject) => {
    const { slug, title, phase, lessonCount } = subject;

    const existing = acc.find((s) => s.slug === slug);
    if (existing) {
      if (phase === 'primary') {
        existing.primary = lessonCount;
      }
      if (phase === 'secondary') {
        existing.secondary = lessonCount;
      }

      return acc; // already exists
    }
    return [
      ...acc,
      {
        title,
        slug,
        primary: phase === 'primary' ? lessonCount : 0,
        secondary: phase === 'secondary' ? lessonCount : 0,
      },
    ];
  }, [] as Subjects);

  return <BulkDownloadPage subjects={reducedSubjects} />;
}
