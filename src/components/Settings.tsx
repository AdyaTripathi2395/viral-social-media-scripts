import { motion, AnimatePresence } from 'motion/react';
import { X, Key, ExternalLink, Info } from 'lucide-react';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSave: (key: string) => void;
}

export function Settings({ isOpen, onClose, apiKey, onSave }: SettingsProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-natural-bg/80 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white natural-card p-10 border-stone-200"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-stone-400 hover:text-natural-ink transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-natural-olive/10 rounded-full flex items-center justify-center">
                <Key className="w-5 h-5 text-natural-olive" />
              </div>
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-medium">Developer Mode</h3>
                <div className="relative group/help">
                  <div className="p-1.5 rounded-full bg-stone-50 text-stone-300 transition-colors group-hover/help:text-natural-olive cursor-help">
                    <Info className="w-3.5 h-3.5" />
                  </div>
                  <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-white border border-stone-100 rounded-xl shadow-2xl opacity-0 invisible group-hover/help:opacity-100 group-hover/help:visible transition-all z-50 pointer-events-none">
                    <p className="text-[11px] text-stone-500 leading-relaxed italic font-sans not-italic">
                      Bring Your Own Key (BYOK) mode uses your personal Gemini API key for generation. This ensures higher reliability, follows your personal usage quota, and keeps your strategy history private.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">Step 1: Get your API Key</h4>
                  <div className="bg-stone-50 rounded-2xl p-5 space-y-3 border border-stone-100">
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Visit the <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-natural-olive font-bold hover:underline inline-flex items-center gap-1">Google AI Studio <ExternalLink className="w-3 h-3" /></a> and create a free Gemini API key.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">Step 2: Authenticate</h4>
                  <div className="space-y-2">
                    <input 
                      type="password"
                      value={apiKey}
                      onChange={(e) => onSave(e.target.value)}
                      placeholder="Paste your API Key here..."
                      className="natural-input h-14 bg-stone-50 border-stone-200 focus:border-natural-olive/50 focus:bg-white transition-all"
                    />
                    <div className="flex items-start gap-2 p-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-natural-olive mt-1" />
                      <p className="text-[10px] text-stone-400 leading-relaxed italic">
                        Your key is stored only in your browser's local storage. This allows the app to use your own limits and models.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <button 
                onClick={onClose}
                className="w-full h-14 bg-natural-ink text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-natural-ink/90 transition-colors shadow-xl"
              >
                Confirm Setup
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
