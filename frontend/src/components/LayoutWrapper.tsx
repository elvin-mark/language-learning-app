'use client';

import { usePathname } from 'next/navigation';
import Sidebar from "@/components/Sidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { LayoutDashboard, MessageSquare, BookOpen, Settings, LogOut, User as UserIcon, Brain, PlusCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
      
      {/* Global Language Indicator - Mobile only to avoid redundancy */}
      <AnimatePresence>
        {isMobile && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'fixed',
              top: '1.2rem',
              right: '1.5rem',
              zIndex: 50,
              pointerEvents: 'none'
            }}
          >
            <div className="glass" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 0.8rem',
              borderRadius: '12px',
              background: 'rgba(15, 15, 18, 0.4)',
              border: '1px solid var(--border)',
              fontSize: '0.75rem',
              fontWeight: 800,
              color: 'var(--primary)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
            }}>
              <Sparkles size={12} /> {user?.target_language || 'Korean'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="main-content">
        <ProtectedRoute>
          {children}
        </ProtectedRoute>
      </main>
    </div>
  );
}
