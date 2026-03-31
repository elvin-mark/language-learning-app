'use client';

import RoleplaySelection from '@/components/RoleplaySelection';
import { ChevronLeft, Target } from 'lucide-react';
import Link from 'next/link';

export default function MissionsPage() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '3rem' }}>
      <header style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link href="/chat">
          <button className="glass-hover" style={{ background: 'rgba(255,255,255,0.05)', border: 'none', padding: '0.6rem', borderRadius: '12px', color: 'white', cursor: 'pointer' }}>
             <ChevronLeft size={20} />
          </button>
        </Link>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Roleplay Missions</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '1rem' }}>Guided scenarios with specific objectives</p>
        </div>
      </header>

      <RoleplaySelection />
    </div>
  );
}
