'use client';

import { useState, useRef, useEffect } from 'react';
import api from '@/lib/api';
import { 
  Send, 
  CheckCircle2, 
  Target, 
  ChevronLeft, 
  Trophy, 
  MessageSquare
} from 'lucide-react';
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
}

export default function RoleplayClient({ id }: { id: string }) {
  const { user } = useAuth();
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [completedObjectives, setCompletedObjectives] = useState<number[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const targetLanguage = user?.target_language || 'Korean';

  useEffect(() => {
    const fetchScenario = async () => {
      try {
        const res = await api.get(`/scenarios/${id}`);
        setScenario(res.data);
        // Add initial message from AI
        setMessages([{ 
          role: 'assistant', 
          content: res.data.initial_message 
        }]);
      } catch (err) {
        console.error('Failed to fetch scenario:', err);
      }
    };
    fetchScenario();
  }, [id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

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
        scenario_id: id
      });

      const aiData = response.data;
      
      // Update objectives
      if (aiData.completed_objective_indices) {
        setCompletedObjectives(prev => {
          const combined = Array.from(new Set([...prev, ...aiData.completed_objective_indices]));
          return combined;
        });
      }

      const aiMsg: Message = {
        role: 'assistant',
        content: aiData.response_target,
        completed_indices: aiData.completed_objective_indices
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
      height: 'calc(100vh - 6.5rem)', 
      display: 'grid', 
      gridTemplateColumns: '1fr 300px', 
      gap: '2.5rem',
      padding: '0 1.5rem'
    }}>
      
      {/* 1. Main Chat Area */}
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <header style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
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

        <section className="glass" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
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

          <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)', background: 'rgba(255,255,255,0.01)' }}>
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
        </section>
      </div>

      {/* 2. Objective Sidebar */}
      <aside className="glass" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem', fontSize: '1.2rem' }}>
            <Target size={20} color="var(--primary)" /> Objectives
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {scenario.objectives.map((obj, i) => {
              const isDone = completedObjectives.includes(i);
              return (
                <motion.div 
                  key={i}
                  animate={{ 
                    scale: isDone ? [1, 1.05, 1] : 1,
                    backgroundColor: isDone ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255,255,255,0.02)'
                  }}
                  style={{ 
                    padding: '1rem', 
                    borderRadius: '16px', 
                    border: '1px solid',
                    borderColor: isDone ? '#22c55e' : 'var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{ 
                    width: '24px', 
                    height: '24px', 
                    borderRadius: '50%', 
                    border: '2px solid',
                    borderColor: isDone ? '#22c55e' : 'var(--text-dim)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isDone ? '#22c55e' : 'transparent',
                    color: 'white'
                  }}>
                    {isDone && <CheckCircle2 size={16} />}
                  </div>
                  <span style={{ 
                    fontSize: '0.9rem', 
                    fontWeight: 600,
                    color: isDone ? '#22c55e' : 'white',
                    textDecoration: isDone ? 'line-through' : 'none',
                    opacity: isDone ? 0.7 : 1
                  }}>
                    {obj}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div style={{ marginTop: 'auto', background: 'rgba(255, 59, 63, 0.05)', padding: '1.2rem', borderRadius: '20px', border: '1px solid rgba(255, 59, 63, 0.1)' }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', marginBottom: '0.6rem', color: 'var(--primary)' }}>
            <MessageSquare size={16} /> YOUR MISSION
          </h4>
          <p style={{ fontSize: '0.85rem', lineHeight: 1.6, color: '#CBD5E1' }}>
            {scenario.goal}
          </p>
        </div>
      </aside>
    </div>
  );
}
