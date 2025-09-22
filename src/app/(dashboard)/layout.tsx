'use client';

import PrivateRoute from '@/components/PrivateRoute';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <PrivateRoute>{children}</PrivateRoute>;
}
