'use client';

import { motion } from 'framer-motion';

interface UsageData {
  date: string;
  tokens: number;
  requests: number;
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

  const chartData = data.slice(-7);
  const maxTokens = Math.max(...chartData.map(d => d.tokens), 100);
  const maxRequests = Math.max(...chartData.map(d => d.requests), 5);

  return (
    <div className="glass" style={{ padding: '1.2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem' }}>Usage History</h3>
        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <div style={{ width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '2px' }} />
            <span style={{ color: 'var(--text-dim)' }}>Tokens</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <div style={{ width: '12px', height: '2px', background: '#0ea5e9' }} />
            <span style={{ color: 'var(--text-dim)' }}>Requests</span>
          </div>
        </div>
      </div>

      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-end',
        height: '180px',
        gap: '0.5rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid var(--border)',
        minWidth: '300px'
      }}>
        {/* Bars for Token Usage */}
        {chartData.map((day, idx) => {
          const height = (day.tokens / maxTokens) * 100;
          return (
            <div key={day.date} style={{
              flex: 1,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '0.4rem',
              zIndex: 1
            }}>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ duration: 0.8, delay: idx * 0.1 }}
                style={{
                  width: '100%',
                  background: 'linear-gradient(to top, var(--primary), #a855f7)',
                  borderRadius: '4px 4px 0 0',
                  opacity: 0.8,
                  minWidth: '20px',
                  maxWidth: '60px'
                }}
              />
              <span style={{
                position: 'absolute',
                bottom: '-25px',
                fontSize: '0.65rem',
                color: 'var(--text-dim)',
                transform: 'rotate(-45deg)',
                whiteSpace: 'nowrap'
              }}>
                {day.date.split('-').slice(1).join('/')}
              </span>
            </div>
          );
        })}

        {/* SVG Overlay for Request Count Line Chart */}
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: 'calc(100% - 1rem)',
            pointerEvents: 'none',
            zIndex: 2
          }}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <polyline
            fill="none"
            stroke="#0ea5e9"
            strokeWidth="1.5"
            strokeOpacity="0.8"
            style={{
              vectorEffect: 'non-scaling-stroke',
              strokeDasharray: 'none'
            }}
            strokeLinecap="round"
            strokeLinejoin="round"
            points={chartData.map((day, i) => {
              const centeredX = ((i + 0.5) / chartData.length) * 100;
              const y = 100 - (day.requests / maxRequests) * 100;
              return `${centeredX},${y}`;
            }).join(' ')}
          />
        </svg>

        {/* Perfectly circular dots using absolutely positioned divs */}
        {chartData.map((day, i) => {
          const left = ((i + 0.5) / chartData.length) * 100;
          const ratio = day.requests / maxRequests;
          return (
            <motion.div
              key={`dot-${i}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1 + i * 0.1 }}
              style={{
                position: 'absolute',
                left: `${left}%`,
                top: `calc((1 - ${ratio}) * (100% - 1rem))`,
                width: '6px',
                height: '6px',
                background: '#0ea5e9',
                borderRadius: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 3,
                boxShadow: '0 0 8px rgba(14, 165, 233, 0.6)'
              }}
            />
          );
        })}
      </div>

      <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
        <div style={{ color: 'var(--text-dim)' }}>
          Last {chartData.length} days usage activity
        </div>
        <div style={{ fontWeight: 600, display: 'flex', gap: '1.5rem' }}>
          <span>{chartData.reduce((acc, curr) => acc + curr.tokens, 0).toLocaleString()} Total Tokens</span>
          <span>{chartData.reduce((acc, curr) => acc + curr.requests, 0).toLocaleString()} Total Requests</span>
        </div>
      </div>
    </div>
  );
}
