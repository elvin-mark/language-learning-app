'use client';

import { Settings, User, Bell, Shield, Globe, HelpCircle, Brain, Server } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import Dropdown from '@/components/Dropdown';

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
              <Dropdown 
                value={user?.target_language || ''}
                onChange={(val) => updateUser({ target_language: val })}
                options={[
                  { value: 'Korean', label: 'Korean (한국어)' },
                  { value: 'Japanese', label: 'Japanese (日本語)' },
                  { value: 'Chinese', label: 'Chinese (中文)' },
                  { value: 'Spanish', label: 'Spanish (Español)' },
                  { value: 'French', label: 'French (Français)' }
                ]}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600 }}>Target Level</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Adjusts AI difficulty</div>
              </div>
              <Dropdown 
                value="2"
                onChange={() => {}} // Not yet implemented in backend
                options={[
                  { value: '1', label: 'Beginner (1)' },
                  { value: '2', label: 'Intermediate (2)' },
                  { value: '3', label: 'Advanced (3)' }
                ]}
              />
            </div>
          </div>
        </section>

        {/* AI Configuration */}
        <section className="glass" style={{ padding: '2rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '1.2rem', marginBottom: '1.5rem' }}>
            <Brain size={20} color="#8B5CF6" /> AI Configuration
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Type Toggle: Cloud vs Local */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600 }}>Connection Type</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Cloud (Fast) vs Local (Private)</div>
              </div>
              <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '4px' }}>
                <button 
                  onClick={() => updateUser({ llm_type: 'cloud' })}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    border: 'none',
                    cursor: 'pointer',
                    background: user?.llm_type === 'cloud' ? 'var(--primary)' : 'transparent',
                    color: 'white',
                    transition: 'all 0.3s ease'
                  }}
                >
                  Cloud LLM
                </button>
                <button 
                  onClick={() => updateUser({ llm_type: 'local' })}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    border: 'none',
                    cursor: 'pointer',
                    background: user?.llm_type === 'local' ? 'var(--primary)' : 'transparent',
                    color: 'white',
                    transition: 'all 0.3s ease'
                  }}
                >
                  Local LLM
                </button>
              </div>
            </div>

            {/* Cloud Provider Selection - only show if cloud is selected */}
            {user?.llm_type === 'cloud' && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }}
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '1.5rem',
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: '15px',
                  border: '1px solid var(--border)'
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>Cloud Provider</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Select your preferred AI brain</div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button 
                    onClick={() => updateUser({ cloud_provider: 'groq' })}
                    className={user?.cloud_provider === 'groq' ? 'active-provider' : ''}
                    style={{
                      padding: '10px 20px',
                      borderRadius: '10px',
                      border: user?.cloud_provider === 'groq' ? '2px solid var(--primary)' : '1px solid var(--border)',
                      background: user?.cloud_provider === 'groq' ? 'rgba(255, 59, 63, 0.1)' : 'transparent',
                      color: user?.cloud_provider === 'groq' ? 'white' : 'var(--text-dim)',
                      cursor: 'pointer',
                      fontWeight: 600,
                      transition: 'all 0.2s'
                    }}
                  >
                    Groq
                  </button>
                  <button 
                    onClick={() => updateUser({ cloud_provider: 'gemini' })}
                    style={{
                      padding: '10px 20px',
                      borderRadius: '10px',
                      border: user?.cloud_provider === 'gemini' ? '2px solid #4285F4' : '1px solid var(--border)',
                      background: user?.cloud_provider === 'gemini' ? 'rgba(66, 133, 244, 0.1)' : 'transparent',
                      color: user?.cloud_provider === 'gemini' ? 'white' : 'var(--text-dim)',
                      cursor: 'pointer',
                      fontWeight: 600,
                      transition: 'all 0.2s'
                    }}
                  >
                    Gemini
                  </button>
                </div>
              </motion.div>
            )}

            {/* Local LLM URL - only show if local is selected */}
            {user?.llm_type === 'local' && (
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
