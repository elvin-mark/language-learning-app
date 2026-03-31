'use client';

import { useState, useRef, useEffect } from 'react';
import api from '@/lib/api';
import { Send, CheckCircle2, ChevronLeft, Target, Award as Trophy, Info, MessageSquare, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import confetti from 'canvas-confetti';

interface Scenario {
  id: string;
  name: string;
  description: string;
  role: string;
  goal: string;
  objectives: string[];
  initial_message: string;
  difficulty: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  completed_indices?: number[];
  hints?: string[];
}

export default function RoleplayClient({ id }: { id: string }) {
  const { user } = useAuth();
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [completedObjectives, setCompletedObjectives] = useState<number[]>([]);
  const [activeHints, setActiveHints] = useState<string[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [isMobile, setIsMobile] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const targetLanguage = user?.target_language || 'Korean';

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchScenario = async () => {
      try {
        let scenarioData;
        if (id === 'custom') {
          const stored = sessionStorage.getItem('custom_scenario');
          if (stored) {
            scenarioData = JSON.parse(stored);
          } else {
            throw new Error('No custom scenario found in session');
          }
        } else {
          const res = await api.get(`/scenarios/${id}`);
          scenarioData = res.data;
        }
        
        setScenario(scenarioData);
        // Add initial message from AI
        setMessages([{ 
          role: 'assistant', 
          content: scenarioData.initial_message 
        }]);
      } catch (err) {
        console.error('Failed to fetch scenario:', err);
      }
    };
    fetchScenario();
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'end'
    });
  }, [messages, isLoading]);

  useEffect(() => {
    if (scenario && completedObjectives.length === scenario.objectives.length && !isSuccess) {
      setIsSuccess(true);
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FF3B3F', '#FEB236', '#6B5B95']
      });
    }
  }, [completedObjectives, scenario, isSuccess]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading || isSuccess) return;

    const userMsg: Message = { role: 'user', content: inputValue };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await api.post('/chat', {
        user_message: inputValue,
        chat_history: messages.map(m => ({ role: m.role, content: m.content })),
        scenario_id: id,
        custom_scenario: id === 'custom' ? scenario : null
      });

      const aiData = response.data;
      
      // Update objectives
      if (aiData.completed_objective_indices) {
        setCompletedObjectives(prev => {
          const combined = Array.from(new Set([...prev, ...aiData.completed_objective_indices]));
          return combined;
        });
      }

      if (aiData.objective_hints) {
        setActiveHints(aiData.objective_hints);
      }

      const aiMsg: Message = {
        role: 'assistant',
        content: aiData.response_target,
        completed_indices: aiData.completed_objective_indices,
        hints: aiData.objective_hints
      };

      setMessages(prev => [...prev, aiMsg]);

    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!scenario) return <div className="loader"></div>;

  return (
    <div style={{ 
      maxWidth: '1300px', 
      margin: '0 auto', 
      height: isMobile ? 'auto' : 'calc(100vh - 6.5rem)', 
      display: 'grid', 
      gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1fr) 260px', 
      gap: '2rem', 
      padding: '1rem',
      overflow: isMobile ? 'visible' : 'hidden'
    }}>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateRows: 'auto 1fr auto', 
        height: '100%', 
        minHeight: 0,
        gap: '1rem',
        overflow: 'hidden'
      }}>
        <header style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/chat/missions">
            <button className="glass-hover" style={{ background: 'rgba(255,255,255,0.05)', border: 'none', padding: '0.6rem', borderRadius: '12px', color: 'white', cursor: 'pointer' }}>
               <ChevronLeft size={20} />
            </button>
          </Link>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{scenario.name}</h1>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Roleplay Mission • {scenario.difficulty}</p>
          </div>
        </header>

        <section className="glass" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', minHeight: 0 }}>
          <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {messages.map((m, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '80%',
                  padding: '1rem 1.4rem',
                  borderRadius: m.role === 'user' ? '20px 20px 2px 20px' : '20px 20px 20px 2px',
                  background: m.role === 'user' ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                  border: m.role === 'assistant' ? '1px solid var(--border)' : 'none',
                  fontSize: '1rem',
                  fontWeight: 500,
                  boxShadow: m.role === 'user' ? '0 10px 20px -5px rgba(255, 59, 63, 0.3)' : 'none'
                }}
              >
                {m.content}
              </motion.div>
            ))}
            {isLoading && <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>{scenario.role} is typing...</div>}
            <div ref={messagesEndRef} />
          </div>

          {isSuccess && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(15, 15, 18, 0.8)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                zIndex: 10,
                textAlign: 'center',
                padding: '2rem'
              }}
            >
              <Trophy size={80} color="var(--accent)" style={{ marginBottom: '1.5rem' }} />
              <h2 className="gradient-text" style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem' }}>Mission Success!</h2>
              <p style={{ color: 'white', fontSize: '1.1rem', maxWidth: '400px', marginBottom: '2rem' }}>
                Excellent work! You've successfully navigated the "{scenario.name}" scenario.
              </p>
              <Link href="/chat">
                <button className="primary-button" style={{ padding: '1rem 2rem', borderRadius: '16px', fontSize: '1.1rem', fontWeight: 700 }}>
                   Return to Hub
                </button>
              </Link>
            </motion.div>
          )}
        </section>
        
        <div style={{ padding: '1rem', borderTop: '1px solid var(--border)', background: 'rgba(255,255,255,0.01)', borderRadius: '16px' }}>
          <div style={{ display: 'flex', gap: '0.8rem' }}>
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              disabled={isLoading || isSuccess}
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
            <button 
              onClick={handleSend}
              disabled={isLoading || isSuccess}
              style={{ 
                background: 'var(--primary)', 
                border: 'none', 
                borderRadius: '50%',
                width: '50px', 
                height: '50px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'white',
                transition: 'transform 0.2s ease',
                opacity: (isLoading || isSuccess) ? 0.5 : 1
              }}
            >
              <Send size={22} />
            </button>
          </div>
        </div>
      </div>

      <aside className="glass" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem', overflowY: 'auto' }}>
        <div>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem', fontSize: '1.2rem' }}>
            <Target size={20} color="var(--primary)" /> Objectives
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {scenario.objectives.map((obj, i) => {
              const isDone = completedObjectives.includes(i);
              const hint = activeHints[i];
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.8rem',
                    padding: '0.8rem',
                    borderRadius: '12px',
                    background: isDone ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isDone ? '#22c55e' : 'var(--border)'}`,
                    opacity: isDone ? 1 : 0.7,
                    transition: 'all 0.3s ease'
                  }}>
                    {isDone ? <CheckCircle2 size={18} color="#22c55e" /> : <Circle size={18} color="white" />}
                    <span style={{ fontSize: '0.9rem', color: isDone ? '#22c55e' : 'white', fontWeight: isDone ? 600 : 400 }}>{obj}</span>
                  </div>
                  
                  <AnimatePresence>
                    {!isDone && hint && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{
                          padding: '0.8rem',
                          marginLeft: '2rem',
                          background: 'rgba(254, 178, 54, 0.05)',
                          borderRadius: '8px',
                          borderLeft: '3px solid var(--accent)',
                          fontSize: '0.85rem',
                          color: '#FCD34D',
                          lineHeight: 1.4
                        }}
                      >
                        {hint}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ marginTop: 'auto', padding: '1.2rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid var(--border)' }}>
          <h4 style={{ color: 'var(--primary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MessageSquare size={14} /> Your Mission
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', lineHeight: 1.5 }}>
            {scenario.goal}
          </p>
        </div>
      </aside>
    </div>
  );
}
