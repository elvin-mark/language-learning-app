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

  useEffect(() => {
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
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>Roleplay Missions</h2>
        <p style={{ color: 'var(--text-dim)' }}>Put your skills to the test in realistic scenarios.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {scenarios.map((scenario) => (
          <motion.div
            key={scenario.id}
            whileHover={{ y: -5 }}
            className="glass"
            style={{ 
              padding: '1.5rem', 
              display: 'flex', 
              flexDirection: 'column', 
              height: '100%',
              border: '1px solid var(--border)',
              backgroundColor: 'rgba(255,255,255,0.02)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ 
                padding: '0.4rem 0.8rem', 
                borderRadius: '8px', 
                background: 'rgba(255, 59, 63, 0.1)', 
                color: 'var(--primary)',
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase'
              }}>
                {scenario.difficulty}
              </div>
              <div style={{ display: 'flex', gap: '2px' }}>
                {[...Array(3)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={14} 
                    fill={i < (scenario.difficulty === 'Beginner' ? 1 : scenario.difficulty === 'Intermediate' ? 2 : 3) ? 'var(--accent)' : 'transparent'} 
                    color="var(--accent)" 
                  />
                ))}
              </div>
            </div>

            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>{scenario.name}</h3>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.5rem', flex: 1 }}>
              {scenario.description}
            </p>

            <div style={{ marginBottom: '1.5rem', background: 'rgba(255,255,255,0.03)', padding: '0.8rem', borderRadius: '12px' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600 }}>
                  <Target size={14} /> MAIN GOAL
               </div>
               <p style={{ fontSize: '0.85rem', fontWeight: 500 }}>{scenario.goal}</p>
            </div>

            <Link href={`/chat/roleplay/${scenario.id}`} style={{ width: '100%' }}>
              <button 
                className="glass-hover"
                style={{ 
                  width: '100%', 
                  padding: '1rem', 
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
                  transition: 'all 0.2s ease'
                }}
              >
                <Play size={18} fill="white" /> Start Mission
              </button>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
