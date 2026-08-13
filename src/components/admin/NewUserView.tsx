'use client';

import { AdminShell } from './AdminShell';
import { CreateUserForm } from './CreateUserForm';

export default function NewUserView(): React.ReactElement {
  return (
    <AdminShell>
      <CreateUserForm />
    </AdminShell>
  );
}
