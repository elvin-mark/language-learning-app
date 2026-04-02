'use client';

import { useState, useRef, useEffect } from 'react';
import api from '@/lib/api';
import { 
  Send, 
  Sparkles, 
  ChevronLeft, 
  CheckCircle, 
  Hash, 
  Book, 
  MessageCircle,
  Zap
} from 'lucide-react';
import WritingAssistant from '@/components/WritingAssistant';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import ExplanationOverlay from '@/components/ExplanationOverlay';
import SuggestionsCarousel from '@/components/SuggestionsCarousel';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  feedback?: any;
  grammar?: any[];
  vocabulary?: any[];
  suggestions?: any[];
}

interface SelectionState {
  text: string;
  x: number;
  y: number;
}

export default function StandardChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selection, setSelection] = useState<SelectionState | null>(null);
  const [explanationData, setExplanationData] = useState<any>(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showAssistant, setShowAssistant] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const targetLanguage = user?.target_language || 'Korean';
  const router = useRouter();

  const searchParams = useSearchParams();
  const [conversationId, setConversationId] = useState<number | null>(null);

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      const parsedId = parseInt(id);
      if (parsedId !== conversationId) {
        setConversationId(parsedId);
        fetchConversationMessages(parsedId);
      }
    }
    
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [searchParams]);

  const fetchConversationMessages = async (id: number) => {
    try {
      const response = await api.get(`/conversations/${id}/messages`);
      const mappedMessages = response.data.map((m: any) => ({
        role: m.role,
        content: m.content,
        feedback: m.feedback ? JSON.parse(m.feedback) : null,
        grammar: m.grammar_used ? JSON.parse(m.grammar_used) : [],
      }));
      setMessages(mappedMessages);
    } catch (err) {
      console.error('Failed to fetch conversation messages:', err);
    }
  };

  const latestFeedback = messages.findLast(m => m.role === 'user' && m.feedback)?.feedback;
  const latestAIInfo = messages.findLast(m => m.role === 'assistant');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.toString().trim().length > 0) {
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      setSelection({
        text: sel.toString().trim(),
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
      setSelection(null);
    } catch (err) {
      console.error('Explanation error:', err);
      setShowOverlay(false);
    } finally {
      setIsExplaining(false);
    }
  };

  const handleSend = async (overrideMessage?: string) => {
    const textToSend = overrideMessage || inputValue;
    if (!textToSend.trim() || isLoading) return;
    
    setIsLoading(true);
    setInputValue('');
    setShowAssistant(false);
    
    const newMessage: Message = { role: 'user', content: textToSend };
    setMessages(prev => [...prev, newMessage]);
    
    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const response = await api.post('/chat', { 
        user_message: textToSend,
        chat_history: history,
        conversation_id: conversationId
      });
      
      const aiResp = response.data;
      if (!conversationId && aiResp.conversation_id) {
        setConversationId(aiResp.conversation_id);
        router.replace(`/chat/standard?id=${aiResp.conversation_id}`);
      }

      // Update the user message we just sent with feedback
      setMessages(prev => {
        const newMessages = [...prev];
        const lastUserIdx = [...newMessages].reverse().findIndex(m => m.role === 'user');
        if (lastUserIdx !== -1) {
          const idx = newMessages.length - 1 - lastUserIdx;
          newMessages[idx] = { ...newMessages[idx], feedback: aiResp.feedback };
        }
        
        const aiMessage: Message = { 
          role: 'assistant', 
          content: aiResp.response_target,
          grammar: aiResp.grammar,
          vocabulary: aiResp.vocabulary,
          suggestions: aiResp.suggestions
        };
        return [...newMessages, aiMessage];
      });
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggest = async () => {
    if (isLoading || isSuggesting) return;
    setIsSuggesting(true);
    try {
      const response = await api.post('/chat/suggest', 
        messages.map(m => ({ role: m.role, content: m.content }))
      );
      setInputValue(response.data.suggestion);
    } catch (err) {
      console.error('Suggestion error:', err);
    } finally {
      setIsSuggesting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <header style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link href="/chat">
          <button className="glass-hover" style={{ background: 'rgba(255,255,255,0.05)', border: 'none', padding: '0.6rem', borderRadius: '12px', color: 'white', cursor: 'pointer' }}>
             <ChevronLeft size={20} />
          </button>
        </Link>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Standard Conversation</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Free practice with AI Feedback</p>
        </div>
      </header>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr' : '280px 1fr 280px', 
        height: isMobile ? 'auto' : 'calc(100vh - 12rem)', 
        gap: '1.2rem',
        overflow: isMobile ? 'visible' : 'hidden',
        minHeight: 0
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
              <Sparkles size={16} /> Explain
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
          order: isMobile ? 1 : undefined,
          maxWidth: isMobile ? '100%' : '280px',
          overflowY: 'auto',
          minHeight: 0
        }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--primary)', fontSize: '1.1rem' }}>
            <CheckCircle size={18} /> Feedback
          </h3>
          {latestFeedback ? (
            <motion.div 
              initial={{ opacity: 0, x: -10 }} 
              animate={{ opacity: 1, x: 0 }}
              style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px' }}
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
              <p style={{ fontSize: '0.85rem', lineHeight: '1.5', color: '#CBD5E1' }}>{latestFeedback.explanation}</p>
            </motion.div>
          ) : (
            <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>AI feedback will appear here.</div>
          )}
        </aside>

        {/* 2. Main Chat Window */}
        <section className="glass" style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          overflow: 'hidden',
          order: isMobile ? 0 : undefined,
          minHeight: 0
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
            {messages.length === 0 && !isLoading && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}
              >
                <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'rgba(255, 59, 63, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--primary)', boxShadow: '0 8px 16px rgba(255, 59, 63, 0.1)' }}>
                  <MessageCircle size={40} />
                </div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.8rem' }}>Ready to Practice?</h2>
                <p style={{ color: 'var(--subtitle)', maxWidth: '400px', lineHeight: 1.6, marginBottom: '2rem' }}>
                  Start a conversation in {targetLanguage} or ask for help.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', width: '100%', maxWidth: '380px' }}>
                  <button onClick={() => setInputValue(`How do I order a coffee in ${targetLanguage}?`)} className="glass-hover" style={{ padding: '1rem', borderRadius: '16px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)', color: 'white', fontSize: '0.9rem', textAlign: 'left', cursor: 'pointer' }}>
                    <Sparkles size={16} color="var(--primary)" style={{ marginRight: '0.5rem' }} /> "How do I order a coffee?"
                  </button>
                </div>
              </motion.div>
            )}

            {messages.map((m, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                style={{
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '90%',
                  padding: '0.8rem 1.2rem',
                  borderRadius: m.role === 'user' ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                  background: m.role === 'user' ? 'var(--primary)' : 'var(--glass-hover)',
                  fontWeight: 500,
                  fontSize: isMobile ? '0.95rem' : '1rem'
                }}
              >
                {m.content}
              </motion.div>
            ))}
            {isLoading && <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>AI is thinking...</div>}
            <div ref={messagesEndRef} />
          </div>

          <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)', background: 'rgba(255,255,255,0.01)', position: 'relative' }}>
            <WritingAssistant 
              draftText={inputValue}
              isOpen={showAssistant}
              onClose={() => setShowAssistant(false)}
              onSelect={(text) => setInputValue(text)}
            />

            {/* Suggested Replies */}
            <AnimatePresence>
              {latestAIInfo?.suggestions && latestAIInfo.suggestions.length > 0 && !isLoading && (
                <SuggestionsCarousel 
                  suggestions={latestAIInfo.suggestions}
                  onSelect={handleSend}
                />
              )}
            </AnimatePresence>

            <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
              <button 
                onClick={() => setShowAssistant(!showAssistant)}
                title="Writing Assistant"
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer',
                  color: showAssistant ? 'var(--primary)' : 'var(--text-dim)',
                  padding: '0.4rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  opacity: (isLoading) ? 0.3 : 1
                }}
                disabled={isLoading}
              >
                <Zap size={20} />
              </button>
              <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                disabled={isLoading}
                placeholder={`Type your response in ${targetLanguage}...`}
                style={{ 
                  flex: 1, 
                  background: 'rgba(255,255,255,0.03)', 
                  border: '1px solid var(--border)', 
                  borderRadius: '24px', 
                  padding: '1rem 1.5rem',
                  color: 'white',
                  outline: 'none',
                  fontSize: '1rem'
                }}
              />
              <button onClick={() => handleSend()} style={{ background: 'var(--primary)', border: 'none', borderRadius: '50%', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
                <Send size={18} />
              </button>
            </div>
          </div>
        </section>

        {/* 3. Right Grammar/Vocab Pane */}
        <aside className="glass" style={{ 
          padding: '1.5rem', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '2rem', 
          overflowY: 'auto',
          order: isMobile ? 2 : undefined,
          maxWidth: isMobile ? '100%' : '280px',
          minHeight: 0
        }}>
          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.2rem', color: 'var(--accent)', fontSize: '1.1rem' }}>
              <Hash size={18} /> Grammar
            </h3>
            <AnimatePresence>
              {latestAIInfo?.grammar?.map((g, i) => (
                <motion.div key={i} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ background: 'rgba(254, 178, 54, 0.05)', padding: '1rem', borderRadius: '12px', marginBottom: '1rem', borderLeft: '4px solid var(--accent)' }}>
                  <div style={{ fontWeight: 700, marginBottom: '0.3rem' }}>{g.pattern}</div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', lineHeight: '1.4' }}>{g.explanation}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.2rem', color: '#6B5B95', fontSize: '1.1rem' }}>
              <Book size={18} /> Vocabulary
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {latestAIInfo?.vocabulary?.map((v, i) => (
                <span key={i} style={{ background: 'rgba(107, 91, 149, 0.1)', padding: '4px 12px', borderRadius: '16px', fontSize: '0.85rem', fontWeight: 500, border: '1px solid rgba(107, 91, 149, 0.2)' }}>
                  {v.text} : {v.meaning}
                </span>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
