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
  const [stats, setStats] = useState({
    words_learned: 0,
    grammar_practiced: 0,
    last_activity: 'Just now'
  });
  const [usageData, setUsageData] = useState([]);

  useEffect(() => {
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
  }, []);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ marginBottom: '3rem' }}>
        <h1 className="gradient-text">Welcome back, {user?.username || 'Learner'}!</h1>
        <p style={{ color: 'var(--text-dim)', marginTop: '0.5rem' }}>
          Your journey to {user?.target_language || 'Korean'} mastery is looking bright today.
        </p>
      </header>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <StatCard 
          icon={<BookOpen size={24} />} 
          title="Vocabulary" 
          value={stats.words_learned} 
          subtitle="Words practiced" 
          color="#FF3B3F"
        />
        <StatCard 
          icon={<Target size={24} />} 
          title="Grammar" 
          value={stats.grammar_practiced} 
          subtitle="Patterns mastered" 
          color="#6B5B95"
        />
        <StatCard 
          icon={<Zap size={24} />} 
          title="Daily Streak" 
          value="5" 
          subtitle="Days in a row" 
          color="#FEB236"
        />
      </div>

      <div style={{ marginBottom: '3rem' }}>
        <UsageChart data={usageData} />
      </div>

      <section className="glass" style={{ padding: '2rem' }}>
        <h2>Continue Learning</h2>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          backgroundColor: 'rgba(255,255,255,0.02)',
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>Ready for a Chat?</h3>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>
              Practice what you've learned in a natural conversation.
            </p>
          </div>
          <Link href="/chat">
            <button 
              className="glass-hover"
              style={{ 
                background: 'var(--primary)', 
                color: 'white', 
                border: 'none', 
                padding: '0.8rem 2rem', 
                borderRadius: '30px', 
                fontWeight: 600,
                cursor: 'pointer'
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

function StatCard({ icon, title, value, subtitle, color }: any) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="glass" 
      style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}
    >
      <div style={{ color, marginBottom: '1rem' }}>{icon}</div>
      <div style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.2rem' }}>{value}</div>
      <div style={{ fontWeight: 600, color: 'var(--foreground)' }}>{title}</div>
      <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>{subtitle}</div>
      
      {/* Subtle deco flare */}
      <div style={{ 
        position: 'absolute', 
        top: '-20px', 
        right: '-20px', 
        width: '100px', 
        height: '100px', 
        background: color, 
        opacity: 0.05, 
        borderRadius: '50%' 
      }} />
    </motion.div>
  );
}
