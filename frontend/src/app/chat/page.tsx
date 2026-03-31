'use client';

import { 
  MessageCircle, 
  Target, 
  Sparkles, 
  ChevronRight, 
  BookOpen, 
  CheckCircle2,
  Trophy
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function ChatHubPage() {
  return (
    <div style={{ 
      maxWidth: '1000px', 
      margin: '0 auto', 
      padding: '2rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '3rem'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 className="gradient-text" style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '1rem' }}>
          Language Lab
        </h1>
        <p style={{ color: 'var(--subtitle)', fontSize: '1.2rem', maxWidth: '600px' }}>
          Choose your practice style. Free conversation or goal-oriented missions?
        </p>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
        gap: '2rem',
        width: '100%'
      }}>
        {/* Card 1: Standard Chat */}
        <Link href="/chat/standard" style={{ textDecoration: 'none', color: 'inherit' }}>
          <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            className="glass"
            style={{ 
              padding: '2.5rem', 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              border: '1px solid var(--border)',
              background: 'linear-gradient(135deg, rgba(255, 59, 63, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ 
              width: '60px', 
              height: '60px', 
              borderRadius: '20px', 
              background: 'var(--primary)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(255, 59, 63, 0.3)'
            }}>
              <MessageCircle size={32} color="white" />
            </div>
            
            <div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.8rem' }}>Free Conversation</h2>
              <p style={{ color: 'var(--subtitle)', lineHeight: 1.6 }}>
                Chat about anything. Get real-time grammar corrections and vocabulary suggestions as you speak.
              </p>
            </div>

            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.9rem', color: 'var(--text-dim)' }}>
                <CheckCircle2 size={16} color="#22c55e" /> Real-time grammar feedback
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.9rem', color: 'var(--text-dim)' }}>
                <BookOpen size={16} color="var(--accent)" /> Smart vocab suggestions
              </li>
            </ul>

            <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--primary)' }}>
              Start Chatting <ChevronRight size={18} />
            </div>
          </motion.div>
        </Link>

        {/* Card 2: Roleplay Missions */}
        <Link href="/chat/missions" style={{ textDecoration: 'none', color: 'inherit' }}>
          <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            className="glass"
            style={{ 
              padding: '2.5rem', 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              border: '1px solid var(--border)',
              background: 'linear-gradient(135deg, rgba(107, 91, 149, 0.1) 0%, rgba(255, 255, 255, 0.02) 100%)',
              cursor: 'pointer'
            }}
          >
            <div style={{ 
              width: '60px', 
              height: '60px', 
              borderRadius: '20px', 
              background: '#6B5B95', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(107, 91, 149, 0.3)'
            }}>
              <Target size={32} color="white" />
            </div>
            
            <div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.8rem' }}>Guided Missions</h2>
              <p style={{ color: 'var(--subtitle)', lineHeight: 1.6 }}>
                Enter realistic scenarios with specific goals. Complete objectives to succeed in your mission.
              </p>
            </div>

            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.9rem', color: 'var(--text-dim)' }}>
                <Trophy size={16} color="var(--accent)" /> Objective-based progression
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.9rem', color: 'var(--text-dim)' }}>
                <Sparkles size={16} color="#FCD34D" /> Task completion rewards
              </li>
            </ul>

            <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#6B5B95' }}>
              View Missions <ChevronRight size={18} />
            </div>
          </motion.div>
        </Link>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem 3rem', borderRadius: '40px', border: '1px solid var(--border)', display: 'flex', gap: '3rem' }}>
         <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>AI Core</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>POWERED BY GROQ</div>
         </div>
         <div style={{ borderLeft: '1px solid var(--border)' }}></div>
         <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>10+ Scenarios</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>REAL-WORLD TOPICS</div>
         </div>
      </div>
    </div>
  );
}
