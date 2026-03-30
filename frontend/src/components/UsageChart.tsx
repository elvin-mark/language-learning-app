'use client';

import { motion } from 'framer-motion';

interface UsageData {
  date: string;
  tokens: number;
}

interface UsageChartProps {
  data: UsageData[];
}

export default function UsageChart({ data }: UsageChartProps) {
  if (data.length === 0) {
    return (
      <div className="glass" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)' }}>
        No usage data yet. Start chatting to see your token consumption!
      </div>
    );
  }

  const maxTokens = Math.max(...data.map(d => d.tokens), 100);

  return (
    <div className="glass" style={{ padding: '1.2rem' }}>
      <h3 style={{ marginBottom: '1.5rem', fontWeight: 700, fontSize: '1.1rem' }}>Token Consumption</h3>
      
      <div style={{ 
        display: 'flex', 
        alignItems: 'flex-end', 
        height: '180px', 
        gap: '0.3rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid var(--border)',
        minWidth: '300px'
      }}>
        {data.slice(-7).map((day, idx) => {
          const height = (day.tokens / maxTokens) * 100;
          return (
            <div key={day.date} style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
              <motion.div 
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ duration: 0.8, delay: idx * 0.1 }}
                style={{ 
                  width: '100%', 
                  background: 'linear-gradient(to top, var(--primary), #a855f7)', 
                  borderRadius: '4px 4px 0 0',
                  position: 'relative',
                  minWidth: '20px'
                }}
              />
              <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', transform: 'rotate(-45deg)', whiteSpace: 'nowrap', marginTop: '0.5rem' }}>
                {day.date.split('-').slice(1).join('/')}
              </span>
            </div>
          );
        })}
      </div>
      
      <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
        <div style={{ color: 'var(--text-dim)' }}>
          Last 7 days
        </div>
        <div style={{ fontWeight: 600 }}>
          {data.reduce((acc, curr) => acc + curr.tokens, 0).toLocaleString()} Total Tokens
        </div>
      </div>
    </div>
  );
}
