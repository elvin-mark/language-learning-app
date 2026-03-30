'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Hash, Book } from 'lucide-react';

interface ExplanationOverlayProps {
  data: {
    grammar: { pattern: string; explanation: string }[];
    vocabulary: { text: string; meaning: string; pronunciation?: string }[];
  } | null;
  onClose: () => void;
  isLoading: boolean;
}

export default function ExplanationOverlay({ data, onClose, isLoading }: ExplanationOverlayProps) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      background: 'rgba(0,0,0,0.4)',
      backdropFilter: 'blur(4px)'
    }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="glass" 
        style={{ 
          width: '100%', 
          maxWidth: '500px', 
          maxHeight: '80vh', 
          overflowY: 'auto',
          padding: '2rem',
          position: 'relative',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
      >
        <button 
          onClick={onClose}
          style={{ 
            position: 'absolute', 
            top: '1rem', 
            right: '1rem', 
            background: 'none', 
            border: 'none', 
            color: 'var(--text-dim)', 
            cursor: 'pointer' 
          }}
        >
          <X size={24} />
        </button>

        {isLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-dim)' }}>
            Analyzing snippet...
          </div>
        ) : data ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <header>
              <h2 className="gradient-text" style={{ marginBottom: '0.5rem' }}>Linguistic Breakdown</h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>Targeted explanation for your selected text.</p>
            </header>

            {data.grammar.length > 0 && (
              <section>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '1.1rem' }}>
                  <Hash size={18} color="var(--accent)" /> Grammar Points
                </h3>
                {data.grammar.map((g, i) => (
                  <div key={i} style={{ marginBottom: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', borderLeft: '3px solid var(--accent)' }}>
                    <div style={{ fontWeight: 700, marginBottom: '0.3rem' }}>{g.pattern}</div>
                    <p style={{ fontSize: '0.85rem', lineHeight: '1.5', color: '#CBD5E1' }}>{g.explanation}</p>
                  </div>
                ))}
              </section>
            )}

            {data.vocabulary.length > 0 && (
              <section>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '1.1rem' }}>
                  <Book size={18} color="#6B5B95" /> Key Vocabulary
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                  {data.vocabulary.map((v, i) => (
                    <div key={i} style={{ padding: '0.8rem', background: 'rgba(107, 91, 149, 0.05)', borderRadius: '10px', border: '1px solid rgba(107, 91, 149, 0.1)' }}>
                      <div style={{ fontWeight: 700, fontSize: '1rem' }}>{v.text}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontStyle: 'italic', marginBottom: '0.2rem' }}>{v.pronunciation}</div>
                      <div style={{ fontSize: '0.85rem' }}>{v.meaning}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {data.grammar.length === 0 && data.vocabulary.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '2rem' }}>
                No specific patterns identified in this snippet. try selecting a longer phrase.
              </div>
            )}
          </div>
        ) : null}
      </motion.div>
    </div>
  );
}
