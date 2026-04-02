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

import { useState, useEffect } from 'react';

export default function ChatHubPage() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
