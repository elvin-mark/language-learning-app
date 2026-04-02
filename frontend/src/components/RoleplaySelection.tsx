'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Star, ChevronRight, Info, Target, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';

interface Scenario {
  id: string;
  name: string;
  description: string;
  role: string;
  goal: string;
  objectives: string[];
  initial_message: string;
  difficulty: string;
}

export default function RoleplaySelection() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const fetchScenarios = async () => {
      try {
        const res = await api.get('/scenarios');
        setScenarios(res.data);
      } catch (err) {
        console.error('Failed to fetch scenarios:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchScenarios();
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div style={{ padding: isMobile ? '0.5rem' : '1rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))', gap: isMobile ? '1rem' : '1.5rem' }}>
        {scenarios.map((scenario) => (
          <motion.div
            key={scenario.id}
            whileHover={isMobile ? {} : { y: -5 }}
            className="glass"
            style={{ 
              padding: isMobile ? '1.2rem' : '1.5rem', 
              display: 'flex', 
              flexDirection: 'column', 
              height: '100%',
              border: '1px solid var(--border)',
              backgroundColor: 'rgba(255,255,255,0.02)',
              borderRadius: '20px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
              <div style={{ 
                padding: '0.3rem 0.6rem', 
                borderRadius: '6px', 
                background: 'rgba(255, 59, 63, 0.1)', 
                color: 'var(--primary)',
                fontSize: '0.7rem',
                fontWeight: 700,
                textTransform: 'uppercase'
              }}>
                {scenario.difficulty}
              </div>
              <div style={{ display: 'flex', gap: '2px' }}>
                {[...Array(3)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={12} 
                    fill={i < (scenario.difficulty === 'Beginner' ? 1 : scenario.difficulty === 'Intermediate' ? 2 : 3) ? 'var(--accent)' : 'transparent'} 
                    color="var(--accent)" 
                  />
                ))}
              </div>
            </div>

            <h3 style={{ fontSize: isMobile ? '1.2rem' : '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>{scenario.name}</h3>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '1.2rem', flex: 1 }}>
              {scenario.description}
            </p>

            <div style={{ marginBottom: '1.2rem', background: 'rgba(255,255,255,0.03)', padding: '0.8rem', borderRadius: '12px' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem', fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>
                  <Target size={12} /> MAIN GOAL
               </div>
               <p style={{ fontSize: '0.8rem', fontWeight: 500, lineHeight: 1.4 }}>{scenario.goal}</p>
            </div>

            <Link href={`/chat/roleplay/${scenario.id}`} style={{ width: '100%' }}>
              <button 
                className="glass-hover"
                style={{ 
                  width: '100%', 
                  padding: '0.9rem', 
                  borderRadius: '12px', 
                  border: 'none', 
                  background: 'var(--primary)', 
                  color: 'white', 
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontSize: '0.95rem'
                }}
              >
                <Play size={16} fill="white" /> Start Mission
              </button>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
