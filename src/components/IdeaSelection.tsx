import { motion } from 'motion/react';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { ContentIdea } from '../lib/gemini';
import { ProgressBar } from './ProgressBar';

interface IdeaSelectionProps {
  ideas: ContentIdea[];
  inputs: any;
  onSelect: (idea: ContentIdea) => void;
  onBack: () => void;
}

export function IdeaSelection({ ideas, onSelect, onBack }: IdeaSelectionProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-12">
        <span className="text-[10px] font-black tracking-[0.4em] uppercase text-stone-400 mb-8 block">
          Phase II: Strategic Concepts
        </span>
        <ProgressBar currentStep="ideas" />
      </div>

      <div className="flex justify-between items-end mb-12">
        <div>
          <h2 className="text-5xl font-light tracking-tight text-natural-ink italic font-serif">Pick your path</h2>
          <p className="text-stone-400 text-sm mt-2">Choose the concept that best aligns with your weekly goal.</p>
        </div>
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-stone-400 hover:text-natural-ink transition-colors text-[10px] uppercase tracking-widest font-bold mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Refine Inputs</span>
        </button>
      </div>

      <div className="grid gap-8">
        {ideas.length > 0 ? (
          ideas.map((idea, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ 
                delay: index * 0.2, 
                duration: 1, 
                ease: [0.19, 1, 0.22, 1] 
              }}
              onClick={() => onSelect(idea)}
              className="group relative cursor-pointer"
            >
              <div className="p-10 natural-card bg-white/40 border-stone-200/50 hover:bg-white hover:border-natural-olive/30 hover:shadow-2xl transition-all duration-500 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: index * 0.2 + 0.5, duration: 1 }}
                  className="absolute top-0 left-0 h-[2px] bg-natural-olive/20"
                />
                <div className="flex justify-between items-start mb-6">
                  <span className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-full ${
                    index % 3 === 0 ? 'bg-amber-50 text-amber-600' : 
                    index % 3 === 1 ? 'bg-natural-olive/10 text-natural-olive' : 
                    'bg-stone-100 text-stone-500'
                  }`}>
                    {idea.label}
                  </span>
                  <div className="w-10 h-10 rounded-full border border-stone-200 flex items-center justify-center group-hover:border-natural-olive/30 group-hover:bg-natural-olive group-hover:text-white transition-all">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-2xl font-light mb-4 text-natural-ink group-hover:translate-x-1 transition-transform">{idea.title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed max-w-2xl">{idea.description}</p>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-20 space-y-6">
            <p className="text-stone-400 italic">The creative oracle was silent. Try refining your inputs for more clarity.</p>
            <button 
              onClick={onBack}
              className="px-8 py-3 bg-natural-ink text-white rounded-full text-xs font-bold uppercase tracking-widest"
            >
              Refine Strategy
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
