'use client';

import { useState, useRef, useEffect } from 'react';
import api from '@/lib/api';
import { Send, CheckCircle, Info, Hash, Book } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  feedback?: any;
  grammar?: any[];
  vocabulary?: any[];
}

export default function ChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const targetLanguage = user?.target_language || 'Korean';

  // Latest AI metadata for side panes
  const latestFeedback = messages.findLast(m => m.role === 'user' && m.feedback)?.feedback;
  const latestAIInfo = messages.findLast(m => m.role === 'assistant');

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

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
      gridTemplateColumns: '300px 1fr 300px', 
      height: 'calc(100vh - 4rem)',
      gap: '1rem',
      paddingBottom: '2rem'
    }}>
      {/* 1. Left Feedback Pane */}
      <aside className="glass" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
            <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              Naturalness: {latestFeedback.natural_score}/10
            </div>
          </motion.div>
        ) : (
          <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>
            AI feedback will appear here after you type in {targetLanguage}.
          </div>
        )}
      </aside>

      {/* 2. Main Chat Window */}
      <section className="glass" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div ref={scrollRef} style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '2rem', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '1.5rem' 
        }}>
          {messages.map((m, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }}
              style={{
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '80%',
                padding: '1rem 1.5rem',
                borderRadius: m.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                background: m.role === 'user' ? 'var(--primary)' : 'var(--glass-hover)',
                fontWeight: 500,
                boxShadow: m.role === 'user' ? '0 10px 15px -3px rgba(255, 59, 63, 0.2)' : 'none'
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
