'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, ChevronRight, MessageCircle } from 'lucide-react';
import api from '@/lib/api';

interface Variation {
  label: string;
  text: string;
  explanation: string;
}

interface WritingAssistantProps {
  draftText: string;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (text: string) => void;
  scenarioId?: string;
}

export default function WritingAssistant({ draftText, isOpen, onClose, onSelect, scenarioId }: WritingAssistantProps) {
  const [variations, setVariations] = useState<Variation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVariations = async () => {
    if (!draftText.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.post('/chat/assistant', {
        draft_text: draftText,
        scenario_id: scenarioId
      });
      setVariations(res.data.variations);
    } catch (err) {
      console.error('Failed to get writing assistance:', err);
      setError('Failed to get suggestions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && draftText) {
      fetchVariations();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      style={{
        position: 'absolute',
        bottom: '100%',
        left: '0',
        right: '0',
        marginBottom: '1rem',
        zIndex: 50,
      }}
    >
      <div className="glass" style={{ 
        padding: '1.2rem', 
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        background: 'rgba(20, 20, 25, 0.95)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <Sparkles size={16} /> Writing Assistant
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        {isLoading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} style={{ display: 'inline-block', marginBottom: '0.5rem' }}>
              <Sparkles size={24} color="var(--primary)" />
            </motion.div>
            <div style={{ fontSize: '0.85rem' }}>Polishing your message...</div>
          </div>
        ) : error ? (
          <div style={{ padding: '1rem', textAlign: 'center', color: '#ef4444', fontSize: '0.85rem' }}>{error}</div>
        ) : variations.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {variations.map((v, i) => (
              <button
                key={i}
                onClick={() => {
                  onSelect(v.text);
                  onClose();
                }}
                className="glass-hover"
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '1rem',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
                    <span style={{ 
                      fontSize: '0.7rem', 
                      fontWeight: 800, 
                      padding: '2px 8px', 
                      borderRadius: '10px',
                      background: v.label === 'Formal' ? 'var(--secondary)' : v.label === 'Casual' ? 'var(--accent)' : 'var(--primary)',
                      color: 'white'
                    }}>
                      {v.label}
                    </span>
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                      {v.explanation}
                    </span>
                  </div>
                  <div style={{ color: 'white', fontWeight: 600 }}>{v.text}</div>
                </div>
                <ChevronRight size={18} color="rgba(255,255,255,0.2)" />
              </button>
            ))}
          </div>
        ) : (
          <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
            Draft a message first, then click the magic wand for help!
          </div>
        )}
      </div>
    </motion.div>
  );
}
