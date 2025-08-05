import BulkDownloadPage from '@/components/bulkDownload/BulkDownloadPage';
import { getAllSubjects } from '@/lib/bulk-data/get-data';
import { getClient } from '@/lib/owaClient';

export type Subjects = {
  title: string;
  slug: string;
  primary: boolean;
  secondary: boolean;
}[];

export default async function Page() {
  /* subjects are an array like this:
  {
    "sequenceSlug": "art-primary",
    "subjectTitle": "Art and design"
}
  */

  type RawSubjects = {
    sequenceSlug: string;
    subjectTitle: string;
  }[];

  const subjects: RawSubjects = await getAllSubjects(getClient());

  // reduce and restructure the subjects to match the expected format:

  const reducedSubjects: Subjects = subjects.reduce((acc, subject) => {
    const { sequenceSlug, subjectTitle } = subject;
    const [slug, phase] = sequenceSlug.split('-');

    const existing = acc.find((s) => s.slug === slug);
    if (existing) {
      if (phase.includes('primary')) {
        existing.primary = true;
      }
      if (phase.includes('secondary')) {
        existing.secondary = true;
      }

      return acc; // already exists
    }
    return [
      ...acc,
      {
        title: subjectTitle,
        slug,
        primary: phase.includes('primary'),
        secondary: phase.includes('secondary'),
      },
    ];
  }, [] as Subjects);

  return <BulkDownloadPage subjects={reducedSubjects} />;
}
