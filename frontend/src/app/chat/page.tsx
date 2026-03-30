'use client';

import { useState, useRef, useEffect } from 'react';
import api from '@/lib/api';
import { Send, CheckCircle, Info, Hash, Book, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import ExplanationOverlay from '@/components/ExplanationOverlay';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  feedback?: any;
  grammar?: any[];
  vocabulary?: any[];
}

interface SelectionState {
  text: string;
  x: number;
  y: number;
}

export default function ChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selection, setSelection] = useState<SelectionState | null>(null);
  const [explanationData, setExplanationData] = useState<any>(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const targetLanguage = user?.target_language || 'Korean';

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Latest AI metadata for side panes
  const latestFeedback = messages.findLast(m => m.role === 'user' && m.feedback)?.feedback;
  const latestAIInfo = messages.findLast(m => m.role === 'assistant');

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.toString().trim().length > 0) {
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      setSelection({
        text: sel.toString().trim(),
        // Position the button slightly above the selection
        x: rect.left + rect.width / 2,
        y: rect.top - (isMobile ? 50 : 40)
      });
    } else {
      setSelection(null);
    }
  };

  const handleExplainSelection = async () => {
    if (!selection) return;
    
    setIsExplaining(true);
    setShowOverlay(true);
    setExplanationData(null);
    
    try {
      const response = await api.post('/explain', { text: selection.text });
      setExplanationData(response.data);
      setSelection(null); // Clear selection state/FAB
    } catch (err) {
      console.error('Explanation error:', err);
      setShowOverlay(false); // Close on error
    } finally {
      setIsExplaining(false);
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: inputValue };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await api.post('/chat', {
        user_message: inputValue,
        chat_history: messages.map(m => ({ role: m.role, content: m.content }))
      });

      const aiData = response.data;
      const aiMsg: Message = {
        role: 'assistant',
        content: aiData.response_target,
        grammar: aiData.grammar,
        vocabulary: aiData.vocabulary
      };

      // Add feedback to the previous user message
      setMessages(prev => {
        const newMsgs = [...prev];
        const lastIdx = newMsgs.findLastIndex(m => m.role === 'user');
        if (lastIdx !== -1) {
          newMsgs[lastIdx].feedback = aiData.feedback;
        }
        return [...newMsgs, aiMsg];
      });

    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: isMobile ? '1fr' : '300px 1fr 300px', 
      flexDirection: isMobile ? 'column' : 'row',
      height: isMobile ? 'auto' : 'calc(100vh - 4rem)',
      gap: '1rem',
      paddingBottom: isMobile ? '2rem' : '2rem'
    }}>
      {/* Selection FAB */}
      <AnimatePresence>
        {selection && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            onClick={handleExplainSelection}
            style={{
              position: 'fixed',
              left: selection.x,
              top: selection.y,
              transform: 'translateX(-50%)',
              zIndex: 100,
              background: 'linear-gradient(135deg, #FF3B3F 0%, #FEB236 100%)',
              border: 'none',
              borderRadius: '24px',
              padding: isMobile ? '10px 20px' : '6px 14px',
              color: 'white',
              fontSize: '0.85rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              boxShadow: '0 8px 16px rgba(255, 59, 63, 0.4)',
              pointerEvents: 'auto'
            }}
          >
            <Sparkles size={16} />
            Explain
          </motion.button>
        )}
      </AnimatePresence>

      {/* Explanation Overlay */}
      {showOverlay && (
        <ExplanationOverlay 
          data={explanationData} 
          isLoading={isExplaining} 
          onClose={() => setShowOverlay(false)} 
        />
      )}

      {/* 1. Left Feedback Pane */}
      <aside className="glass" style={{ 
        padding: '1.5rem', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '1rem',
        order: isMobile ? 1 : 0
      }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={18} color="var(--primary)" /> Feedback
        </h3>
        
        {latestFeedback ? (
          <motion.div 
            initial={{ opacity: 0, x: -10 }} 
            animate={{ opacity: 1, x: 0 }}
            style={{ 
              backgroundColor: 'rgba(255,255,255,0.02)', 
              padding: '1rem', 
              borderRadius: '12px' 
            }}
          >
            <div style={{ marginBottom: '0.5rem', fontWeight: 600, color: latestFeedback.is_correct ? '#22c55e' : '#ef4444' }}>
              {latestFeedback.is_correct ? 'Great Job!' : 'Correction needed'}
            </div>
            {latestFeedback.correction && (
              <div style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
                <span style={{ color: 'var(--text-dim)' }}>Corrected: </span>
                <span style={{ color: '#FCD34D' }}>{latestFeedback.correction}</span>
              </div>
            )}
            <p style={{ fontSize: '0.85rem', lineHeight: '1.5', color: '#CBD5E1' }}>
              {latestFeedback.explanation}
            </p>
            {!isMobile && (
              <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                Naturalness: {latestFeedback.natural_score}/10
              </div>
            )}
          </motion.div>
        ) : (
          <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>
            AI feedback will appear here.
          </div>
        )}
      </aside>

      {/* 2. Main Chat Window */}
      <section className="glass" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        overflow: 'hidden',
        height: isMobile ? '500px' : '100%',
        order: isMobile ? 0 : 1
      }}>
        <div 
          ref={scrollRef} 
          onMouseUp={handleSelection} 
          style={{ 
            flex: 1, 
            overflowY: 'auto', 
            padding: isMobile ? '1rem' : '2rem', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '1.5rem' 
          }}
        >
          {messages.map((m, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }}
              style={{
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '90%',
                padding: '0.8rem 1.2rem',
                borderRadius: m.role === 'user' ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                background: m.role === 'user' ? 'var(--primary)' : 'var(--glass-hover)',
                fontWeight: 500,
                fontSize: isMobile ? '0.95rem' : '1rem',
                boxShadow: m.role === 'user' ? '0 10px 15px -3px rgba(255, 59, 63, 0.2)' : 'none',
                cursor: m.role === 'assistant' ? 'text' : 'default'
              }}
            >
              {m.content}
            </motion.div>
          ))}
          {isLoading && <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>AI is thinking...</div>}
        </div>

        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '1rem' }}>
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={`Type in ${targetLanguage} or English...`}
            style={{ 
              flex: 1, 
              background: 'rgba(255,255,255,0.03)', 
              border: '1px solid var(--border)', 
              borderRadius: '24px', 
              padding: '0.8rem 1.5rem',
              color: 'white',
              outline: 'none'
            }}
          />
          <button 
            onClick={handleSend}
            style={{ 
              background: 'var(--primary)', 
              border: 'none', 
              borderRadius: '50%',
              width: '45px', 
              height: '45px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'white'
            }}
          >
            <Send size={18} />
          </button>
        </div>
      </section>

      {/* 3. Right Grammar/Vocab Pane */}
      <aside className="glass" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem', overflowY: 'auto' }}>
        <div>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Hash size={18} color="var(--accent)" /> Grammar
          </h3>
          <AnimatePresence>
            {latestAIInfo?.grammar?.map((g, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ 
                  background: 'rgba(254, 178, 54, 0.05)', 
                  padding: '1rem', 
                  borderRadius: '12px', 
                  marginBottom: '1rem',
                  borderLeft: '4px solid var(--accent)'
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: '0.3rem' }}>{g.pattern}</div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', lineHeight: '1.4' }}>{g.explanation}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Book size={18} color="#6B5B95" /> Vocabulary
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {latestAIInfo?.vocabulary?.map((v, i) => (
              <span 
                key={i} 
                style={{ 
                  background: 'rgba(107, 91, 149, 0.1)', 
                  padding: '4px 12px', 
                  borderRadius: '16px', 
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  border: '1px solid rgba(107, 91, 149, 0.2)'
                }}
              >
                {v.text} : {v.meaning}
              </span>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
