'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/signin');
      }
    }
  }, [isMounted, router]);

  if (!isMounted) {
    return null; // or a loading spinner
  }

  return <>{children}</>;
}
