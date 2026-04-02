'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface DropdownProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  minWidth?: string;
}

export default function Dropdown({ 
  options, 
  value, 
  onChange, 
  placeholder = 'Select...', 
  label,
  minWidth = '200px'
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} style={{ position: 'relative', minWidth }}>
      {label && (
        <label style={{ 
          display: 'block', 
          fontSize: '0.75rem', 
          fontWeight: 700, 
          color: 'var(--text-dim)', 
          marginBottom: '0.5rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          {label}
        </label>
      )}
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="glass-hover"
        style={{
          width: '100%',
          padding: '0.8rem 1.2rem',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border)',
          borderRadius: '14px',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          textAlign: 'left',
          fontSize: '0.95rem',
          fontWeight: 600,
          transition: 'all 0.2s ease',
          outline: 'none',
          boxShadow: isOpen ? '0 0 0 2px var(--primary)' : 'none'
        }}
      >
        <span style={{ opacity: selectedOption ? 1 : 0.6 }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={18} style={{ opacity: 0.6 }} />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.ul
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, type: 'spring', damping: 20, stiffness: 300 }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: 0,
              right: 0,
              zIndex: 100,
              background: 'rgba(15, 15, 18, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '6px',
              margin: 0,
              listStyle: 'none',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
              maxHeight: '300px',
              overflowY: 'auto'
            }}
          >
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <li key={option.value}>
                  <button
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '0.8rem 1rem',
                      background: isSelected ? 'rgba(255, 59, 63, 0.1)' : 'transparent',
                      border: 'none',
                      borderRadius: '10px',
                      color: isSelected ? 'var(--primary)' : 'white',
                      fontSize: '0.9rem',
                      fontWeight: isSelected ? 700 : 500,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                      marginBottom: '2px'
                    }}
                    className={!isSelected ? "glass-hover" : ""}
                  >
                    {option.label}
                    {isSelected && <Check size={16} />}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
