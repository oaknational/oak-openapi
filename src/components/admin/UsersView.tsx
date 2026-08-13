'use client';

import { Suspense } from 'react';
import { AdminShell } from './AdminShell';
import { UsersList } from './UsersList';

export default function UsersView(): React.ReactElement {
  return (
    <AdminShell>
      {/* useSearchParams needs a Suspense boundary above it. */}
      <Suspense>
        <UsersList />
      </Suspense>
    </AdminShell>
  );
}
