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
  X
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
  
  // Exercise Specific State
  const [currentMode, setCurrentMode] = useState<ExerciseMode>('flashcard');
  const [isFlipped, setIsFlipped] = useState(false); // For Flashcard
  const [scrambleOrder, setScrambleOrder] = useState<string[]>([]); // Current order for Scramble
  const [scramblePool, setScramblePool] = useState<string[]>([]); // Remaining words for Scramble
  const [clozeInput, setClozeInput] = useState(''); // For Cloze
  const [feedback, setFeedback] = useState<'neutral' | 'correct' | 'wrong'>('neutral');

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', flexDirection: 'column', padding: '1rem' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass" style={{ padding: '3rem', maxWidth: '600px', width: '100%', textAlign: 'center' }}>
          <div style={{ background: 'rgba(255, 59, 63, 0.1)', width: '64px', height: '64px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--primary)' }}>
            <Brain size={32} />
          </div>
          <h1 className="gradient-text" style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '1rem' }}>Practice Zone</h1>
          <p style={{ color: 'var(--text-dim)', marginBottom: '2.5rem' }}> Master your library through interactive exercises.</p>

          <div style={{ marginBottom: '2rem', textAlign: 'left' }}>
            <label style={{ display: 'block', marginBottom: '1rem', fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Practice Mode</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.8rem' }}>
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
                    padding: '1.2rem 1rem',
                    borderRadius: '16px',
                    border: '1px solid',
                    borderColor: preferredMode === m.id ? 'var(--primary)' : 'var(--border)',
                    background: preferredMode === m.id ? 'rgba(255, 59, 63, 0.1)' : 'rgba(255,255,255,0.02)',
                    color: preferredMode === m.id ? 'var(--primary)' : 'white',
                    display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', transition: 'all 0.2s ease', fontWeight: 600
                  }}
                >
                  <m.icon size={18} /> {m.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '2.5rem', textAlign: 'left' }}>
            <label style={{ display: 'block', marginBottom: '1rem', fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Session Size</label>
            <div style={{ display: 'flex', gap: '0.8rem' }}>
              {[5, 10, 20].map(size => (
                <button key={size} onClick={() => setSessionSize(size)} className="glass-hover" style={{ flex: 1, padding: '1rem', borderRadius: '14px', border: '1px solid', borderColor: sessionSize === size ? 'var(--primary)' : 'var(--border)', background: sessionSize === size ? 'rgba(255, 59, 63, 0.05)' : 'transparent', color: sessionSize === size ? 'var(--primary)' : 'white', cursor: 'pointer', fontWeight: 700, fontSize: '1rem' }}>{size} Items</button>
              ))}
            </div>
          </div>

          <button onClick={startSession} disabled={loading} className="primary-button glass-hover shadow-button" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', padding: '1.2rem', borderRadius: '18px', fontSize: '1.2rem', fontWeight: 800, background: 'var(--primary)', color: 'white', border: 'none', cursor: 'pointer' }}>
            {loading ? 'Preparing Session...' : <><Play size={20} fill="currentColor" /> Start Session</>}
          </button>
        </motion.div>
      </div>
    );
  }

  if (gameState === 'finished') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', flexDirection: 'column', padding: '1rem' }}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass" style={{ padding: '3.5rem', maxWidth: '500px', width: '100%', textAlign: 'center' }}>
          <div style={{ color: '#22c55e', marginBottom: '2rem' }}><CheckCircle2 size={72} style={{ margin: '0 auto' }} /></div>
          <h1 className="gradient-text" style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem' }}>Great Session!</h1>
          <p style={{ color: 'var(--text-dim)', marginBottom: '3rem', lineHeight: 1.6, fontSize: '1.1rem' }}>You've successfully completed {items.length} exercises. Your mastery is growing! 🚀</p>
          <button onClick={() => setGameState('setup')} className="glass-hover primary-button" style={{ width: '100%', padding: '1.2rem', borderRadius: '18px', background: 'var(--primary)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer' }}><RotateCcw size={20} /> New Practice Session</button>
        </motion.div>
      </div>
    );
  }

  const currentItem = items[currentIndex];

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, letterSpacing: '-0.02em' }}>Practice Session</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.4rem' }}>
            <span style={{ color: 'var(--text-dim)', fontSize: '0.95rem' }}>Exercise {currentIndex + 1} of {items.length}</span>
            <div style={{ background: 'rgba(255,255,255,0.05)', height: '4px', width: '100px', borderRadius: '2px' }}>
              <div style={{ background: 'var(--primary)', height: '100%', width: `${((currentIndex + 1) / items.length) * 100}%`, borderRadius: '2px' }} />
            </div>
          </div>
        </div>
        <button onClick={() => setGameState('setup')} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.7rem 1.4rem', borderRadius: '14px', fontSize: '0.9rem', fontWeight: 700 }}><XCircle size={18} /> End Session</button>
      </header>

      <div style={{ minHeight: '520px', position: 'relative' }}>
        <AnimatePresence mode="wait">
          <motion.div key={`${currentIndex}-${currentMode}`} initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -30, opacity: 0 }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}>
            
            {/* --- FLASHCARD MODE --- */}
            {currentMode === 'flashcard' && (
              <div style={{ perspective: '1500px', width: '100%' }}>
                <motion.div onClick={() => setIsFlipped(!isFlipped)} initial={false} animate={{ rotateY: isFlipped ? 180 : 0 }} transition={{ duration: 0.6, type: 'spring', stiffness: 220, damping: 28 }} style={{ width: '100%', height: '450px', position: 'relative', transformStyle: 'preserve-3d', cursor: 'pointer' }}>
                  <div className="glass" style={{ position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3.5rem', textAlign: 'center', borderRadius: '32px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 900, color: currentItem.type === 'word' ? 'var(--primary)' : 'var(--accent)', textTransform: 'uppercase', marginBottom: '2.5rem', padding: '0.5rem 1.2rem', background: 'rgba(255,255,255,0.04)', borderRadius: '24px', letterSpacing: '0.1em' }}>{currentItem.type}</span>
                    <h1 style={{ fontSize: '4.8rem', fontWeight: 900, lineHeight: 1.1 }}>{currentItem.front}</h1>
                    <div style={{ marginTop: '4rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}><RotateCcw size={16} /> Tap to flip card</div>
                  </div>
                  <div className="glass" style={{ position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3.5rem', textAlign: 'center', borderRadius: '32px' }}>
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Meaning</span>
                    <h2 style={{ fontSize: '3.2rem', fontWeight: 900, color: 'var(--primary)' }}>{currentItem.back}</h2>
                    {currentItem.pronunciation && <p style={{ fontSize: '1.6rem', color: 'white', marginTop: '1rem', fontWeight: 500 }}>{currentItem.pronunciation}</p>}
                    {currentItem.example && (
                      <div style={{ marginTop: '2.5rem', padding: '1.2rem', background: 'rgba(255,255,255,0.03)', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.05)', fontStyle: 'italic', color: 'white', fontSize: '1rem', maxWidth: '90%' }}>"{currentItem.example}"</div>
                    )}
                  </div>
                </motion.div>
              </div>
            )}

            {/* --- SCRAMBLE MODE --- */}
            {currentMode === 'scramble' && (
              <div className="glass" style={{ padding: '3.5rem', minHeight: '450px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2.5rem', borderRadius: '32px' }}>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.15em', padding: '0.5rem 1.2rem', background: 'rgba(255, 59, 63, 0.1)', borderRadius: '24px' }}>Sentence Scramble</span>
                  <p style={{ fontSize: '1.2rem', marginTop: '1.5rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>"{currentItem.back}"</p>
                </div>

                <div style={{ width: '100%', minHeight: '130px', padding: '1.8rem', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: feedback === 'correct' ? '2px solid #22c55e' : feedback === 'wrong' ? '2px solid #ef4444' : '2px dashed var(--border)', display: 'flex', flexWrap: 'wrap', gap: '0.8rem', justifyContent: 'center', alignItems: 'center', transition: 'all 0.3s' }}>
                  <AnimatePresence>
                    {scrambleOrder.map((word, i) => (
                      <motion.button initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} key={`${i}-${word}`} onClick={() => removeFromScramble(word, i)} style={{ padding: '0.9rem 1.5rem', borderRadius: '14px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '1rem', boxShadow: '0 5px 15px rgba(255, 59, 63, 0.2)' }}>{word}</motion.button>
                    ))}
                  </AnimatePresence>
                  {scrambleOrder.length === 0 && <span style={{ color: 'rgba(255,255,255,0.1)', fontSize: '1.1rem', fontWeight: 500 }}>Arrange the words correctly...</span>}
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', justifyContent: 'center', marginTop: '1rem' }}>
                  <AnimatePresence>
                    {scramblePool.map((word, i) => (
                      <motion.button initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} key={`${i}-${word}`} onClick={() => addToScramble(word, i)} className="glass-hover" style={{ padding: '0.9rem 1.5rem', borderRadius: '14px', background: 'rgba(255,255,255,0.04)', color: 'white', border: '1px solid var(--border)', fontWeight: 600, cursor: 'pointer', fontSize: '1rem' }}>{word}</motion.button>
                    ))}
                  </AnimatePresence>
                </div>

                {feedback === 'neutral' ? (
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button 
                      onClick={() => {
                        const nextWord = (currentItem.example || '').split(' ')[scrambleOrder.length];
                        if (nextWord) {
                          setScrambleOrder([...scrambleOrder, nextWord]);
                          setScramblePool(scramblePool.filter(w => w !== nextWord));
                        }
                      }}
                      className="glass-hover"
                      style={{ padding: '1rem', borderRadius: '16px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}
                    >
                      <Sparkles size={18} /> Hint
                    </button>
                    <button onClick={checkAnswer} disabled={scramblePool.length > 0} className="primary-button" style={{ padding: '1rem 2.5rem', borderRadius: '16px', background: scramblePool.length === 0 ? 'var(--primary)' : 'rgba(255,255,255,0.05)', border: 'none', color: 'white', fontWeight: 700, cursor: scramblePool.length === 0 ? 'pointer' : 'not-allowed', opacity: scramblePool.length === 0 ? 1 : 0.5 }}>Check Answer</button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: feedback === 'correct' ? '#22c55e' : '#ef4444', fontWeight: 900, fontSize: '1.5rem' }}>
                    {feedback === 'correct' ? <><CheckCircle2 size={28} /> Correct!</> : <><XCircle size={28} /> Try again!</>}
                  </div>
                )}
              </div>
            )}

            {/* --- CLOZE MODE --- */}
            {currentMode === 'cloze' && (
              <div className="glass" style={{ padding: '4.5rem 3.5rem', minHeight: '450px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '3rem', borderRadius: '32px' }}>
                <div style={{ textAlign: 'center', width: '100%' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.15em', padding: '0.5rem 1.2rem', background: 'rgba(157, 86, 255, 0.1)', borderRadius: '24px' }}>Cloze Master</span>
                  
                  <div style={{ maxWidth: '750px', margin: '2.5rem auto 0' }}>
                    <h2 style={{ fontSize: '2.6rem', fontWeight: 800, lineHeight: 1.4, color: 'white' }}>
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
                                width: '180px', 
                                background: 'rgba(255,255,255,0.02)', 
                                border: 'none', 
                                borderBottom: `3px solid ${feedback === 'correct' ? '#22c55e' : feedback === 'wrong' ? '#ef4444' : 'var(--accent)'}`, 
                                color: 'white', 
                                textAlign: 'center', 
                                outline: 'none', 
                                fontSize: '2.6rem', 
                                fontWeight: 900, 
                                margin: '0 0.8rem',
                                borderRadius: '8px 8px 0 0',
                                padding: '0 0.4rem'
                              }}
                              placeholder="..."
                            />
                          )}
                        </span>
                      ))}
                    </h2>
                  </div>
                  <p style={{ color: 'var(--text-dim)', marginTop: '2.5rem', fontSize: '1.3rem', fontWeight: 500 }}>Translate: "{currentItem.back}"</p>
                </div>

                {feedback === 'neutral' ? (
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button 
                      onClick={() => {
                        if (currentItem.cloze_answer) {
                          setClozeInput(currentItem.cloze_answer.substring(0, 2) + "...");
                        }
                      }}
                      className="glass-hover"
                      style={{ padding: '1rem 2rem', borderRadius: '16px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--accent)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}
                    >
                      <Sparkles size={18} /> Hint
                    </button>
                    <button onClick={checkAnswer} className="primary-button" style={{ padding: '1.1rem 4rem', borderRadius: '20px', background: 'var(--accent)', border: 'none', color: 'white', fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer' }}>Verify Answer</button>
                  </div>
                ) : (
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: feedback === 'correct' ? '#22c55e' : '#ef4444', fontWeight: 900, fontSize: '1.8rem', justifyContent: 'center' }}>
                      {feedback === 'correct' ? <><CheckCircle2 size={32} /> Exact Match!</> : <><XCircle size={32} /> Correct answer: {currentItem.cloze_answer}</>}
                    </div>
                  </motion.div>
                )}
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Controls */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1.5rem', marginTop: '4rem' }}>
        <button onClick={prevCard} disabled={currentIndex === 0} className="glass-hover" style={{ width: '72px', height: '72px', borderRadius: '24px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: currentIndex === 0 ? 'not-allowed' : 'pointer', opacity: currentIndex === 0 ? 0.3 : 1, background: 'rgba(255,255,255,0.03)', color: 'white', transition: 'all 0.2s' }}>
          <ChevronLeft size={32} />
        </button>

        <button
          onClick={nextCard}
          className="primary-button glass-hover shadow-button"
          style={{
            flex: 1,
            maxWidth: '350px',
            padding: '1.3rem',
            borderRadius: '24px',
            background: feedback !== 'neutral' || currentMode === 'flashcard' ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
            color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', fontSize: '1.2rem', fontWeight: 900, border: 'none', cursor: 'pointer', opacity: feedback !== 'neutral' || currentMode === 'flashcard' ? 1 : 0.6
          }}
        >
          {currentIndex === items.length - 1 ? <>Complete Practice <CheckCircle2 size={24} /></> : <>Continue Practice <ChevronRight size={24} /></>}
        </button>
      </div>
    </div>
  );
}
