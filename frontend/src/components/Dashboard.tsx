"use client";

import React, { useState, useEffect } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from "recharts";
import { 
  Flame, BookOpen, Brain, CheckCircle, ArrowRight, 
  Calendar, TrendingUp, Zap, Clock
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import api from "@/lib/api";

interface DashboardProps {
  user: any;
}

export default function Dashboard({ user }: DashboardProps) {
  const [stats, setStats] = useState<any>(null);
  const [distribution, setDistribution] = useState<any>(null);
  const [activity, setActivity] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [reviewStats, setReviewStats] = useState<any>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { "Authorization": `Bearer ${token}` };

        const [statsRes, distRes, activityRes, reviewRes] = await Promise.all([
          api.get("/stats", { headers }),
          api.get("/analytics/mastery-distribution", { headers }),
          api.get("/usage", { headers }),
          api.get("/practice/stats", { headers })
        ]);

        setStats(statsRes.data);
        setReviewStats(reviewRes.data);
        
        const distData = distRes.data;
        if (distData.labels) {
          setDistribution(distData.labels.map((label: string, i: number) => ({
            name: label,
            value: distData.values[i]
          })));
        }

        setActivity(activityRes.data);
        setLoading(false);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <div className="items-center justify-center" style={{ height: '384px' }}>
    <motion.div 
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      style={{ width: '32px', height: '32px', borderTop: '2px solid var(--primary)', borderRadius: '50%' }}
    />
  </div>;

  return (
    <div className="flex-col gap-8 page-fade-in">
      {/* Header */}
      <div className="flex-between gap-4">
        <div>
          <h1 className="gradient-text" style={{ fontSize: '2.5rem' }}>Welcome back, {user?.username}</h1>
          <p className="text-text-dim mt-1">Ready to master more {user?.target_language} today?</p>
        </div>
        <div className="items-center gap-3">
          <div className="glass" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderColor: 'rgba(249, 115, 22, 0.2)', backgroundColor: 'rgba(249, 115, 22, 0.05)' }}>
            <Flame className="text-accent" style={{ width: '20px', height: '20px', color: '#f97316' }} />
            <span style={{ fontWeight: 'bold', color: '#f97316', fontSize: '1.125rem' }}>{stats?.daily_streak || 0} Day Streak</span>
          </div>
        </div>
      </div>

      {/* Grid of Stats */}
      <div className="grid-stats">
        <StatCard 
          icon={<BookOpen style={{ color: '#60a5fa' }} />}
          label="Vocab Learned"
          value={stats?.words_learned || 0}
          subValue="+12 this week"
          color="blue"
        />
        <StatCard 
          icon={<Brain style={{ color: '#c084fc' }} />}
          label="Grammar Points"
          value={stats?.grammar_practiced || 0}
          subValue="4 near mastery"
          color="purple"
        />
        <StatCard 
          icon={<Zap style={{ color: '#facc15' }} />}
          label="Reviews Due"
          value={reviewStats?.due_total || 0}
          subValue={reviewStats?.due_words ? `${reviewStats.due_words} words, ${reviewStats.due_grammar} grammar` : "All caught up!"}
          color="yellow"
          highlight={reviewStats?.due_total > 0}
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid-charts">
        {/* Mastery Distribution */}
        <div className="glass-card">
          <div className="flex-between mb-6">
            <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp style={{ width: '20px', height: '20px', color: 'var(--primary)' }} />
              Mastery Progress
            </h3>
          </div>
          <div style={{ height: '250px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distribution}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} />
                <YAxis hide />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  contentStyle={{background: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px'}}
                />
                <Bar dataKey="value" fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={1} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Over Time */}
        <div className="glass-card">
          <div className="flex-between mb-6">
            <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar style={{ width: '20px', height: '20px', color: 'var(--secondary)' }} />
              Activity History
            </h3>
          </div>
          <div style={{ height: '250px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activity}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" hide />
                <Tooltip 
                   contentStyle={{background: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px'}}
                />
                <Area type="monotone" dataKey="requests" stroke="var(--secondary)" fillOpacity={1} fill="url(#areaGradient)" />
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--secondary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--secondary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid-stats mt-8">
        <QuickActionLink 
          href="/chat"
          title="Start Chatting"
          desc="Practice naturally with AI"
          icon={<Zap style={{ width: '24px', height: '24px' }} />}
          color="primary"
        />
        <QuickActionLink 
          href="/practice"
          title="Flashcards"
          desc={`${reviewStats?.due_total || 0} reviews waiting`}
          icon={<Brain style={{ width: '24px', height: '24px' }} />}
          color="secondary"
          badge={reviewStats?.due_total > 0}
        />
        <QuickActionLink 
          href="/reading"
          title="Reading Room"
          desc="Generate new passages"
          icon={<BookOpen style={{ width: '24px', height: '24px' }} />}
          color="accent"
        />
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, subValue, color, highlight = false }: any) {
  return (
    <div className={`glass-card relative overflow-hidden group ${highlight ? 'glow-primary' : ''}`} style={{ position: 'relative' }}>
      <div className="flex-col gap-2" style={{ position: 'relative', zIndex: 10 }}>
        <div className="items-center gap-3">
          <div className="p-2" style={{ borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.05)' }}>
            {icon}
          </div>
          <span style={{ color: 'var(--text-dim)', fontWeight: 500 }}>{label}</span>
        </div>
        <div className="items-center gap-2" style={{ alignItems: 'baseline' }}>
          <span style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>{value}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{subValue}</span>
        </div>
      </div>
      <div style={{ 
        position: 'absolute', 
        right: '-1rem', 
        bottom: '-1rem', 
        width: '6rem', 
        height: '6rem', 
        borderRadius: '50%', 
        opacity: 0.05, 
        backgroundColor: `var(--${color})`, 
        filter: 'blur(32px)' 
      }} />
    </div>
  );
}

function QuickActionLink({ href, title, desc, icon, color, badge }: any) {
  const colorMap: any = {
    primary: 'var(--primary)',
    secondary: 'var(--secondary)',
    accent: 'var(--accent)'
  };
  
  return (
    <Link href={href} style={{ flex: 1, textDecoration: 'none', color: 'inherit' }}>
      <div className="glass-card flex-between gap-4" style={{ height: '100%' }}>
        <div className="items-center gap-4">
          <div className="p-3" style={{ 
            borderRadius: '16px', 
            backgroundColor: `rgba(255,255,255,0.05)`,
            color: colorMap[color]
          }}>
            {icon}
          </div>
          <div>
            <h4 style={{ fontWeight: 'bold', margin: 0 }}>{title}</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', margin: 0 }}>{desc}</p>
          </div>
        </div>
        {badge ? (
           <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary)' }} className="glow-primary" />
        ) : (
          <ArrowRight style={{ width: '16px', height: '16px', color: 'var(--text-dim)' }} />
        )}
      </div>
    </Link>
  );
}
