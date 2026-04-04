"use client";

import { useAuth } from '@/context/AuthContext';
import Dashboard from '@/components/Dashboard';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="dashboard-container">
      <Dashboard user={user} />
    </div>
  );
}
