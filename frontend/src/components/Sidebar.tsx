'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, MessageSquare, BookOpen, Settings, LogOut, User as UserIcon } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '@/context/AuthContext';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { label: 'Chat', icon: MessageSquare, href: '/chat' },
  { label: 'Library', icon: BookOpen, href: '/library' },
  { label: 'Settings', icon: Settings, href: '/settings' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  
  // Don't show sidebar on login page
  if (pathname.startsWith('/login')) return null;

  return (
    <aside className="sidebar glass">
      <div className="logo" style={{ marginBottom: '2rem' }}>
        <h1 className="gradient-text" style={{ fontSize: '1.8rem' }}>Linguis</h1>
      </div>
      
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={clsx('glass-hover', 'nav-link')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '0.8rem 1.2rem',
                borderRadius: '12px',
                color: isActive ? 'var(--primary)' : 'var(--foreground)',
                background: isActive ? 'var(--glass-hover)' : 'transparent',
                transition: 'all 0.2s ease'
              }}
            >
              <Icon size={20} />
              <span style={{ fontWeight: 500 }}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer" style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.8rem 1.2rem', color: 'var(--text-dim)' }}>
           <UserIcon size={20} />
           <span style={{ fontWeight: 600, color: 'var(--foreground)' }}>{user?.username || 'Guest'}</span>
        </div>

        <button 
          onClick={logout}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem', 
            background: 'none', 
            border: 'none', 
            color: '#ef4444', 
            cursor: 'pointer',
            padding: '0.8rem 1.2rem',
            width: '100%',
            fontWeight: 600
          }}
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
