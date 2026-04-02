'use client';

import { useState, useEffect } from 'react';
import RoleplaySelection from '@/components/RoleplaySelection';
import { ChevronLeft, Sparkles, Send, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function MissionsPage() {
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleGenerate = async () => {
    if (!topic.trim() || isGenerating) return;
    setIsGenerating(true);
    try {
      const res = await api.post('/scenarios/generate', { topic });
      sessionStorage.setItem('custom_scenario', JSON.stringify(res.data));
      router.push('/chat/roleplay/custom');
    } catch (err) {
      console.error('Generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '5rem', paddingLeft: isMobile ? '0' : '1rem', paddingRight: isMobile ? '0' : '1rem' }}>
      <header style={{ marginBottom: isMobile ? '1.5rem' : '2.5rem', display: 'flex', alignItems: 'center', gap: isMobile ? '0.8rem' : '1rem' }}>
        <Link href="/chat">
          <button className="glass-hover" style={{ background: 'rgba(255,255,255,0.05)', border: 'none', padding: isMobile ? '0.5rem' : '0.6rem', borderRadius: '12px', color: 'white', cursor: 'pointer' }}>
             <ChevronLeft size={isMobile ? 18 : 20} />
          </button>
        </Link>
        <div>
          <h1 style={{ fontSize: isMobile ? '1.5rem' : '1.8rem', fontWeight: 800 }}>Roleplay Missions</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: isMobile ? '0.85rem' : '1rem' }}>Guided scenarios with specific objectives</p>
        </div>
      </header>

      {/* Custom Mission Creator */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass"
        style={{ 
          padding: isMobile ? '1.5rem' : '2.5rem', 
          marginBottom: isMobile ? '2rem' : '3.5rem', 
          background: 'linear-gradient(135deg, rgba(255, 59, 63, 0.08) 0%, rgba(254, 178, 54, 0.05) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: isMobile ? '24px' : '32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: isMobile ? '1.2rem' : '1.8rem'
        }}
      >
        <div style={{ 
          width: isMobile ? '50px' : '60px', 
          height: isMobile ? '50px' : '60px', 
          borderRadius: '50%', 
          background: 'var(--primary)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          boxShadow: '0 8px 20px rgba(255, 59, 63, 0.3)'
        }}>
          <Sparkles size={isMobile ? 24 : 30} color="white" />
        </div>
        
        <div style={{ padding: isMobile ? '0 0.5rem' : '0' }}>
          <h2 style={{ fontSize: isMobile ? '1.4rem' : '1.8rem', fontWeight: 800, marginBottom: '0.4rem', lineHeight: 1.1 }}>Create Your Own</h2>
          <p style={{ color: 'var(--subtitle)', maxWidth: '500px', fontSize: isMobile ? '0.9rem' : '1rem' }}>
            Type any situation, and AI will generate it for you.
          </p>
        </div>

        <div style={{ width: '100%', maxWidth: '600px', display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '0.8rem' }}>
          <input 
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
            disabled={isGenerating}
            placeholder={isMobile ? "e.g., At a cafe..." : "e.g., Ordering a surfboard in Jeju..."}
            style={{ 
              flex: 1, 
              background: 'rgba(255,255,255,0.05)', 
              border: '1px solid rgba(255,255,255,0.1)', 
              borderRadius: '14px', 
              padding: isMobile ? '0.9rem 1.2rem' : '1rem 1.5rem', 
              color: 'white',
              fontSize: '1rem',
              outline: 'none'
            }}
          />
          <button 
            onClick={handleGenerate}
            disabled={isGenerating || !topic.trim()}
            style={{ 
              background: 'var(--primary)', 
              border: 'none', 
              borderRadius: '14px', 
              padding: isMobile ? '0.9rem' : '0 2rem', 
              color: 'white', 
              fontWeight: 700,
              cursor: (isGenerating || !topic.trim()) ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              opacity: (isGenerating || !topic.trim()) ? 0.7 : 1,
              transition: 'all 0.2s ease'
            }}
          >
            {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <><Send size={18} /> Generate</>}
          </button>
        </div>
      </motion.div>

      <div style={{ marginBottom: '1.2rem', padding: isMobile ? '0 0.5rem' : '0' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.05em' }}>PRE-MADE MISSIONS</h3>
      </div>
      
      <RoleplaySelection />
    </div>
  );
}
