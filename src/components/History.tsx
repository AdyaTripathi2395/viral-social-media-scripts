import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Clock, ArrowLeft, ChevronRight, FileText, Calendar } from 'lucide-react';
import { ContentIdea, ScriptSuite as ScriptSuiteType } from '../lib/gemini';

interface HistoryItem {
  id: number;
  timestamp: string;
  idea: ContentIdea;
  inputs: any;
  suite: ScriptSuiteType;
}

interface HistoryProps {
  onSelect: (item: HistoryItem) => void;
  onBack: () => void;
}

export function History({ onSelect, onBack }: HistoryProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('vibe_script_history') || '[]');
    setHistory(saved);
  }, []);

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-6 text-center">
        <div className="p-4 bg-stone-50 text-stone-300 rounded-full">
          <Clock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-light">Archive Empty</h3>
          <p className="text-stone-400 text-sm max-w-xs mx-auto">Your creative path starts with your first generation.</p>
        </div>
        <button 
          onClick={onBack}
          className="btn-primary bg-natural-ink px-8 py-3 text-xs uppercase tracking-widest text-white mt-4"
        >
          Begin New Strategy
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-end">
        <div>
          <span className="text-[10px] font-black tracking-[0.4em] uppercase text-stone-400 mb-6 block">
            Private Archive
          </span>
          <h2 className="text-5xl font-light tracking-tight text-natural-ink italic font-serif">History Vault</h2>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-stone-100 rounded-full border border-stone-200">
              <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[9px] font-bold text-stone-500 uppercase tracking-widest">Browser-Local Storage</span>
            </div>
          </div>
        </div>
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-stone-400 hover:text-natural-ink transition-colors text-[10px] uppercase tracking-widest font-bold mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Vault</span>
        </button>
      </div>

      <div className="grid gap-4">
        {history.map((item) => (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => onSelect(item)}
            className="w-full text-left natural-card p-6 flex items-center justify-between group hover:border-natural-olive/30"
          >
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 bg-stone-50 rounded-xl flex items-center justify-center text-stone-300 group-hover:bg-natural-olive/5 group-hover:text-natural-olive transition-colors">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-natural-ink group-hover:text-natural-olive transition-colors">{item.idea.title}</h4>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1 text-[10px] text-stone-400 uppercase tracking-wider">
                    <Calendar className="w-3 h-3" />
                    {new Date(item.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="w-1 h-1 bg-stone-200 rounded-full" />
                  <span className="text-[10px] text-stone-400 uppercase tracking-widest">{item.inputs.contentFormat}</span>
                </div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-stone-200 group-hover:text-natural-olive group-hover:translate-x-1 transition-all" />
          </motion.button>
        ))}
      </div>
    </div>
  );
}
