'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  BookText, 
  Sparkles, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Languages, 
  RefreshCcw,
  BookOpen,
  Trophy,
  Loader2,
  ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface Question {
  question: string;
  options: string[];
  correct_answer_index: number;
  explanation: string;
}

interface ReadingTask {
  title: string;
  passage: string;
  translation: string;
  questions: Question[];
  vocabulary: any[];
  grammar: any[];
}

export default function ReadingPage() {
  const { user } = useAuth();
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [isGenerating, setIsGenerating] = useState(false);
  const [task, setTask] = useState<ReadingTask | null>(null);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const scrollRef = useRef<HTMLDivElement>(null);

  const targetLanguage = user?.target_language || 'Korean';

  const handleGenerate = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setTask(null);
    setIsFinished(false);
    setScore(0);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);

    try {
      const res = await api.post('/reading/generate', { 
        topic: topic || 'Daily life', 
        difficulty 
      });
      setTask(res.data);
    } catch (err) {
      console.error('Failed to generate reading task:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswer = (index: number) => {
    if (isAnswered) return;
    setSelectedAnswer(index);
    setIsAnswered(true);
    
    if (index === task?.questions[currentQuestionIndex].correct_answer_index) {
      setScore(prev => prev + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < (task?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
    }
  };

  const reset = () => {
    setTask(null);
    setTopic('');
  };

  if (isGenerating) {
    return (
      <div style={{ height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2rem' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
        >
          <Loader2 size={60} color="var(--primary)" />
        </motion.div>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>Creating your reading passage...</h2>
          <p style={{ color: 'var(--text-dim)' }}>AI is crafting a story and questions in {targetLanguage}</p>
        </div>
      </div>
    );
  }

  if (isFinished && task) {
    return (
      <div style={{ maxWidth: '800px', margin: '4rem auto', textAlign: 'center' }}>
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass"
          style={{ padding: '4rem 2rem', borderRadius: '40px', border: '1px solid var(--border)' }}
        >
          <div style={{ 
            width: '100px', 
            height: '100px', 
            background: 'var(--primary)', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 2rem',
            boxShadow: '0 20px 40px rgba(255, 59, 63, 0.3)'
          }}>
            <Trophy size={50} color="white" />
          </div>
          <h1 className="gradient-text" style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '1rem' }}>Reading Complete!</h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-dim)', marginBottom: '2.5rem' }}>
            Excellent! You scored {score} out of {task.questions.length} correct.
          </p>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button onClick={reset} className="glass-hover" style={{ padding: '1rem 2rem', borderRadius: '16px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--border)', fontWeight: 700, cursor: 'pointer' }}>
               Try Another Topic
            </button>
            <Link href="/">
              <button className="primary-button" style={{ padding: '1rem 2rem', borderRadius: '16px', fontWeight: 700 }}>
                 Return to Dashboard
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  if (task) {
    const currentQuestion = task.questions[currentQuestionIndex];
    
    return (
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1fr) 400px', 
        gap: isMobile ? '1rem' : '2rem', 
        height: isMobile ? 'auto' : 'calc(100vh - 8rem)', 
        alignItems: 'stretch' 
      }}>
        {/* Left: Reading Content */}
        <section className="glass" style={{ display: 'flex', flexDirection: 'column', overflow: isMobile ? 'visible' : 'hidden', borderRadius: isMobile ? '24px' : '32px' }}>
          <div style={{ padding: isMobile ? '1rem 1.5rem' : '1.5rem 2.5rem', borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '1rem' : '0', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center' }}>
            <h2 style={{ fontSize: isMobile ? '1.2rem' : '1.4rem', fontWeight: 800 }}>{task.title}</h2>
            <button 
              onClick={() => setShowTranslation(!showTranslation)}
              className="glass-hover"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: showTranslation ? 'var(--primary)' : 'rgba(255,255,255,0.05)', border: 'none', padding: '0.6rem 1rem', borderRadius: '12px', color: 'white', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
            >
              <Languages size={18} /> {showTranslation ? 'Hide' : 'Show'} Translation
            </button>
          </div>
          
          
          <div style={{ flex: 1, overflowY: isMobile ? 'visible' : 'auto', padding: isMobile ? '1.5rem' : '2.5rem', lineHeight: isMobile ? 1.8 : 2, fontSize: isMobile ? '1rem' : '1.15rem' }}>
            <div style={{ whiteSpace: 'pre-wrap', color: 'white' }}>{task.passage}</div>
            
            <AnimatePresence>
              {showTranslation && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px dashed var(--border)', color: 'var(--text-dim)', fontStyle: 'italic', fontSize: '1rem' }}
                >
                  {task.translation}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Right: Quiz */}
        <aside className="glass" style={{ padding: isMobile ? '1.5rem' : '2rem', display: 'flex', flexDirection: 'column', borderRadius: isMobile ? '24px' : '32px' }}>
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
              Comprehension Check • {currentQuestionIndex + 1}/{task.questions.length}
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, lineHeight: 1.4 }}>{currentQuestion.question}</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', flex: 1 }}>
            {currentQuestion.options.map((opt, i) => {
              const isCorrect = i === currentQuestion.correct_answer_index;
              const isSelected = i === selectedAnswer;
              
              let borderColor = 'var(--border)';
              let bgColor = 'rgba(255,255,255,0.03)';
              
              if (isAnswered) {
                if (isCorrect) {
                  borderColor = '#22c55e';
                  bgColor = 'rgba(34, 197, 94, 0.1)';
                } else if (isSelected) {
                  borderColor = '#ef4444';
                  bgColor = 'rgba(239, 68, 68, 0.1)';
                }
              }

              return (
                <button
                  key={i}
                  disabled={isAnswered}
                  onClick={() => handleAnswer(i)}
                  className={!isAnswered ? "glass-hover" : ""}
                  style={{
                    padding: '1.2rem',
                    borderRadius: '16px',
                    textAlign: 'left',
                    background: bgColor,
                    border: `1px solid ${borderColor}`,
                    color: 'white',
                    fontSize: '0.95rem',
                    cursor: isAnswered ? 'default' : 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                  }}
                >
                  {isAnswered && isCorrect && <CheckCircle2 size={20} color="#22c55e" />}
                  {isAnswered && isSelected && !isCorrect && <XCircle size={20} color="#ef4444" />}
                  {!isAnswered && <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid var(--border)' }} />}
                  <span style={{ fontWeight: isSelected || isCorrect ? 600 : 400 }}>{opt}</span>
                </button>
              );
            })}

            {isAnswered && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ 
                  marginTop: '1rem', 
                  padding: '1rem', 
                  background: 'rgba(255,255,255,0.05)', 
                  borderRadius: '12px', 
                  fontSize: '0.85rem', 
                  lineHeight: 1.5,
                  color: 'var(--subtitle)'
                }}
              >
                <div style={{ fontWeight: 800, color: 'white', marginBottom: '0.3rem' }}>EXPLANATION:</div>
                {currentQuestion.explanation}
              </motion.div>
            )}
          </div>

          {isAnswered && (
            <button 
              onClick={nextQuestion}
              className="primary-button" 
              style={{ width: '100%', marginTop: '2rem', padding: '1rem', borderRadius: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              {currentQuestionIndex === task.questions.length - 1 ? 'Finish Activity' : 'Next Question'} <ChevronRight size={18} />
            </button>
          )}
        </aside>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: isMobile ? '1rem' : '2rem auto' }}>
      <header style={{ marginBottom: isMobile ? '2rem' : '3rem' }}>
        <h1 className="gradient-text" style={{ fontSize: isMobile ? '1.8rem' : '2.5rem' }}>Reading Room</h1>
        <p style={{ color: 'var(--subtitle)', marginTop: '0.5rem', fontSize: isMobile ? '0.9rem' : '1rem' }}>
          Practice your comprehension with AI-generated stories and quizzes.
        </p>
      </header>

      <div className="glass" style={{ padding: isMobile ? '1.5rem' : '3rem', borderRadius: isMobile ? '30px' : '40px', border: '1px solid var(--border)', background: 'linear-gradient(135deg, rgba(255, 59, 63, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '1.5rem' : '2rem', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ 
            width: isMobile ? '50px' : '60px', 
            height: isMobile ? '50px' : '60px', 
            background: 'var(--primary)', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: '0 8px 20px rgba(255, 59, 63, 0.3)'
          }}>
            <BookText size={isMobile ? 24 : 30} color="white" />
          </div>
          
          <div>
            <h2 style={{ fontSize: isMobile ? '1.4rem' : '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>What do you want to read?</h2>
            <p style={{ color: 'var(--text-dim)', maxWidth: '500px', fontSize: isMobile ? '0.85rem' : '1rem' }}>
              Type a topic (e.g., "A day at the beach", "Global warming", "Technology") and our AI will create a {targetLanguage} passage for you.
            </p>
          </div>

          <div style={{ width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input 
              type="text" 
              placeholder="Topic (e.g. Life in Busan, Cooking, History...)"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="glass"
              style={{
                width: '100%',
                padding: '1.2rem 1.5rem',
                borderRadius: '16px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border)',
                color: 'white',
                fontSize: '1rem',
                outline: 'none'
              }}
            />
            
            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '0.8rem' }}>
              {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setDifficulty(lvl)}
                  style={{
                    flex: 1,
                    padding: isMobile ? '1rem' : '0.8rem',
                    borderRadius: '12px',
                    background: difficulty === lvl ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--border)',
                    color: 'white',
                    fontSize: isMobile ? '1rem' : '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {lvl}
                </button>
              ))}
            </div>

            <button 
              onClick={handleGenerate}
              className="primary-button" 
              style={{ width: '100%', marginTop: '0.5rem', padding: '1.2rem', borderRadius: '16px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', fontSize: isMobile ? '1.1rem' : '1rem' }}
            >
              <RefreshCcw size={20} /> Generate Passage
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
