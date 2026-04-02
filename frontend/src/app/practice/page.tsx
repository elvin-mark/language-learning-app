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
  Play,
  Puzzle,
  Type,
  Layers,
  Sparkles,
  Check,
  X,
  Info
} from 'lucide-react';

interface PracticeItem {
  id: number;
  type: 'word' | 'grammar';
  front: string;
  back: string;
  pronunciation?: string;
  example?: string;
  scramble?: string[];
  cloze_text?: string;
  cloze_answer?: string;
}

type ExerciseMode = 'flashcard' | 'scramble' | 'cloze';

export default function PracticePage() {
  const [sessionSize, setSessionSize] = useState(10);
  const [preferredMode, setPreferredMode] = useState<'mixed' | ExerciseMode>('mixed');
  const [items, setItems] = useState<PracticeItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'finished'>('setup');
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Exercise Specific State
  const [currentMode, setCurrentMode] = useState<ExerciseMode>('flashcard');
  const [isFlipped, setIsFlipped] = useState(false); // For Flashcard
  const [scrambleOrder, setScrambleOrder] = useState<string[]>([]); // Current order for Scramble
  const [scramblePool, setScramblePool] = useState<string[]>([]); // Remaining words for Scramble
  const [clozeInput, setClozeInput] = useState(''); // For Cloze
  const [feedback, setFeedback] = useState<'neutral' | 'correct' | 'wrong'>('neutral');

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const startSession = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/practice/items?count=${sessionSize}`);
      const fetchedItems = res.data;
      if (fetchedItems.length === 0) {
        alert("Your library is empty! Start chatting to collect some words first.");
        setLoading(false);
        return;
      }
      setItems(fetchedItems);
      setCurrentIndex(0);
      setGameState('playing');
      setupExercise(fetchedItems[0]);
    } catch (err) {
      console.error('Failed to fetch practice items:', err);
    } finally {
      setLoading(false);
    }
  };

  const setupExercise = (item: PracticeItem) => {
    setIsFlipped(false);
    setFeedback('neutral');
    setClozeInput('');
    
    // Determine mode
    let mode: ExerciseMode = 'flashcard';
    if (preferredMode === 'mixed') {
      const options: ExerciseMode[] = ['flashcard'];
      if (item.scramble) options.push('scramble');
      if (item.cloze_text) options.push('cloze');
      mode = options[Math.floor(Math.random() * options.length)];
    } else {
      // Check if preferred mode is possible
      if (preferredMode === 'scramble' && item.scramble) mode = 'scramble';
      else if (preferredMode === 'cloze' && item.cloze_text) mode = 'cloze';
      else mode = 'flashcard';
    }
    
    setCurrentMode(mode);

    if (mode === 'scramble' && item.scramble) {
      // Create a fresh pool from the scrambled words
      setScramblePool([...item.scramble]);
      setScrambleOrder([]);
    }
  };

  const checkAnswer = () => {
    const item = items[currentIndex];
    if (currentMode === 'cloze') {
      if (clozeInput.trim().toLowerCase() === item.cloze_answer?.toLowerCase()) {
        setFeedback('correct');
      } else {
        setFeedback('wrong');
      }
    } else if (currentMode === 'scramble') {
      const answer = item.example || '';
      // Clean both for comparison (remove punctuation and make lowercase)
      const cleanAnswer = answer.replace(/[.,!?;]/g, '').toLowerCase().trim();
      const currentText = scrambleOrder.join(' ').replace(/[.,!?;]/g, '').toLowerCase().trim();
      
      if (currentText === cleanAnswer) {
        setFeedback('correct');
      } else {
        setFeedback('wrong');
      }
    }
  };

  const nextCard = () => {
    if (currentIndex < items.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setupExercise(items[nextIdx]);
    } else {
      setGameState('finished');
    }
  };

  const prevCard = () => {
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      setCurrentIndex(prevIdx);
      setupExercise(items[prevIdx]);
    }
  };

  const addToScramble = (word: string, index: number) => {
    if (feedback !== 'neutral') return;
    setScrambleOrder([...scrambleOrder, word]);
    const newPool = [...scramblePool];
    newPool.splice(index, 1);
    setScramblePool(newPool);
  };

  const removeFromScramble = (word: string, index: number) => {
    if (feedback !== 'neutral') return;
    const newOrder = [...scrambleOrder];
    newOrder.splice(index, 1);
    setScrambleOrder(newOrder);
    setScramblePool([...scramblePool, word]);
  };

  if (gameState === 'setup') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', flexDirection: 'column', padding: isMobile ? '0.5rem' : '1rem' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass" style={{ padding: isMobile ? '1.5rem' : '3rem', maxWidth: '600px', width: '100%', textAlign: 'center' }}>
          <div style={{ background: 'rgba(255, 59, 63, 0.1)', width: isMobile ? '48px' : '64px', height: isMobile ? '48px' : '64px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.2rem', color: 'var(--primary)' }}>
            <Brain size={isMobile ? 24 : 32} />
          </div>
          <h1 className="gradient-text" style={{ fontSize: isMobile ? '1.8rem' : '2.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Practice Zone</h1>
          <p style={{ color: 'var(--text-dim)', marginBottom: isMobile ? '1.5rem' : '2.5rem', fontSize: isMobile ? '0.9rem' : '1rem' }}>Master your library through exercises.</p>

          <div style={{ marginBottom: isMobile ? '1.5rem' : '2rem', textAlign: 'left' }}>
            <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: 600, fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Practice Mode</label>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '0.6rem' }}>
              {[
                { id: 'mixed', label: 'Mixed Mode', icon: Layers },
                { id: 'flashcard', label: 'Flashcards', icon: RotateCcw },
                { id: 'scramble', label: 'Scramble', icon: Puzzle },
                { id: 'cloze', label: 'Cloze Test', icon: Type },
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => setPreferredMode(m.id as any)}
                  className="glass-hover"
                  style={{
                    padding: isMobile ? '0.9rem' : '1.2rem 1rem',
                    borderRadius: '14px',
                    border: '1px solid',
                    borderColor: preferredMode === m.id ? 'var(--primary)' : 'var(--border)',
                    background: preferredMode === m.id ? 'rgba(255, 59, 63, 0.1)' : 'rgba(255,255,255,0.02)',
                    color: preferredMode === m.id ? 'var(--primary)' : 'white',
                    display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', transition: 'all 0.2s ease', fontWeight: 600, fontSize: isMobile ? '0.9rem' : '1rem'
                  }}
                >
                  <m.icon size={16} /> {m.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: isMobile ? '2rem' : '2.5rem', textAlign: 'left' }}>
            <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: 600, fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Session Size</label>
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              {[5, 10, 20].map(size => (
                <button key={size} onClick={() => setSessionSize(size)} className="glass-hover" style={{ flex: 1, padding: isMobile ? '0.81rem' : '1rem', borderRadius: '12px', border: '1px solid', borderColor: sessionSize === size ? 'var(--primary)' : 'var(--border)', background: sessionSize === size ? 'rgba(255, 59, 63, 0.05)' : 'transparent', color: sessionSize === size ? 'var(--primary)' : 'white', cursor: 'pointer', fontWeight: 700, fontSize: isMobile ? '0.9rem' : '1rem' }}>{size} Items</button>
              ))}
            </div>
          </div>

          <button onClick={startSession} disabled={loading} className="primary-button glass-hover shadow-button" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', padding: '1.1rem', borderRadius: '16px', fontSize: isMobile ? '1.1rem' : '1.2rem', fontWeight: 800, background: 'var(--primary)', color: 'white', border: 'none', cursor: 'pointer' }}>
            {loading ? 'Preparing...' : <><Play size={18} fill="currentColor" /> Start Session</>}
          </button>
        </motion.div>
      </div>
    );
  }

  if (gameState === 'finished') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', flexDirection: 'column', padding: '1rem' }}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass" style={{ padding: isMobile ? '2rem' : '3.5rem', maxWidth: '500px', width: '100%', textAlign: 'center' }}>
          <div style={{ color: '#22c55e', marginBottom: '1.5rem' }}><CheckCircle2 size={isMobile ? 54 : 72} style={{ margin: '0 auto' }} /></div>
          <h1 className="gradient-text" style={{ fontSize: isMobile ? '2rem' : '2.5rem', fontWeight: 900, marginBottom: '0.8rem' }}>Great Session!</h1>
          <p style={{ color: 'var(--text-dim)', marginBottom: isMobile ? '2rem' : '3rem', lineHeight: 1.5, fontSize: isMobile ? '1rem' : '1.1rem' }}>You've successfully completed {items.length} exercises. Your mastery is growing! 🚀</p>
          <button onClick={() => setGameState('setup')} className="glass-hover primary-button" style={{ width: '100%', padding: '1.1rem', borderRadius: '16px', background: 'var(--primary)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer' }}><RotateCcw size={20} /> New Session</button>
        </motion.div>
      </div>
    );
  }

  const currentItem = items[currentIndex];

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: isMobile ? '1rem' : '2rem 1.5rem' }}>
      <header style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', marginBottom: isMobile ? '1.5rem' : '2.5rem', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: isMobile ? '1.5rem' : '1.8rem', fontWeight: 900, letterSpacing: '-0.02em' }}>Practice</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.4rem' }}>
            <span style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>{currentIndex + 1} of {items.length}</span>
            <div style={{ background: 'rgba(255,255,255,0.05)', height: '4px', width: isMobile ? '80px' : '100px', borderRadius: '2px' }}>
              <div style={{ background: 'var(--primary)', height: '100%', width: `${((currentIndex + 1) / items.length) * 100}%`, borderRadius: '2px' }} />
            </div>
          </div>
        </div>
        <button onClick={() => setGameState('setup')} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 700 }}><XCircle size={16} /> End Session</button>
      </header>

      <div style={{ minHeight: isMobile ? '400px' : '520px', position: 'relative' }}>
        <AnimatePresence mode="wait">
          <motion.div key={`${currentIndex}-${currentMode}`} initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -30, opacity: 0 }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}>
            
            {/* --- FLASHCARD MODE --- */}
            {currentMode === 'flashcard' && (
              <div style={{ perspective: '1500px', width: '100%' }}>
                <motion.div onClick={() => setIsFlipped(!isFlipped)} initial={false} animate={{ rotateY: isFlipped ? 180 : 0 }} transition={{ duration: 0.6, type: 'spring', stiffness: 220, damping: 28 }} style={{ width: '100%', height: isMobile ? '350px' : '450px', position: 'relative', transformStyle: 'preserve-3d', cursor: 'pointer' }}>
                  <div className="glass" style={{ position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: isMobile ? '1.5rem' : '3.5rem', textAlign: 'center', borderRadius: '28px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 900, color: currentItem.type === 'word' ? 'var(--primary)' : 'var(--accent)', textTransform: 'uppercase', marginBottom: isMobile ? '1.5rem' : '2.5rem', padding: '0.4rem 1rem', background: 'rgba(255,255,255,0.04)', borderRadius: '20px', letterSpacing: '0.08em' }}>{currentItem.type}</span>
                    <h1 style={{ fontSize: isMobile ? '2.8rem' : '4.8rem', fontWeight: 900, lineHeight: 1.1, wordBreak: 'break-word' }}>{currentItem.front}</h1>
                    <div style={{ marginTop: isMobile ? '2rem' : '4rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}><RotateCcw size={14} /> Tap to flip</div>
                  </div>
                  <div className="glass" style={{ position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: isMobile ? '1.5rem' : '3.5rem', textAlign: 'center', borderRadius: '28px' }}>
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginBottom: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Meaning</span>
                    <h2 style={{ fontSize: isMobile ? '2.2rem' : '3.2rem', fontWeight: 900, color: 'var(--primary)', lineHeight: 1.2 }}>{currentItem.back}</h2>
                    {currentItem.pronunciation && <p style={{ fontSize: isMobile ? '1.2rem' : '1.6rem', color: 'white', marginTop: '0.5rem', fontWeight: 500 }}>{currentItem.pronunciation}</p>}
                    {currentItem.example && (
                      <div style={{ marginTop: isMobile ? '1.5rem' : '2.5rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)', fontStyle: 'italic', color: 'white', fontSize: isMobile ? '0.85rem' : '1rem', maxWidth: '95%' }}>"{currentItem.example}"</div>
                    )}
                  </div>
                </motion.div>
              </div>
            )}

            {/* --- SCRAMBLE MODE --- */}
            {currentMode === 'scramble' && (
              <div className="glass" style={{ padding: isMobile ? '1.5rem' : '3.5rem', minHeight: isMobile ? '350px' : '450px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: isMobile ? '1.5rem' : '2.5rem', borderRadius: '28px' }}>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0.4rem 1rem', background: 'rgba(255, 59, 63, 0.1)', borderRadius: '20px' }}>Scramble</span>
                  <p style={{ fontSize: isMobile ? '1rem' : '1.2rem', marginTop: '1.2rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>"{currentItem.back}"</p>
                </div>

                <div style={{ width: '100%', minHeight: isMobile ? '100px' : '130px', padding: isMobile ? '1.2rem' : '1.8rem', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: feedback === 'correct' ? '2px solid #22c55e' : feedback === 'wrong' ? '2px solid #ef4444' : '2px dashed var(--border)', display: 'flex', flexWrap: 'wrap', gap: isMobile ? '0.5rem' : '0.8rem', justifyContent: 'center', alignItems: 'center', transition: 'all 0.3s' }}>
                  <AnimatePresence>
                    {scrambleOrder.map((word, i) => (
                      <motion.button initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} key={`${i}-${word}`} onClick={() => removeFromScramble(word, i)} style={{ padding: isMobile ? '0.6rem 0.9rem' : '0.9rem 1.5rem', borderRadius: '10px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: isMobile ? '0.85rem' : '1rem', boxShadow: '0 4px 10px rgba(255, 59, 63, 0.2)' }}>{word}</motion.button>
                    ))}
                  </AnimatePresence>
                  {scrambleOrder.length === 0 && <span style={{ color: 'rgba(255,255,255,0.1)', fontSize: isMobile ? '0.9rem' : '1.1rem', fontWeight: 500 }}>Tap words to order...</span>}
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: isMobile ? '0.5rem' : '0.8rem', justifyContent: 'center', marginTop: '0.5rem' }}>
                  <AnimatePresence>
                    {scramblePool.map((word, i) => (
                      <motion.button initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} key={`${i}-${word}`} onClick={() => addToScramble(word, i)} className="glass-hover" style={{ padding: isMobile ? '0.6rem 0.9rem' : '0.9rem 1.5rem', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', color: 'white', border: '1px solid var(--border)', fontWeight: 600, cursor: 'pointer', fontSize: isMobile ? '0.85rem' : '1rem' }}>{word}</motion.button>
                    ))}
                  </AnimatePresence>
                </div>

                {feedback === 'neutral' ? (
                  <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.5rem' }}>
                    <button onClick={checkAnswer} disabled={scramblePool.length > 0} className="primary-button" style={{ padding: '0.9rem 2rem', borderRadius: '12px', background: scramblePool.length === 0 ? 'var(--primary)' : 'rgba(255,255,255,0.05)', border: 'none', color: 'white', fontWeight: 700, cursor: scramblePool.length === 0 ? 'pointer' : 'not-allowed', opacity: scramblePool.length === 0 ? 1 : 0.5, fontSize: '0.9rem' }}>Check</button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: feedback === 'correct' ? '#22c55e' : '#ef4444', fontWeight: 900, fontSize: isMobile ? '1.2rem' : '1.5rem' }}>
                    {feedback === 'correct' ? <><CheckCircle2 size={24} /> Correct!</> : <><XCircle size={24} /> Try again!</>}
                  </div>
                )}
              </div>
            )}

            {/* --- CLOZE MODE --- */}
            {currentMode === 'cloze' && (
              <div className="glass" style={{ padding: isMobile ? '2.5rem 1.5rem' : '4.5rem 3.5rem', minHeight: isMobile ? '350px' : '450px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: isMobile ? '2rem' : '3rem', borderRadius: '28px' }}>
                <div style={{ textAlign: 'center', width: '100%' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0.4rem 1rem', background: 'rgba(157, 86, 255, 0.1)', borderRadius: '20px' }}>Cloze</span>
                  
                  <div style={{ maxWidth: '100%', margin: isMobile ? '1.5rem auto 0' : '2.5rem auto 0' }}>
                    <h2 style={{ fontSize: isMobile ? '1.6rem' : '2.6rem', fontWeight: 800, lineHeight: 1.4, color: 'white', wordBreak: 'break-word' }}>
                      {currentItem.cloze_text?.split('____').map((part, i, arr) => (
                        <span key={i}>
                          {part}
                          {i < arr.length - 1 && (
                            <input
                              autoFocus
                              value={clozeInput}
                              onChange={(e) => setClozeInput(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && checkAnswer()}
                              style={{ 
                                width: isMobile ? '100px' : '180px', 
                                background: 'rgba(255,255,255,0.02)', 
                                border: 'none', 
                                borderBottom: `2px solid ${feedback === 'correct' ? '#22c55e' : feedback === 'wrong' ? '#ef4444' : 'var(--accent)'}`, 
                                color: 'white', 
                                textAlign: 'center', 
                                outline: 'none', 
                                fontSize: isMobile ? '1.6rem' : '2.6rem', 
                                fontWeight: 900, 
                                margin: '0 0.4rem',
                                padding: '0'
                              }}
                              placeholder="..."
                            />
                          )}
                        </span>
                      ))}
                    </h2>
                  </div>
                  <p style={{ color: 'var(--text-dim)', marginTop: isMobile ? '1.5rem' : '2.5rem', fontSize: isMobile ? '1rem' : '1.3rem', fontWeight: 500 }}>"{currentItem.back}"</p>
                </div>

                {feedback === 'neutral' ? (
                  <button onClick={checkAnswer} className="primary-button" style={{ padding: '0.9rem 3rem', borderRadius: '14px', background: 'var(--accent)', border: 'none', color: 'white', fontWeight: 800, fontSize: '1rem', cursor: 'pointer' }}>Verify</button>
                ) : (
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: feedback === 'correct' ? '#22c55e' : '#ef4444', fontWeight: 900, fontSize: isMobile ? '1.1rem' : '1.5rem', justifyContent: 'center' }}>
                      {feedback === 'correct' ? <><CheckCircle2 size={24} /> Correct!</> : <><Info size={20} /> Ans: {currentItem.cloze_answer}</>}
                    </div>
                  </motion.div>
                )}
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Controls */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: isMobile ? '0.8rem' : '1.5rem', marginTop: isMobile ? '2.5rem' : '4rem' }}>
        <button onClick={prevCard} disabled={currentIndex === 0} className="glass-hover" style={{ width: isMobile ? '56px' : '72px', height: isMobile ? '56px' : '72px', borderRadius: '18px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: currentIndex === 0 ? 'not-allowed' : 'pointer', opacity: currentIndex === 0 ? 0.3 : 1, background: 'rgba(255,255,255,0.03)', color: 'white', transition: 'all 0.2s' }}>
          <ChevronLeft size={isMobile ? 24 : 32} />
        </button>

        <button
          onClick={nextCard}
          className="primary-button glass-hover shadow-button"
          style={{
            flex: 1,
            maxWidth: isMobile ? 'none' : '350px',
            padding: isMobile ? '1.1rem' : '1.3rem',
            borderRadius: '20px',
            background: feedback !== 'neutral' || currentMode === 'flashcard' ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
            color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', fontSize: isMobile ? '1rem' : '1.2rem', fontWeight: 900, border: 'none', cursor: 'pointer', opacity: feedback !== 'neutral' || currentMode === 'flashcard' ? 1 : 0.6
          }}
        >
          {currentIndex === items.length - 1 ? (isMobile ? 'Finish' : 'Complete Practice') : (isMobile ? 'Continue' : 'Continue Practice')} 
          <ChevronRight size={isMobile ? 18 : 24} />
        </button>
      </div>
    </div>
  );
}
