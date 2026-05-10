/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings as SettingsIcon, Sparkles, BarChart3, Lock, ChevronRight, Mail, Star, ExternalLink, Waves, Clock } from 'lucide-react';
import { VibeCheck } from './components/VibeCheck';
import { IdeaSelection } from './components/IdeaSelection';
import { ScriptSuite } from './components/ScriptSuite';
import { Settings } from './components/Settings';
import { History } from './components/History';
import { AdminDashboard } from './components/AdminDashboard';
import { ContentIdea } from './lib/gemini';

type Step = 'vibe-check' | 'ideas' | 'scripts' | 'history' | 'admin';

export default function App() {
  const [step, setStep] = useState<Step>('vibe-check');
  const [showHero, setShowHero] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [inputs, setInputs] = useState({ niche: '', audience: '', onCamera: '', contentFormat: '', goal: '' });
  const [logoClicks, setLogoClicks] = useState(0);
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<ContentIdea | null>(null);
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [userApiKey, setUserApiKey] = useState(localStorage.getItem('gemini_api_key') || '');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [previewHistoryItem, setPreviewHistoryItem] = useState<any>(null);

  const handleStart = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setShowHero(false);
      setIsTransitioning(false);
    }, 400);
  };

  const handleVibeComplete = (vibeInputs: typeof inputs, generatedIdeas: ContentIdea[]) => {
    setInputs(vibeInputs);
    setIdeas(generatedIdeas);
    setStep('ideas');
  };

  const handleIdeaSelect = (idea: ContentIdea) => {
    setSelectedIdea(idea);
    setStep('scripts');
  };

  const handleViewHistoryItem = (item: any) => {
    setInputs({ ...item.inputs, email: item.email });
    setSelectedIdea(item.idea);
    setPreviewHistoryItem(item);
    setStep('scripts');
    setShowHero(false);
  };

  return (
    <div className="min-h-screen bg-natural-bg text-natural-ink font-sans selection:bg-natural-olive/20">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 px-10 py-4 flex justify-between items-center bg-transparent border-b border-stone-200/50 backdrop-blur-md">
        <div 
          className="flex items-center gap-3 cursor-pointer group" 
          onClick={() => {
            if (logoClicks >= 4) {
              setStep('admin');
              setLogoClicks(0);
              setShowHero(false);
            } else {
              setLogoClicks(prev => prev + 1);
              setTimeout(() => setLogoClicks(0), 2000);
              setStep('vibe-check');
              setShowHero(true);
            }
          }}
        >
          <div className="w-8 h-8 bg-natural-olive rounded-full flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg shadow-natural-olive/20">
            <Waves className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-light tracking-widest uppercase">Vibe Script</span>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              setStep('history');
              setShowHero(false);
            }}
            className={`p-2 rounded-full transition-all ${step === 'history' ? 'bg-natural-olive/10 text-natural-olive' : 'text-stone-400 hover:text-natural-ink hover:bg-black/5'}`}
            title="Archive"
          >
            <Clock className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 hover:bg-black/5 rounded-full transition-colors text-stone-400 hover:text-natural-ink"
          >
            <SettingsIcon className="w-5 h-5" />
          </button>
        </div>
      </nav>

      <main className="pt-32 pb-32 px-6 max-w-6xl mx-auto">
        <Settings 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)} 
          apiKey={userApiKey}
          onSave={(key) => {
            setUserApiKey(key);
            localStorage.setItem('gemini_api_key', key);
          }}
        />

        <AnimatePresence mode="wait">
          {showHero ? (
            <motion.section
              key="hero"
              initial={{ opacity: 1 }}
              animate={{ opacity: isTransitioning ? 0 : 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="min-h-[70vh] flex flex-col items-center justify-center text-center space-y-10"
            >
              <div className="space-y-6 max-w-3xl">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-natural-olive mb-4 block">
                    Strategic Content Design
                  </span>
                  <h1 className="text-7xl md:text-8xl font-light tracking-tight text-natural-ink leading-[0.9]">
                    Viral Scripts, <br />
                    <span className="italic font-serif">Zero Effort.</span>
                  </h1>
                </motion.div>
                
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-stone-500 text-lg md:text-xl font-light leading-relaxed max-w-2xl mx-auto"
                >
                  The AI strategist for modern creators. <br className="hidden md:block" />
                  Turn your vibe into high-converting scripts in less than 60 seconds.
                </motion.p>
              </div>

              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                onClick={handleStart}
                className="group relative px-12 py-5 bg-natural-ink text-white rounded-full text-xs font-bold uppercase tracking-[0.2em] overflow-hidden shadow-2xl hover:scale-105 transition-transform"
              >
                <span className="relative z-10">Start My Vibe Check</span>
                <div className="absolute inset-0 bg-natural-olive translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              </motion.button>
            </motion.section>
          ) : (
            <motion.div
              key="app-content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
            >
              <AnimatePresence mode="wait">
                {step === 'vibe-check' && (
                  <motion.div
                    key="vibe"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
                  >
                    <VibeCheck onComplete={handleVibeComplete} userApiKey={userApiKey} />
                  </motion.div>
                )}
                {step === 'ideas' && (
                  <motion.div
                    key="ideas"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
                  >
                    <IdeaSelection 
                      ideas={ideas} 
                      inputs={inputs}
                      onSelect={handleIdeaSelect} 
                      onBack={() => setStep('vibe-check')}
                    />
                  </motion.div>
                )}

                {step === 'scripts' && selectedIdea && (
                  <motion.div
                    key="scripts"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
                  >
                    <ScriptSuite 
                      idea={selectedIdea} 
                      inputs={inputs}
                      initialSuite={previewHistoryItem?.suite}
                      isArchive={!!previewHistoryItem}
                      onBack={() => {
                        setStep(previewHistoryItem ? 'history' : 'ideas');
                        setPreviewHistoryItem(null);
                      }}
                      userApiKey={userApiKey}
                    />
                  </motion.div>
                )}

                {step === 'history' && (
                  <motion.div
                    key="history"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
                  >
                    <History 
                      onSelect={handleViewHistoryItem}
                      onBack={() => {
                        setStep('vibe-check');
                        setShowHero(true);
                      }}
                    />
                  </motion.div>
                )}

                {step === 'admin' && (
                  <motion.div
                    key="admin"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
                  >
                    {!isAdminAuth ? (
                      <AdminLogin 
                        onSuccess={() => setIsAdminAuth(true)} 
                        onBack={() => {
                          setStep('vibe-check');
                          setShowHero(true);
                        }} 
                      />
                    ) : (
                      <AdminDashboard onBack={() => {
                        setStep('vibe-check');
                        setShowHero(true);
                        // Optional: clear auth on exit or keep? User said "a user must be able to see only their own archives", referring to standard users. Admin is separate.
                      }} />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="p-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-widest text-stone-400 border-t border-stone-200/50">
        <div>Gemini 3.1 Flash Lite • Token Diet: Active • Content Mode: Viral-Only</div>
        <div className="flex items-center gap-2">
          <span>© 2026 Vibe Script</span>
          <div className="w-1 h-1 bg-stone-300 rounded-full" />
          <span>Quiet Luxury Built</span>
        </div>
      </footer>
    </div>
  );
}

function AdminLogin({ onSuccess, onBack }: { onSuccess: () => void, onBack: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'vibes2026') {
      onSuccess();
    } else {
      setError('Invalid credentials. Access denied.');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-10 py-20">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-natural-olive/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="w-8 h-8 text-natural-olive" />
        </div>
        <h2 className="text-4xl font-light tracking-tight text-natural-ink italic font-serif">Executive Access</h2>
        <p className="text-stone-400 text-xs uppercase tracking-[0.2em] font-bold">Secure Verification Required</p>
      </div>

      <form onSubmit={handleSubmit} className="natural-card p-10 bg-white/50 border-stone-100 shadow-xl space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">ID</label>
            <input 
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full h-12 bg-white border border-stone-100 rounded-2xl px-4 text-sm focus:outline-none focus:border-natural-olive transition-colors"
              placeholder="Username"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">Passkey</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 bg-white border border-stone-100 rounded-2xl px-4 text-sm focus:outline-none focus:border-natural-olive transition-colors"
              placeholder="••••••••"
            />
          </div>
        </div>

        {error && (
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 text-[10px] uppercase font-bold tracking-widest text-center"
          >
            {error}
          </motion.p>
        )}

        <button 
          type="submit"
          className="w-full h-12 bg-natural-ink text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.3em] hover:scale-105 active:scale-95 transition-all shadow-lg"
        >
          Verify Identity
        </button>

        <button 
          type="button"
          onClick={onBack}
          className="w-full text-stone-400 text-[10px] font-bold uppercase tracking-widest hover:text-natural-ink transition-colors"
        >
          Back to Terminal
        </button>
      </form>
    </div>
  );
}
