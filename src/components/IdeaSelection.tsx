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
        {ideas.map((idea, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.7, ease: [0.19, 1, 0.22, 1] }}
            onClick={() => onSelect(idea)}
            className="group relative cursor-pointer"
          >
            <div className="p-10 natural-card bg-white/40 border-stone-200/50 hover:bg-white hover:border-natural-olive/30 hover:shadow-xl group-active:scale-[0.99]">
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
        ))}
      </div>
    </div>
  );
}
