'use client';

import PublicRoute from '@/components/PublicRoute';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <PublicRoute>{children}</PublicRoute>;
}
