'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { BookOpen, Target, Zap, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import UsageChart from '@/components/UsageChart';
import Link from 'next/link';

export default function Dashboard() {
  const { user } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  const [stats, setStats] = useState({
    words_learned: 0,
    grammar_practiced: 0,
    daily_streak: 0,
    last_activity: 'Just now'
  });
  const [usageData, setUsageData] = useState([]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    const fetchStats = async () => {
      try {
        const [statsRes, usageRes] = await Promise.all([
          api.get('/stats'),
          api.get('/usage')
        ]);
        setStats(statsRes.data);
        setUsageData(usageRes.data);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      }
    };
    fetchStats();
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: isMobile ? '2rem' : '0' }}>
      <header style={{ marginBottom: isMobile ? '2rem' : '3rem' }}>
        <h1 className="gradient-text" style={{ fontSize: isMobile ? '2rem' : '2.5rem', lineHeight: 1.2 }}>
          Welcome back, {user?.username || 'Learner'}!
        </h1>
        <p style={{ color: 'var(--text-dim)', marginTop: '0.5rem', fontSize: isMobile ? '0.9rem' : '1rem' }}>
          Your journey to {user?.target_language || 'Korean'} mastery is looking bright today.
        </p>
      </header>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <StatCard 
          icon={<BookOpen size={isMobile ? 20 : 24} />} 
          title="Vocabulary" 
          value={stats.words_learned} 
          subtitle="Words practiced" 
          color="#FF3B3F"
          isMobile={isMobile}
        />
        <StatCard 
          icon={<Target size={isMobile ? 20 : 24} />} 
          title="Grammar" 
          value={stats.grammar_practiced} 
          subtitle="Patterns mastered" 
          color="#6B5B95"
          isMobile={isMobile}
        />
        <StatCard 
          icon={<Zap size={isMobile ? 20 : 24} />} 
          title="Daily Streak" 
          value={stats.daily_streak} 
          subtitle="Days in a row" 
          color="#FEB236"
          isMobile={isMobile}
        />
      </div>

      <div style={{ marginBottom: isMobile ? '2rem' : '3rem', overflowX: 'auto' }}>
        <UsageChart data={usageData} />
      </div>

      <section className="glass" style={{ padding: isMobile ? '1.2rem' : '1.5rem' }}>
        <h2 style={{ fontSize: isMobile ? '1.3rem' : '1.5rem' }}>Continue Learning</h2>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: '1.2rem',
          backgroundColor: 'rgba(255,255,255,0.02)',
          borderRadius: '16px',
          padding: isMobile ? '1.2rem' : '1.5rem'
        }}>
          <div>
            <h3 style={{ fontSize: isMobile ? '1rem' : '1.1rem', marginBottom: '0.2rem' }}>Ready for a Chat?</h3>
            <p style={{ color: 'var(--text-dim)', fontSize: isMobile ? '0.85rem' : '0.9rem' }}>
              Practice what you've learned in a natural conversation.
            </p>
          </div>
          <Link href="/chat" style={{ width: isMobile ? '100%' : 'auto' }}>
            <button 
              className="glass-hover"
              style={{ 
                background: 'var(--primary)', 
                color: 'white', 
                border: 'none', 
                padding: '0.8rem 2rem', 
                borderRadius: '30px', 
                fontWeight: 600,
                cursor: 'pointer',
                width: '100%',
                boxShadow: '0 4px 15px rgba(255, 59, 63, 0.2)'
              }}
            >
              Start Chat
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon, title, value, subtitle, color, isMobile }: any) {
  return (
    <motion.div 
      whileHover={isMobile ? {} : { y: -5 }}
      className="glass" 
      style={{ 
        padding: isMobile ? '1.2rem' : '1.5rem', 
        position: 'relative', 
        overflow: 'hidden',
        display: 'flex',
        flexDirection: isMobile ? 'row' : 'column',
        alignItems: isMobile ? 'center' : 'flex-start',
        gap: isMobile ? '1rem' : '0'
      }}
    >
      <div style={{ color, marginBottom: isMobile ? '0' : '1rem', flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: isMobile ? '1.8rem' : '2.5rem', fontWeight: 800, marginBottom: '0.1rem', lineHeight: 1 }}>{value}</div>
        <div style={{ fontWeight: 600, color: 'var(--foreground)', fontSize: isMobile ? '0.9rem' : '1rem' }}>{title}</div>
        <div style={{ fontSize: isMobile ? '0.75rem' : '0.85rem', color: 'var(--text-dim)' }}>{subtitle}</div>
      </div>
      
      {/* Subtle deco flare */}
      <div style={{ 
        position: 'absolute', 
        top: '-20px', 
        right: '-20px', 
        width: isMobile ? '60px' : '100px', 
        height: isMobile ? '60px' : '100px', 
        background: color, 
        opacity: 0.08, 
        borderRadius: '50%' 
      }} />
    </motion.div>
  );
}
