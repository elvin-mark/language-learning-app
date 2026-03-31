'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Suggestion {
  suggestion: string;
  translation: string;
}

interface SuggestionsCarouselProps {
  suggestions: Suggestion[];
  onSelect: (suggestion: string) => void;
}

export default function SuggestionsCarousel({ suggestions, onSelect }: SuggestionsCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    // Initial check and setup listeners
    const timeout = setTimeout(checkScroll, 100);
    window.addEventListener('resize', checkScroll);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', checkScroll);
    };
  }, [suggestions]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.7;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div style={{ position: 'relative', marginBottom: '1.2rem', width: '100%' }}>
      {/* Scrollable Container */}
      <div 
        ref={scrollRef}
        onScroll={checkScroll}
        style={{ 
          display: 'flex', 
          gap: '0.8rem', 
          overflowX: 'auto', 
          padding: '0.5rem 0 1rem 0',
          scrollbarWidth: 'none', 
          msOverflowStyle: 'none',
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        
        {suggestions.map((s, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => onSelect(s.suggestion)}
            className="glass-hover"
            style={{
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              padding: '0.8rem 1.2rem',
              borderRadius: '16px',
              border: '1px solid var(--border)',
              background: 'rgba(255,255,255,0.03)',
              color: 'white',
              cursor: 'pointer',
              gap: '0.2rem',
              minWidth: '180px',
              maxWidth: '300px',
              textAlign: 'left',
              transition: 'all 0.2s ease'
            }}
          >
            <span style={{ fontWeight: 600, fontSize: '0.95rem', whiteSpace: 'normal', lineBreak: 'anywhere' }}>{s.suggestion}</span>
            <span style={{ fontSize: '0.75rem', opacity: 0.6, whiteSpace: 'normal' }}>{s.translation}</span>
          </motion.button>
        ))}
      </div>

      {/* Navigation Arrows */}
      <AnimatePresence>
        {showLeftArrow && (
          <motion.button
            key="left-arrow"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => scroll('left')}
            style={{
              position: 'absolute',
              left: '-1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(15, 15, 18, 0.9)',
              backdropFilter: 'blur(8px)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              zIndex: 20,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
            }}
          >
            <ChevronLeft size={20} />
          </motion.button>
        )}
        {showRightArrow && (
          <motion.button
            key="right-arrow"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => scroll('right')}
            style={{
              position: 'absolute',
              right: '-1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(15, 15, 18, 0.9)',
              backdropFilter: 'blur(8px)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              zIndex: 20,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
            }}
          >
            <ChevronRight size={20} />
          </motion.button>
        )}
      </AnimatePresence>
      
      {/* Edge Fades */}
      <div style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        width: '40px',
        background: 'linear-gradient(to right, var(--background), transparent)',
        pointerEvents: 'none',
        opacity: showLeftArrow ? 1 : 0,
        transition: 'opacity 0.3s ease',
        zIndex: 15
      }} />
      <div style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: 0,
        width: '40px',
        background: 'linear-gradient(to left, var(--background), transparent)',
        pointerEvents: 'none',
        opacity: showRightArrow ? 1 : 0,
        transition: 'opacity 0.3s ease',
        zIndex: 15
      }} />
    </div>
  );
}
