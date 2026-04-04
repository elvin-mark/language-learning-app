'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Book, MessageSquare, Info, Star, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import Dropdown from '@/components/Dropdown';

const PAGE_SIZE = 9;

export default function LibraryPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [activeTab, setActiveTab] = useState<'words' | 'grammar'>('words');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<'latest' | 'mastery_asc' | 'mastery_desc'>('latest');
  const [isLoading, setIsLoading] = useState(false);
  
  const targetLanguage = user?.target_language || 'Language';

  // Debouncing search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset to page 1 on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset page on tab change
  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const endpoint = activeTab === 'words' ? '/vocabulary' : '/grammar';
        const response = await api.get(endpoint, {
          params: {
            page,
            size: PAGE_SIZE,
            search: debouncedSearch || undefined,
            sort_by: sortOrder
          }
        });
        setItems(response.data.items);
        setTotalItems(response.data.total);
      } catch (err) {
        console.error('Failed to fetch library data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [page, debouncedSearch, activeTab, sortOrder]);

  const totalPages = Math.ceil(totalItems / PAGE_SIZE);

  return (
    <div className="dashboard-container">
      <header style={{ marginBottom: '3rem' }}>
        <h1 className="gradient-text" style={{ fontSize: '2.5rem' }}>{targetLanguage} Library</h1>
        <p style={{ color: 'var(--text-dim)', marginTop: '0.5rem' }}>
          Everything you've encountered in your {targetLanguage} conversations.
        </p>
      </header>

      <div style={{ display: 'flex', gap: '1rem', width: '100%', marginBottom: '2rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={20} style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input 
              type="text" 
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass"
              style={{
                width: '100%',
                padding: '1rem 1rem 1rem 3.2rem',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '15px',
                color: 'white',
                outline: 'none',
                fontSize: '1rem',
                border: '1px solid var(--border)'
              }}
            />
          </div>
          <Dropdown 
            value={sortOrder}
            onChange={(val) => setSortOrder(val as any)}
            options={[
              { value: 'latest', label: 'Latest' },
              { value: 'mastery_asc', label: 'Lowest Mastery' },
              { value: 'mastery_desc', label: 'Highest Mastery' }
            ]}
          />
        </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)' }}>
        {['words', 'grammar'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            style={{
              padding: '1rem 0.5rem',
              background: 'none',
              border: 'none',
              color: activeTab === tab ? 'var(--primary)' : 'var(--text-dim)',
              fontWeight: 600,
              cursor: 'pointer',
              borderBottom: activeTab === tab ? '2px solid var(--primary)' : 'none',
              textTransform: 'capitalize',
              transition: 'all 0.2s'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-dim)' }}>Loading...</div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-dim)' }}>No items found.</div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
          gap: '1.5rem',
          minHeight: '400px'
        }}>
          {items.map((item: any) => (
            <LibraryItem 
              key={item.id} 
              title={activeTab === 'words' ? item.text : item.pattern} 
              subtitle={activeTab === 'words' ? item.meaning : item.explanation} 
              extra={activeTab === 'words' ? item.pronunciation : item.example} 
              level={item.mastery_level}
              icon={activeTab === 'words' ? <Book size={20} /> : <Star size={20} />} 
              isGrammar={activeTab === 'grammar'}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ 
          marginTop: '3rem', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          gap: '1.5rem' 
        }}>
          <button 
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="glass-hover"
            style={{ 
              padding: '0.8rem', 
              borderRadius: '50%', 
              background: page === 1 ? 'transparent' : 'rgba(255,255,255,0.05)',
              opacity: page === 1 ? 0.3 : 1,
              cursor: page === 1 ? 'default' : 'pointer'
            }}
          >
            <ChevronLeft size={20} />
          </button>
          
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
            Page {page} of {totalPages}
          </span>

          <button 
            disabled={page === totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            className="glass-hover"
            style={{ 
              padding: '0.8rem', 
              borderRadius: '50%', 
              background: page === totalPages ? 'transparent' : 'rgba(255,255,255,0.05)',
              opacity: page === totalPages ? 0.3 : 1,
              cursor: page === totalPages ? 'default' : 'pointer'
            }}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}

function LibraryItem({ title, subtitle, extra, level, icon, isGrammar }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass glass-hover" 
      style={{ padding: '1.5rem' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ 
          background: isGrammar ? 'rgba(254, 178, 54, 0.1)' : 'rgba(255, 59, 63, 0.1)', 
          padding: '10px', 
          borderRadius: '12px',
          color: isGrammar ? 'var(--accent)' : 'var(--primary)'
        }}>
          {icon}
        </div>
        {level !== undefined && (
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dim)' }}>
            Mastery: {level}%
          </div>
        )}
      </div>
      
      <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>{title}</h3>
      <p style={{ color: '#E2E8F0', marginBottom: '1rem' }}>{subtitle}</p>
      
      {extra && (
        <div style={{ 
          fontSize: '0.85rem', 
          background: 'rgba(255,255,255,0.03)', 
          padding: '0.8rem', 
          borderRadius: '8px', 
          color: 'var(--text-dim)',
          fontStyle: 'italic'
        }}>
          {extra}
        </div>
      )}
    </motion.div>
  );
}
