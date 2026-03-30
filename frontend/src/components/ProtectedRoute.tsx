'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !token && !pathname.startsWith('/login')) {
      router.push('/login');
    }
  }, [token, isLoading, router, pathname]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--text-dim)' }}>
        Loading Linguis...
      </div>
    );
  }

  if (!token && !pathname.startsWith('/login')) {
    return null;
  }

  return <>{children}</>;
}
