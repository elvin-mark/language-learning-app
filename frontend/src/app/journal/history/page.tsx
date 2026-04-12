'use client';

import { useState, useEffect } from 'react';
import {
  History,
  ChevronRight,
  Calendar,
  Search,
  BookOpen,
  ArrowLeft,
  ChevronLeft
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface JournalEntry {
  id: number;
  prompt: string;
  content: string;
  feedback: string;
  created_at: string;
  target_language: string;
}

export default function JournalHistoryPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const res = await api.get('/journal');
      setEntries(res.data);
    } catch (err) {
      console.error('Failed to fetch journal entries:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredEntries = entries.filter(e =>
    e.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  if (loading) {
    return (
      <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
          <History size={48} color="var(--primary)" />
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: isMobile ? '1rem' : '2rem' }}>
      <header style={{ marginBottom: '3rem' }}>
        <Link href="/journal">
          <button style={{ background: 'none', border: 'none', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', marginBottom: '1.5rem', fontWeight: 600 }}>
            <ChevronLeft size={20} /> Back to Journal
          </button>
        </Link>
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: '1.5rem' }}>
          <div>
            <h1 className="gradient-text" style={{ fontSize: isMobile ? '2.5rem' : '3.5rem', fontWeight: 900 }}>Journal History</h1>
            <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem' }}>Review your previous writing sessions and feedback.</p>
          </div>
          <div style={{ position: 'relative', width: isMobile ? '100%' : '300px' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input
              type="text"
              placeholder="Search entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass"
              style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 3rem', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'white' }}
            />
          </div>
        </div>
      </header>

      {filteredEntries.length === 0 ? (
        <div className="glass" style={{ padding: '4rem 2rem', textAlign: 'center', borderRadius: '32px' }}>
          <div style={{ color: 'var(--text-dim)', marginBottom: '1.5rem' }}><BookOpen size={48} style={{ margin: '0 auto' }} /></div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>No entries found</h2>
          <p style={{ color: 'var(--text-dim)', marginTop: '0.5rem' }}>{searchQuery ? "Try a different search term." : "You haven't written any journal entries yet."}</p>
          {!searchQuery && (
            <Link href="/journal">
              <button className="primary-button" style={{ marginTop: '2rem', padding: '1rem 2rem', borderRadius: '16px', fontWeight: 800 }}>Start Writing</button>
            </Link>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {filteredEntries.map((entry, i) => {
            const feedback = JSON.parse(entry.feedback);
            return (
              <Link key={entry.id} href={`/journal?id=${entry.id}`}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-hover"
                  style={{
                    padding: '2rem',
                    borderRadius: '24px',
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    justifyContent: 'space-between',
                    alignItems: isMobile ? 'flex-start' : 'center',
                    gap: '1.5rem',
                    border: '1px solid var(--border)',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.6rem' }}>
                      <Calendar size={16} color="var(--primary)" />
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-dim)', fontWeight: 600 }}>{formatDate(entry.created_at)}</span>
                    </div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem', color: 'white' }}>{entry.prompt}</h3>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.95rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{entry.content}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ textAlign: 'right', display: isMobile ? 'none' : 'block' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Corrections</span>
                      <p style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white' }}>{feedback.corrections?.length || 0}</p>
                    </div>
                    <ChevronRight size={24} color="var(--border)" />
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
