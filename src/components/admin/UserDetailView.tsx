'use client';

import { Suspense } from 'react';
import { AdminShell } from './AdminShell';
import { UserDetail } from './UserDetail';

export default function UserDetailView({
  id,
}: {
  id: number;
}): React.ReactElement {
  return (
    <AdminShell>
      {/* useSearchParams needs a Suspense boundary above it. */}
      <Suspense>
        <UserDetail id={id} />
      </Suspense>
    </AdminShell>
  );
}
