'use client';

import { Settings, User, Bell, Shield, Globe, HelpCircle, Brain, Server } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ marginBottom: '3rem' }}>
        <h1 className="gradient-text">Settings</h1>
        <p style={{ color: 'var(--text-dim)', marginTop: '0.5rem' }}>
          Manage your account and app preferences.
        </p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Profile Section */}
        <section className="glass" style={{ padding: '2rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '1.2rem' }}>
            <User size={20} color="var(--primary)" /> Profile Information
          </h2>
          <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '50%', 
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              fontWeight: 800,
              color: 'white'
            }}>
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.2rem' }}>{user?.username}</div>
              <div style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Account type: Language Learner</div>
            </div>
          </div>
        </section>

        {/* Preferences Section */}
        <section className="glass" style={{ padding: '2rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '1.2rem', marginBottom: '1.5rem' }}>
            <Globe size={20} color="var(--accent)" /> Learning Preferences
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600 }}>Target Language</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Currently learning</div>
              </div>
              <select 
                value={user?.target_language}
                onChange={(e) => updateUser({ target_language: e.target.value })}
                style={{ 
                  background: 'rgba(255,255,255,0.05)', 
                  border: '1px solid var(--border)', 
                  color: 'white', 
                  padding: '0.5rem 1rem', 
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                <option value="Korean" style={{ backgroundColor: '#1a1a1a' }}>Korean (한국어)</option>
                <option value="Japanese" style={{ backgroundColor: '#1a1a1a' }}>Japanese (日本語)</option>
                <option value="Chinese" style={{ backgroundColor: '#1a1a1a' }}>Chinese (中文)</option>
                <option value="Spanish" style={{ backgroundColor: '#1a1a1a' }}>Spanish (Español)</option>
                <option value="French" style={{ backgroundColor: '#1a1a1a' }}>French (Français)</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600 }}>Target Level</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Adjusts AI difficulty</div>
              </div>
              <select 
                defaultValue="2"
                style={{ 
                  background: 'rgba(255,255,255,0.05)', 
                  border: '1px solid var(--border)', 
                  color: 'white', 
                  padding: '0.5rem 1rem', 
                  borderRadius: '8px' 
                }}
              >
                <option value="1">Beginner (1)</option>
                <option value="2">Intermediate (2)</option>
                <option value="3">Advanced (3)</option>
              </select>
            </div>
          </div>
        </section>

        {/* AI Configuration */}
        <section className="glass" style={{ padding: '2rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '1.2rem', marginBottom: '1.5rem' }}>
            <Brain size={20} color="#8B5CF6" /> AI Configuration
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Provider Toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600 }}>AI Provider</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Select your preferred brain</div>
              </div>
              <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '4px' }}>
                <button 
                  onClick={() => updateUser({ llm_provider: 'groq' })}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    border: 'none',
                    cursor: 'pointer',
                    background: user?.llm_provider === 'groq' ? 'var(--primary)' : 'transparent',
                    color: 'white',
                    transition: 'all 0.3s ease'
                  }}
                >
                  Groq (Cloud)
                </button>
                <button 
                  onClick={() => updateUser({ llm_provider: 'local' })}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    border: 'none',
                    cursor: 'pointer',
                    background: user?.llm_provider === 'local' ? 'var(--primary)' : 'transparent',
                    color: 'white',
                    transition: 'all 0.3s ease'
                  }}
                >
                  Local LLM
                </button>
              </div>
            </div>

            {/* Local LLM URL - only show if local is selected */}
            {user?.llm_provider === 'local' && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '0.8rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid var(--border)',
                  overflow: 'hidden'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.95rem' }}>
                  <Server size={16} color="var(--accent)" /> Local API Endpoint
                </div>
                <div style={{ display: 'flex', gap: '0.8rem' }}>
                  <input 
                    type="text" 
                    defaultValue={user?.local_llm_url}
                    onBlur={(e) => updateUser({ local_llm_url: e.target.value })}
                    placeholder="http://localhost:1234/v1"
                    style={{
                      flex: 1,
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      padding: '0.8rem 1rem',
                      color: 'white',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                  Must be an OpenAI-compatible endpoint (e.g., Llama.cpp, Ollama, LM Studio).
                </p>
              </motion.div>
            )}
          </div>
        </section>

        {/* Support Section */}
        <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <motion.div whileHover={{ y: -2 }} className="glass" style={{ padding: '1.5rem', cursor: 'pointer' }}>
             <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', marginBottom: '0.5rem' }}>
               <Shield size={18} color="#22c55e" /> Privacy & Security
             </h3>
             <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Manage your data and security settings.</p>
          </motion.div>
          <motion.div whileHover={{ y: -2 }} className="glass" style={{ padding: '1.5rem', cursor: 'pointer' }}>
             <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', marginBottom: '0.5rem' }}>
               <HelpCircle size={18} color="#3b82f6" /> Help & Support
             </h3>
             <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Need help with Linguis? Contact support.</p>
          </motion.div>
        </section>
      </div>
    </div>
  );
}
