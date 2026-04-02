'use client';

import { 
  MessageCircle, 
  Target, 
  Sparkles, 
  ChevronRight, 
  BookOpen, 
  CheckCircle2,
  Trophy,
  Clock,
  MessageSquare,
  ArrowRight,
  Trash2,
  Pencil,
  Check,
  X
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import api from '@/lib/api';

import { useState, useEffect } from 'react';

export default function ChatHubPage() {
  const [isMobile, setIsMobile] = useState(false);
  const [recentConversations, setRecentConversations] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    const fetchHistory = async () => {
      try {
        const response = await api.get('/conversations');
        setRecentConversations(response.data.slice(0, 4));
      } catch (err) {
        console.error('Failed to fetch history:', err);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchHistory();
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleDeleteConversation = async (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this chat?')) return;

    try {
      await api.delete(`/conversations/${id}`);
      setRecentConversations(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('Failed to delete conversation:', err);
      alert('Failed to delete conversation. Please try again.');
    }
  };
  
  const handleEditClick = (e: React.MouseEvent, id: number, currentTitle: string) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingId(id);
    setEditTitle(currentTitle);
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingId(null);
  };

  const handleSaveTitle = async (e: React.MouseEvent | React.KeyboardEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!editTitle.trim()) return;

    try {
      await api.patch(`/conversations/${id}`, null, {
        params: { title: editTitle }
      });
      setRecentConversations(prev => prev.map(c => c.id === id ? { ...c, title: editTitle } : c));
      setEditingId(null);
    } catch (err) {
      console.error('Failed to update title:', err);
    }
  };

  return (
    <div style={{ 
      maxWidth: '1000px', 
      margin: '0 auto', 
      padding: isMobile ? '1rem' : '2rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: isMobile ? '2rem' : '3rem'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 className="gradient-text" style={{ 
          fontSize: isMobile ? '2.2rem' : '3rem', 
          fontWeight: 900, 
          marginBottom: '0.8rem',
          lineHeight: 1.1
        }}>
          Language Lab
        </h1>
        <p style={{ 
          color: 'var(--subtitle)', 
          fontSize: isMobile ? '1rem' : '1.2rem', 
          maxWidth: '600px',
          padding: '0 1rem'
        }}>
          Choose your practice style. Free conversation or goal-oriented missions?
        </p>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(350px, 1fr))', 
        gap: '1.5rem',
        width: '100%'
      }}>
        {/* Card 1: Standard Chat */}
        <Link href="/chat/standard" style={{ textDecoration: 'none', color: 'inherit' }}>
          <motion.div
            whileHover={isMobile ? {} : { y: -8, scale: 1.02 }}
            className="glass"
            style={{ 
              padding: isMobile ? '1.5rem' : '2.5rem', 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.2rem',
              border: '1px solid var(--border)',
              background: 'linear-gradient(135deg, rgba(255, 59, 63, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ 
              width: '50px', 
              height: '50px', 
              borderRadius: '16px', 
              background: 'var(--primary)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(255, 59, 63, 0.3)'
            }}>
              <MessageCircle size={28} color="white" />
            </div>
            
            <div>
              <h2 style={{ fontSize: isMobile ? '1.5rem' : '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>Free Conversation</h2>
              <p style={{ color: 'var(--subtitle)', lineHeight: 1.5, fontSize: isMobile ? '0.95rem' : '1rem' }}>
                Chat about anything. Get real-time grammar corrections as you speak.
              </p>
            </div>

            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                <CheckCircle2 size={14} color="#22c55e" /> Real-time grammar feedback
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                <BookOpen size={14} color="var(--accent)" /> Smart vocab suggestions
              </li>
            </ul>

            <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, color: 'var(--primary)', fontSize: '0.95rem' }}>
              Start Chatting <ChevronRight size={16} />
            </div>
          </motion.div>
        </Link>

        {/* Card 2: Roleplay Missions */}
        <Link href="/chat/missions" style={{ textDecoration: 'none', color: 'inherit' }}>
          <motion.div
            whileHover={isMobile ? {} : { y: -8, scale: 1.02 }}
            className="glass"
            style={{ 
              padding: isMobile ? '1.5rem' : '2.5rem', 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.2rem',
              border: '1px solid var(--border)',
              background: 'linear-gradient(135deg, rgba(107, 91, 149, 0.1) 0%, rgba(255, 255, 255, 0.02) 100%)',
              cursor: 'pointer'
            }}
          >
            <div style={{ 
              width: '50px', 
              height: '50px', 
              borderRadius: '16px', 
              background: '#6B5B95', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(107, 91, 149, 0.3)'
            }}>
              <Target size={28} color="white" />
            </div>
            
            <div>
              <h2 style={{ fontSize: isMobile ? '1.5rem' : '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>Guided Missions</h2>
              <p style={{ color: 'var(--subtitle)', lineHeight: 1.5, fontSize: isMobile ? '0.95rem' : '1rem' }}>
                Enter realistic scenarios with specific goals. Complete objectives to succeed.
              </p>
            </div>

            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                <Trophy size={14} color="var(--accent)" /> Objective-based progression
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                <Sparkles size={14} color="#FCD34D" /> Task completion rewards
              </li>
            </ul>

            <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, color: '#6B5B95', fontSize: '0.95rem' }}>
              View Missions <ChevronRight size={16} />
            </div>
          </motion.div>
        </Link>
      </div>

      {/* Recent History Section */}
      {!isLoadingHistory && recentConversations.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ width: '100%', marginTop: '1rem' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.2rem', padding: '0 0.5rem' }}>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--primary)' }}>
              <Clock size={20} />
            </div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Continue Your Progress</h2>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(220px, 1fr))', 
            gap: '1rem' 
          }}>
            {recentConversations.map((conv) => (
              <Link 
                key={conv.id} 
                href={conv.scenario_id ? `/chat/roleplay/${conv.scenario_id}?id=${conv.id}` : `/chat/standard?id=${conv.id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <motion.div
                  whileHover={{ scale: 1.02, background: 'rgba(255,255,255,0.05)' }}
                  className="glass"
                  style={{
                    padding: '1.2rem',
                    borderRadius: '20px',
                    border: '1px solid var(--border)',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ padding: '6px', borderRadius: '8px', background: conv.scenario_id ? 'rgba(107, 91, 149, 0.1)' : 'rgba(255, 59, 63, 0.1)', color: conv.scenario_id ? '#6B5B95' : 'var(--primary)' }}>
                      {conv.scenario_id ? <Target size={14} /> : <MessageSquare size={14} />}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 600 }}>
                        {new Date(conv.last_active).toLocaleDateString()}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <button
                          onClick={(e) => handleEditClick(e, conv.id, conv.title)}
                          className="glass-hover"
                          title="Rename Chat"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-dim)',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            borderRadius: '6px'
                          }}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={(e) => handleDeleteConversation(e, conv.id)}
                          className="glass-hover"
                          title="Delete Chat"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-dim)',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            borderRadius: '6px'
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {editingId === conv.id ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                      <input 
                        autoFocus
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' ? handleSaveTitle(e, conv.id) : e.key === 'Escape' && handleCancelEdit(e as any)}
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        style={{
                          flex: 1,
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid var(--primary)',
                          borderRadius: '8px',
                          padding: '0.4rem 0.8rem',
                          color: 'white',
                          fontSize: '0.9rem',
                          outline: 'none'
                        }}
                      />
                      <button 
                        onClick={(e) => handleSaveTitle(e, conv.id)}
                        style={{ background: 'var(--primary)', border: 'none', borderRadius: '8px', padding: '0.4rem', color: 'white', cursor: 'pointer', display: 'flex' }}
                      >
                        <Check size={14} />
                      </button>
                      <button 
                        onClick={handleCancelEdit}
                        style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', padding: '0.4rem', color: 'white', cursor: 'pointer', display: 'flex' }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'white' }}>{conv.title}</h3>
                  )}
                  
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
                    Resume session <ArrowRight size={12} />
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      <div style={{ 
        background: 'rgba(255,255,255,0.02)', 
        padding: isMobile ? '1.5rem' : '1.5rem 3rem', 
        borderRadius: isMobile ? '24px' : '40px', 
        border: '1px solid var(--border)', 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? '1.5rem' : '3rem',
        width: isMobile ? '100%' : 'auto',
        alignItems: 'center'
      }}>
         <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: isMobile ? '1.2rem' : '1.5rem', fontWeight: 800 }}>AI Core</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>POWERED BY GROQ</div>
         </div>
         { !isMobile && <div style={{ borderLeft: '1px solid var(--border)', height: '40px' }}></div> }
         <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: isMobile ? '1.2rem' : '1.5rem', fontWeight: 800 }}>10+ Scenarios</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>REAL-WORLD TOPICS</div>
         </div>
      </div>
    </div>
  );
}
