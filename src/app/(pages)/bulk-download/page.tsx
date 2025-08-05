import BulkDownloadPage from '@/components/bulkDownload/BulkDownloadPage';
import { getSubjectsWithLessonCounts } from '@/lib/bulk-data/get-data';
import { getClient } from '@/lib/owaClient';

export type Subjects = {
  title: string;
  slug: string;
  primary: number;
  secondary: number;
}[];

export default async function Page() {
  /* subjects are an array like this:
  {
    "sequenceSlug": "art-primary",
    "subjectTitle": "Art and design"
}
  */

  const subjects = await getSubjectsWithLessonCounts(getClient());

  // reduce and restructure the subjects to match the expected format:

  const reducedSubjects: Subjects = subjects.reduce((acc, subject) => {
    const { slug, title, phase, lessonCount } = subject;

    const existing = acc.find((s) => s.slug === slug);
    if (existing) {
      if (phase.includes('primary')) {
        existing.primary = lessonCount;
      }
      if (phase.includes('secondary')) {
        existing.secondary = lessonCount;
      }

      return acc; // already exists
    }
    return [
      ...acc,
      {
        title,
        slug,
        primary: phase.includes('primary') ? lessonCount : 0,
        secondary: phase.includes('secondary') ? lessonCount : 0,
      },
    ];
  }, [] as Subjects);

  return <BulkDownloadPage subjects={reducedSubjects} />;
}
