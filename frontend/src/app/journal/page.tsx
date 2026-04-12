'use client';

import { useState, useEffect } from 'react';
import { 
  Edit3, 
  Sparkles, 
  Send, 
  RefreshCcw, 
  CheckCircle2, 
  AlertCircle,
  History,
  ChevronRight,
  BookOpen,
  X,
  Languages,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface Correction {
  is_correct: boolean;
  correction?: string;
  explanation?: string;
  natural_score: number;
}

interface Variation {
  label: string;
  text: string;
  explanation: string;
}

interface Word {
  text: string;
  meaning: string;
  pronunciation?: string;
}

interface JournalReview {
  corrections: Correction[];
  natural_version: string;
  variations: Variation[];
  vocabulary: Word[];
}

export default function JournalPage() {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [promptExplanation, setPromptExplanation] = useState('');
  const [content, setContent] = useState('');
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [review, setReview] = useState<any | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [view, setView] = useState<'editor' | 'review'>('editor');
  
  // For loading specific entries from history
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const entryId = searchParams?.get('id');

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (entryId) {
      fetchEntry(parseInt(entryId));
    } else {
      fetchPrompt();
    }
  }, [entryId]);

  const fetchEntry = async (id: number) => {
    try {
      const res = await api.get(`/journal/${id}`);
      setPrompt(res.data.prompt);
      setContent(res.data.content);
      const feedback = JSON.parse(res.data.feedback);
      setReview(feedback);
      setView('review');
    } catch (err) {
      console.error('Failed to fetch entry:', err);
      fetchPrompt();
    }
  };

  const fetchPrompt = async () => {

    setIsGeneratingPrompt(true);
    try {
      const res = await api.get('/journal/prompt');
      setPrompt(res.data.prompt);
      setPromptExplanation(res.data.explanation);
    } catch (err) {
      console.error('Failed to fetch prompt:', err);
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await api.post('/journal', {
        prompt: prompt,
        content: content
      });
      // The backend returns the JournalEntry object, we need the parsed feedback
      const feedback = JSON.parse(res.data.feedback);
      setReview(feedback);
      setView('review');
    } catch (err) {
      console.error('Failed to submit journal:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setContent('');
    setReview(null);
    setView('editor');
    fetchPrompt();
  };

  if (view === 'review' && review) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: isMobile ? '1rem' : '2rem' }}>
        <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="gradient-text" style={{ fontSize: isMobile ? '1.8rem' : '2.5rem' }}>Review & Feedback</h1>
            <p style={{ color: 'var(--text-dim)' }}>Native-style improvements and corrections</p>
          </div>
          <button onClick={reset} className="glass-hover" style={{ padding: '0.8rem 1.5rem', borderRadius: '14px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.05)', color: 'white', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Edit3 size={18} /> New Entry
          </button>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 400px', gap: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Original vs Natural */}
            <section className="glass" style={{ padding: '2rem', borderRadius: '28px' }}>
               <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                 <Languages size={20} color="var(--primary)" /> Native-Style Rewrite
               </h3>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                 <div style={{ padding: '1.2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                   <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>Your Version</span>
                   <p style={{ fontSize: '1.1rem', lineHeight: 1.6 }}>{content}</p>
                 </div>
                 <div style={{ padding: '1.2rem', background: 'rgba(34, 197, 94, 0.05)', borderRadius: '16px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                   <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#22c55e', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>Refined Version</span>
                   <p style={{ fontSize: '1.2rem', lineHeight: 1.6, fontWeight: 500, color: 'white' }}>{review.natural_version}</p>
                 </div>
               </div>
            </section>

            {/* Corrections */}
            <section className="glass" style={{ padding: '2rem', borderRadius: '28px' }}>
               <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                 <AlertCircle size={20} color="var(--accent)" /> Detailed Corrections
               </h3>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 {review.corrections.map((corr: any, i: number) => (
                   <div key={i} style={{ padding: '1.2rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', borderLeft: `4px solid ${corr.is_correct ? '#22c55e' : '#ef4444'}` }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: 800, color: corr.is_correct ? '#22c55e' : '#ef4444' }}>{corr.is_correct ? 'WELL DONE' : 'FIX NEEDED'}</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Naturalness: {corr.natural_score}/10</span>
                     </div>
                     {!corr.is_correct && corr.correction && (
                       <p style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: '#ef4444' }}>{corr.correction}</p>
                     )}
                     <p style={{ fontSize: '0.95rem', color: 'var(--text-dim)', lineHeight: 1.5 }}>{corr.explanation}</p>
                   </div>
                 ))}
                 {review.corrections.length === 0 && <p style={{ color: 'var(--text-dim)' }}>No major corrections needed! Great job.</p>}
               </div>
            </section>
          </div>

          <aside style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
             {/* Variations */}
             <section className="glass" style={{ padding: '1.5rem', borderRadius: '24px' }}>
               <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                 <Sparkles size={18} color="gold" /> Variations
               </h3>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 {review.variations.map((v: any, i: number) => (
                   <div key={i} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '14px', border: '1px solid var(--border)' }}>
                     <span style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{v.label}</span>
                     <p style={{ fontSize: '1rem', fontWeight: 600, margin: '0.4rem 0' }}>{v.text}</p>
                     <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{v.explanation}</p>
                   </div>
                 ))}
               </div>
             </section>

             {/* Vocabulary */}
             <section className="glass" style={{ padding: '1.5rem', borderRadius: '24px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <History size={18} color="var(--primary)" /> Key Vocabulary
                </h3>
                <div style={{ display: 'grid', gap: '0.8rem' }}>
                  {review.vocabulary.map((word: any, i: number) => (
                    <div key={i} className="glass-hover" style={{ padding: '1rem', borderRadius: '14px', background: 'rgba(255,255,255,0.02)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>{word.text}</span>
                        {word.pronunciation && <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{word.pronunciation}</span>}
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--primary)', marginTop: '0.2rem', fontWeight: 600 }}>{word.meaning}</p>
                    </div>
                  ))}
                </div>
             </section>
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: isMobile ? '1rem' : '2rem' }}>
      <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="gradient-text" style={{ fontSize: isMobile ? '2.5rem' : '3.5rem', fontWeight: 900, letterSpacing: '-0.03em' }}>Writing Journal</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem', marginTop: '0.5rem' }}>Sharpen your {user?.target_language || 'Korean'} through personal reflection.</p>
        </div>
        <Link href="/journal/history">
          <button className="glass-hover" style={{ padding: '0.8rem 1.2rem', borderRadius: '14px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.05)', color: 'white', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <History size={18} /> History
          </button>
        </Link>
      </header>

      {/* Prompt Card */}
      <section className="glass" style={{ padding: isMobile ? '1.5rem' : '2.5rem', borderRadius: '32px', marginBottom: '2.5rem', background: 'linear-gradient(135deg, rgba(255, 59, 63, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)', border: '1px solid rgba(255, 59, 63, 0.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div style={{ padding: '0.6rem', background: 'var(--primary)', borderRadius: '12px', color: 'white' }}>
              <Edit3 size={20} />
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Writing Prompt</span>
          </div>
          <button onClick={fetchPrompt} disabled={isGeneratingPrompt} className="glass-hover" style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '0.5rem' }} title="New Prompt">
            <RefreshCcw size={18} className={isGeneratingPrompt ? 'animate-spin' : ''} />
          </button>
        </div>

        {isGeneratingPrompt ? (
          <div style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}><RefreshCcw size={24} color="var(--primary)" /></motion.div>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h2 style={{ fontSize: isMobile ? '1.4rem' : '1.8rem', fontWeight: 800, lineHeight: 1.3, marginBottom: '0.8rem' }}>{prompt || 'Loading prompt...'}</h2>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.95rem', fontStyle: 'italic' }}>{promptExplanation}</p>
          </motion.div>
        )}
      </section>

      {/* Entry Editor */}
      <section className="glass" style={{ padding: '2rem', borderRadius: '32px', position: 'relative' }}>
         <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`Write your entry in ${user?.target_language || 'Korean'} here...`}
          style={{
            width: '100%',
            minHeight: '300px',
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '1.2rem',
            lineHeight: 1.6,
            resize: 'none',
            outline: 'none',
            padding: '0'
          }}
         />
         
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
            <div style={{ color: 'var(--text-dim)', fontSize: '0.9rem', fontWeight: 600 }}>
              {content.trim().split(/\s+/).filter(Boolean).length} words
            </div>
            <button 
              onClick={handleSubmit}
              disabled={!content.trim() || isSubmitting}
              className="primary-button" 
              style={{ padding: '1rem 2.5rem', borderRadius: '16px', fontWeight: 800, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.8rem', width: isMobile ? '100%' : 'auto' }}
            >
              {isSubmitting ? <><RefreshCcw size={20} className="animate-spin" /> Analyzing...</> : <><Send size={20} /> Submit Entry</>}
            </button>
         </div>
      </section>
    </div>
  );
}
