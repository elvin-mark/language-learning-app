'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  RotateCcw, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  XCircle,
  Play
} from 'lucide-react';

interface PracticeItem {
  id: number;
  type: 'word' | 'grammar';
  front: string;
  back: string;
  pronunciation?: string;
  example?: string;
}

export default function PracticePage() {
  const [sessionSize, setSessionSize] = useState(10);
  const [items, setItems] = useState<PracticeItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'finished'>('setup');
  const [loading, setLoading] = useState(false);

  const startSession = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/practice/items?count=${sessionSize}`);
      setItems(res.data);
      setCurrentIndex(0);
      setIsFlipped(false);
      setGameState('playing');
    } catch (err) {
      console.error('Failed to fetch practice items:', err);
    } finally {
      setLoading(false);
    }
  };

  const nextCard = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    } else {
      setGameState('finished');
    }
  };

  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  };

  if (gameState === 'setup') {
    return (
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '70vh', 
          flexDirection: 'column',
          padding: '1rem'
        }}
      >
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass"
          style={{ padding: '3rem', maxWidth: '500px', width: '100%', textAlign: 'center' }}
        >
          <div style={{ 
            background: 'rgba(255, 59, 63, 0.1)', 
            width: '64px', 
            height: '64px', 
            borderRadius: '16px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 1.5rem', 
            color: 'var(--primary)' 
          }}>
            <Brain size={32} />
          </div>
          <h1 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '1rem' }}>Practice Zone</h1>
          <p style={{ color: 'var(--text-dim)', marginBottom: '2rem' }}>
            Review your vocabulary and grammar collection through interactive flashcards.
          </p>

          <div style={{ marginBottom: '2.5rem' }}>
            <label style={{ display: 'block', marginBottom: '1.2rem', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Select Card Count
            </label>
            <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center' }}>
              {[5, 10, 20].map(size => (
                <button
                  key={size}
                  onClick={() => setSessionSize(size)}
                  className="glass-hover"
                  style={{
                    flex: 1,
                    padding: '1rem',
                    borderRadius: '14px',
                    border: '1px solid',
                    borderColor: sessionSize === size ? 'var(--primary)' : 'var(--border)',
                    background: sessionSize === size ? 'rgba(255, 59, 63, 0.1)' : 'rgba(255,255,255,0.02)',
                    color: sessionSize === size ? 'var(--primary)' : 'var(--foreground)',
                    cursor: 'pointer',
                    fontWeight: 600,
                    transition: 'all 0.2s ease',
                    fontSize: '1rem'
                  }}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={startSession}
            disabled={loading}
            className="primary-button glass-hover"
            style={{ 
              width: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '0.8rem',
              padding: '1.2rem',
              borderRadius: '16px',
              border: 'none',
              background: 'var(--primary)',
              color: 'white',
              fontSize: '1.1rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {loading ? 'Preparing cards...' : <><Play size={20} fill="currentColor" /> Start Session</>}
          </button>
        </motion.div>
      </div>
    );
  }

  if (gameState === 'finished') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', flexDirection: 'column', padding: '1rem' }}>
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass"
          style={{ padding: '3rem', maxWidth: '500px', width: '100%', textAlign: 'center' }}
        >
          <div style={{ color: '#22c55e', marginBottom: '1.5rem' }}>
            <CheckCircle2 size={64} style={{ margin: '0 auto' }} />
          </div>
          <h1 className="gradient-text" style={{ fontSize: '2.2rem', marginBottom: '1rem' }}>Great Work!</h1>
          <p style={{ color: 'var(--text-dim)', marginBottom: '2.5rem', lineHeight: 1.6 }}>
            You just reviewed {items.length} items. Regular practice is the secret to mastering {items.length > 0 ? 'your target language' : 'new words'}.
          </p>
          
          <button
            onClick={() => setGameState('setup')}
            className="glass-hover"
            style={{ 
              width: '100%', 
              padding: '1.2rem', 
              borderRadius: '16px', 
              border: '1px solid var(--border)',
              background: 'rgba(255,255,255,0.02)',
              color: 'var(--foreground)',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <RotateCcw size={18} /> Review More Cards
          </button>
        </motion.div>
      </div>
    );
  }

  const currentItem = items[currentIndex];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Practice Session</h2>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.95rem', marginTop: '0.2rem' }}>
            Progress: {currentIndex + 1} / {items.length}
          </p>
        </div>
        <button 
          onClick={() => setGameState('setup')}
          style={{ 
            background: 'rgba(255,255,255,0.05)', 
            border: 'none', 
            color: 'var(--text-dim)', 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.6rem',
            padding: '0.6rem 1.2rem',
            borderRadius: '12px',
            fontSize: '0.9rem',
            fontWeight: 600
          }}
        >
          <XCircle size={18} /> Exit
        </button>
      </header>

      {/* Progress Bar */}
      <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '3.5rem', overflow: 'hidden' }}>
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${((currentIndex + 1) / items.length) * 100}%` }}
          transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
          style={{ height: '100%', background: 'linear-gradient(90deg, var(--primary), #a855f7)' }}
        />
      </div>

      <div style={{ perspective: '1200px', minHeight: '420px', position: 'relative' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ x: 100, opacity: 0, scale: 0.95 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: -100, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            style={{ width: '100%', height: '100%' }}
          >
            <motion.div
              onClick={() => setIsFlipped(!isFlipped)}
              initial={false}
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.7, type: 'spring', stiffness: 200, damping: 25 }}
              style={{
                width: '100%',
                height: '420px',
                position: 'relative',
                transformStyle: 'preserve-3d',
                cursor: 'pointer'
              }}
            >
              {/* Front Side */}
              <div
                className="glass"
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  backfaceVisibility: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '3rem',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                  backgroundColor: 'rgba(255,255,255,0.02)'
                }}
              >
                <div style={{ 
                  textTransform: 'uppercase', 
                  fontSize: '0.75rem', 
                  letterSpacing: '0.15em', 
                  color: currentItem.type === 'word' ? '#FF303F' : '#9d56ff',
                  fontWeight: 900,
                  marginBottom: '2rem',
                  padding: '0.4rem 1rem',
                  borderRadius: '30px',
                  background: currentItem.type === 'word' ? 'rgba(255,48,63,0.08)' : 'rgba(157,86,255,0.08)',
                  border: `1px solid ${currentItem.type === 'word' ? 'rgba(255,48,63,0.1)' : 'rgba(157,86,255,0.1)'}`
                }}>
                  {currentItem.type}
                </div>
                <h1 style={{ fontSize: '4.2rem', fontWeight: 900, textAlign: 'center', letterSpacing: '-0.02em', color: 'white' }}>
                  {currentItem.front}
                </h1>
                <div style={{ marginTop: '3rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                   Tap to reveal answer
                </div>
              </div>

              {/* Back Side */}
              <div
                className="glass"
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '2.5rem',
                  textAlign: 'center',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                  background: 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
                  border: '1px solid rgba(255, 59, 63, 0.2)'
                }}
              >
                <div style={{ marginBottom: '2rem' }}>
                  <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Meaning</span>
                  <h2 style={{ fontSize: '2.6rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--primary)' }}>{currentItem.back}</h2>
                </div>

                {currentItem.pronunciation && (
                  <div style={{ marginBottom: '2rem' }}>
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Reading / Pronunciation</span>
                    <p style={{ fontSize: '1.4rem', color: 'white', fontWeight: 500, marginTop: '0.4rem' }}>{currentItem.pronunciation}</p>
                  </div>
                )}

                {currentItem.example && (
                  <div style={{ maxWidth: '90%', background: 'rgba(255,255,255,0.03)', padding: '1.2rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '0.6rem' }}>Context Example</span>
                    <p style={{ color: 'rgba(255,255,255,0.9)', fontStyle: 'italic', lineHeight: 1.6, fontSize: '0.95rem' }}>"{currentItem.example}"</p>
                  </div>
                )}
                
                <p style={{ marginTop: '2.5rem', color: 'var(--text-dim)', fontSize: '0.8rem' }}>Tap to flip back</p>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1.5rem', marginTop: '4rem' }}>
        <button
          onClick={prevCard}
          disabled={currentIndex === 0}
          className="glass-hover shadow-button"
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
            opacity: currentIndex === 0 ? 0.3 : 1,
            background: 'rgba(255,255,255,0.03)',
            color: 'white',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          <ChevronLeft size={28} />
        </button>

        <button
          onClick={nextCard}
          className="primary-button glass-hover shadow-button"
          style={{
            flex: 1,
            maxWidth: '300px',
            padding: '1.2rem',
            borderRadius: '20px',
            background: 'var(--primary)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.8rem',
            fontSize: '1.1rem',
            fontWeight: 800,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 10px 25px -5px rgba(255, 59, 63, 0.4)'
          }}
        >
          {currentIndex === items.length - 1 ? (
            <>Finish Session <CheckCircle2 size={22} /></>
          ) : (
            <>Next Card <ChevronRight size={22} /></>
          )}
        </button>
      </div>
    </div>
  );
}
