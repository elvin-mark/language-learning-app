'use client';

import { useState } from 'react';
import RoleplaySelection from '@/components/RoleplaySelection';
import { ChevronLeft, Sparkles, Send, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function MissionsPage() {
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();

  const handleGenerate = async () => {
    if (!topic.trim() || isGenerating) return;
    setIsGenerating(true);
    try {
      const res = await api.post('/scenarios/generate', { topic });
      sessionStorage.setItem('custom_scenario', JSON.stringify(res.data));
      router.push('/chat/roleplay/custom');
    } catch (err) {
      console.error('Generation error:', err);
      // Fallback or error ui could go here
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '5rem' }}>
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

      {/* Custom Mission Creator */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass"
        style={{ 
          padding: '2rem', 
          marginBottom: '3rem', 
          background: 'linear-gradient(135deg, rgba(255, 59, 63, 0.08) 0%, rgba(254, 178, 54, 0.05) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '1.5rem'
        }}
      >
        <div style={{ 
          width: '60px', 
          height: '60px', 
          borderRadius: '50%', 
          background: 'var(--primary)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          boxShadow: '0 8px 20px rgba(255, 59, 63, 0.3)'
        }}>
          <Sparkles size={30} color="white" />
        </div>
        
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.5rem' }}>Create Your Own Mission</h2>
          <p style={{ color: 'var(--subtitle)', maxWidth: '500px' }}>
            Type any situation or location, and our AI will generate a custom roleplay mission for you.
          </p>
        </div>

        <div style={{ width: '100%', maxWidth: '600px', display: 'flex', gap: '0.8rem' }}>
          <input 
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
            disabled={isGenerating}
            placeholder="e.g., Ordering a surfboard in Jeju, Checking into a space hotel..."
            style={{ 
              flex: 1, 
              background: 'rgba(255,255,255,0.05)', 
              border: '1px solid rgba(255,255,255,0.1)', 
              borderRadius: '16px', 
              padding: '1rem 1.5rem', 
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
              borderRadius: '16px', 
              padding: '0 2rem', 
              color: 'white', 
              fontWeight: 700,
              cursor: (isGenerating || !topic.trim()) ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              opacity: (isGenerating || !topic.trim()) ? 0.7 : 1,
              transition: 'all 0.2s ease'
            }}
          >
            {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <><Send size={18} /> Generate</>}
          </button>
        </div>
      </motion.div>

      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-dim)' }}>Pre-made Missions</h3>
      </div>
      
      <RoleplaySelection />
    </div>
  );
}
