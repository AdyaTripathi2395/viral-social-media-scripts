import { motion } from 'motion/react';

interface ProgressBarProps {
  currentStep: 'vibe-check' | 'ideas' | 'scripts';
}

export function ProgressBar({ currentStep }: ProgressBarProps) {
  const steps = [
    { id: 'vibe-check', label: 'Vibe Check' },
    { id: 'ideas', label: 'Ideas' },
    { id: 'scripts', label: 'Scripts' }
  ];

  const currentIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-4">
        {steps.map((step, i) => (
          <div key={step.id} className="flex flex-col items-start gap-1">
            <span className={`text-[8px] uppercase tracking-[0.2em] font-black transition-colors ${
              i <= currentIndex ? 'text-natural-ink' : 'text-stone-300'
            }`}>
              {step.label}
            </span>
            <div 
              className={`h-1 rounded-full transition-all duration-700 ${
                i <= currentIndex ? 'bg-natural-olive w-12' : 'bg-stone-100 w-8'
              }`} 
            />
          </div>
        ))}
      </div>
      <div className="h-[1px] w-full bg-stone-100 relative overflow-hidden">
        <motion.div 
          initial={false}
          animate={{ width: `${((currentIndex + 1) / steps.length) * 100}%` }}
          transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
          className="absolute inset-0 bg-natural-olive/20"
        />
      </div>
    </div>
  );
}
