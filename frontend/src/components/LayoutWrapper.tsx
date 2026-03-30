'use client';

import { usePathname } from 'next/navigation';
import Sidebar from "@/components/Sidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  
  // Don't show sidebar on login page
  if (pathname.startsWith('/login')) {
    return (
      <div className="gradient-bg" style={{ minHeight: '100vh' }}>
        <ProtectedRoute>
          {children}
        </ProtectedRoute>
      </div>
    );
  }

  return (
    <div className="container gradient-bg">
      <Sidebar />
      <main className="main-content">
        <ProtectedRoute>
          {children}
        </ProtectedRoute>
      </main>
    </div>
  );
}
