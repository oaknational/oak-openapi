import { notFound } from 'next/navigation';
import UserDetailView from '@/components/admin/UserDetailView';

export default async function UserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactElement> {
  const id = Number((await params).id);

  if (!Number.isInteger(id) || id < 1) {
    notFound();
  }

  return <UserDetailView id={id} />;
}
