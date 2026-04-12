'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { LayoutDashboard, MessageSquare, BookOpen, Settings, LogOut, User as UserIcon, Brain, Library, Sparkles, Edit3 } from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { label: 'Chat', icon: MessageSquare, href: '/chat' },
  { label: 'Reading', icon: BookOpen, href: '/reading' },
  { label: 'Journal', icon: Edit3, href: '/journal' },
  { label: 'Practice', icon: Brain, href: '/practice' },
  { label: 'Library', icon: Library, href: '/library' },
  { label: 'Settings', icon: Settings, href: '/settings' },
];


export default function Sidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Don't show navigation on login page
  if (pathname.startsWith('/login')) return null;

  if (isMobile) {
    return (
      <nav
        className="glass"
        style={{
          position: 'fixed',
          bottom: '1rem',
          left: '1rem',
          right: '1rem',
          height: '64px',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          zIndex: 1000,
          borderRadius: '20px',
          border: '1px solid var(--border)',
          padding: '0 0.5rem',
          backgroundColor: 'rgba(15, 15, 18, 0.8)',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(20px)'
        }}
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isActive ? 'var(--primary)' : 'var(--text-dim)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                flex: 1,
                height: '100%',
                position: 'relative'
              }}
            >
              <motion.div 
                animate={{ 
                  scale: isActive ? 1.2 : 1,
                  backgroundColor: isActive ? 'rgba(255, 59, 63, 0.15)' : 'transparent'
                }}
                style={{
                  padding: '10px',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              </motion.div>
              
              {isActive && (
                <motion.div
                  layoutId="nav-active-mobile"
                  style={{
                    position: 'absolute',
                    bottom: '8px',
                    width: '4px',
                    height: '4px',
                    background: 'var(--primary)',
                    borderRadius: '50%',
                    boxShadow: '0 0 8px var(--primary-glow)'
                  }}
                />
              )}
            </Link>
          );
        })}
      </nav>
    );
  }


  return (
    <aside className="sidebar glass">
      <div className="logo" style={{ marginBottom: '2rem' }}>
        <h1 className="gradient-text" style={{ fontSize: '1.8rem' }}>Linguis</h1>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.35rem 0.7rem',
          borderRadius: '12px',
          background: 'rgba(255, 59, 63, 0.08)',
          border: '1px solid rgba(255, 59, 63, 0.15)',
          marginTop: '0.6rem',
          fontSize: '0.75rem',
          fontWeight: 800,
          color: 'var(--primary)',
          letterSpacing: '0.02em',
          textTransform: 'uppercase'
        }}>
          <Sparkles size={12} /> {user?.target_language || 'Korean'}
        </div>
      </div>

      <nav
        className="hide-scrollbar"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.7rem',
          flex: 1,
          overflowY: 'auto'
        }}
      >
        <div style={{ padding: '0.6rem 1.2rem', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.05em', opacity: 0.8 }}>
          Menu
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx('glass-hover', 'nav-link')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.8rem',
                padding: '0.6rem 1.2rem',
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
