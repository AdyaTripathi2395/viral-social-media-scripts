import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Loader2, Info } from 'lucide-react';
import { generateContentIdeas, ContentIdea } from '../lib/gemini';
import { ProgressBar } from './ProgressBar';

interface VibeCheckProps {
  onComplete: (inputs: any, ideas: ContentIdea[]) => void;
  userApiKey?: string;
  initialStep?: number;
  initialAnswers?: any;
  onStateChange?: (step: number, answers: any) => void;
}

export function VibeCheck({ onComplete, userApiKey, initialStep = 0, initialAnswers, onStateChange }: VibeCheckProps) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [answers, setAnswers] = useState(initialAnswers || {
    niche: '',
    audience: '',
    onCamera: '',
    contentFormat: '',
    goal: '',
  });

  const updateAnswers = (newAnswers: any) => {
    setAnswers(newAnswers);
    onStateChange?.(currentStep, newAnswers);
  };

  const updateStep = (newStep: number, overriddenAnswers?: any) => {
    setCurrentStep(newStep);
    onStateChange?.(newStep, overriddenAnswers || answers);
  };

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const steps = [
    {
      id: 'contentFormat',
      question: "Content Format?",
      type: 'select',
      options: ['Reel/Short', 'Static Post', 'Story', 'Carousel'],
      description: "Select the primary medium for this strategy.",
      help: "Reels for reach, Carousels for depth."
    },
    {
      id: 'onCamera',
      question: "On-Camera Style?",
      placeholder: "e.g., Faceless, Talking Head",
      description: "How do you prefer to show up on screen?",
      help: "Faceless/B-roll or Face-to-camera?",
      condition: (ans: any) => ans.contentFormat === 'Reel/Short' || ans.contentFormat === 'Story'
    },
    {
      id: 'niche',
      question: "What's your content niche?",
      placeholder: "e.g., Tech PM, Aesthetic Beauty, SaaS",
      description: "Define your playground. What topic do you own?",
      help: "e.g., Tech PM, Aesthetic Beauty, SaaS."
    },
    {
      id: 'audience',
      question: "Who are we talking to?",
      placeholder: "e.g., Small biz owners, Creators",
      description: "Be specific. The more we know them, the better we reach them.",
      help: "Who is this for? e.g., Small biz owners."
    },
    {
      id: 'goal',
      question: "What's the energy today?",
      placeholder: "e.g., Viral, Educational",
      description: "Are we chasing sparks or building foundations?",
      help: "Viral = broad/trending; Educational = niche authority."
    }
  ];

  const handleNext = async (overriddenAnswers?: any) => {
    const currentAnswers = overriddenAnswers || answers;
    let nextStep = currentStep + 1;
    
    // Skip conditional steps if needed
    while (nextStep < steps.length && steps[nextStep].condition && !steps[nextStep].condition(currentAnswers)) {
      nextStep++;
    }

    if (nextStep < steps.length) {
      setError(null);
      updateStep(nextStep, currentAnswers);
    } else {
      if (cooldown > 0) return;
      setIsLoading(true);
      setError(null);
      try {
        const ideas = await generateContentIdeas(
          currentAnswers.niche,
          currentAnswers.audience,
          currentAnswers.onCamera,
          currentAnswers.contentFormat,
          currentAnswers.goal,
          userApiKey
        );
        setCooldown(30);
        onComplete(currentAnswers, ideas);
      } catch (err: any) {
        console.error("Failed to generate ideas:", err);
        const errorMessage = err.message || "Unknown error";
        setError(`The strategy nexus is offline (${errorMessage}). Please check your connection or API key.`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleBack = () => {
    let prevStep = currentStep - 1;
    
    // Skip conditional steps if needed
    while (prevStep >= 0 && steps[prevStep].condition && !steps[prevStep].condition(answers)) {
      prevStep--;
    }

    if (prevStep >= 0) {
      setError(null);
      updateStep(prevStep);
    }
  };

  const isCurrentStepValid = answers[steps[currentStep].id as keyof typeof answers]?.trim().length >= (steps[currentStep].type === 'select' ? 1 : 2);

  // Update button for cooldown
  const buttonContent = cooldown > 0 ? `${cooldown}s` : <ArrowRight className="w-6 h-6" />;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-12">
        <span className="text-[10px] font-black tracking-[0.4em] uppercase text-stone-400 mb-8 block">
          Phase I: Discovery Analysis
        </span>
        <ProgressBar currentStep="vibe-check" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
          className="natural-card p-12 bg-white/40 border-stone-100/50 shadow-sm"
        >
          <div className="flex justify-between items-center mb-10">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-4xl font-light tracking-tight text-natural-ink italic font-serif">
                    {steps[currentStep].question}
                  </h2>
                  <div className="relative group/help">
                    <div className="p-1.5 rounded-full bg-stone-50 text-stone-300 transition-colors group-hover/help:text-natural-olive cursor-help">
                      <Info className="w-3.5 h-3.5" />
                    </div>
                    <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-white border border-stone-100 rounded-xl shadow-2xl opacity-0 invisible group-hover/help:opacity-100 group-hover/help:visible transition-all z-50 pointer-events-none">
                      <p className="text-[11px] text-stone-500 leading-relaxed italic font-sans not-italic">
                        {steps[currentStep].help}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-stone-500 text-sm leading-relaxed">
                {steps[currentStep].description}
              </p>
            </div>
            {currentStep > 0 && (
              <button
                onClick={handleBack}
                className="text-stone-400 hover:text-natural-ink transition-colors text-[10px] uppercase tracking-widest font-bold flex items-center gap-1"
              >
                <ArrowRight className="w-3 h-3 rotate-180" />
                Back
              </button>
            )}
          </div>

          <div className="relative group">
            {steps[currentStep].type === 'select' ? (
              <div className="grid grid-cols-2 gap-4">
                {steps[currentStep].options?.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      const newAnswers = { ...answers, [steps[currentStep].id]: opt };
                      updateAnswers(newAnswers);
                      setTimeout(() => handleNext(newAnswers), 300);
                    }}
                    className={`py-6 px-4 rounded-2xl border text-sm font-medium transition-all ${
                      answers[steps[currentStep].id as keyof typeof answers] === opt
                        ? 'border-natural-olive bg-natural-olive/5 text-natural-olive'
                        : 'border-stone-100 bg-white text-stone-500 hover:border-stone-200'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            ) : (
              <>
                <input
                  autoFocus
                  type="text"
                  value={answers[steps[currentStep].id as keyof typeof answers]}
                  onChange={(e) => updateAnswers({ ...answers, [steps[currentStep].id]: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && isCurrentStepValid && handleNext()}
                  placeholder={steps[currentStep].placeholder}
                  className="w-full bg-transparent border-b border-stone-200 py-6 text-2xl font-light outline-none focus:border-natural-olive transition-all placeholder:text-stone-200"
                />
                {isCurrentStepValid && !isLoading && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={handleNext}
                    disabled={cooldown > 0}
                    className="absolute right-0 top-1/2 -translate-y-1/2 bg-natural-ink text-white p-4 rounded-full hover:scale-105 transition-transform shadow-xl disabled:bg-stone-200 disabled:shadow-none disabled:scale-100"
                  >
                    {cooldown > 0 ? (
                      <span className="text-xs font-bold w-6 h-6 flex items-center justify-center">{cooldown}</span>
                    ) : (
                      <ArrowRight className="w-6 h-6" />
                    )}
                  </motion.button>
                )}
              </>
            )}
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 p-4 bg-red-50 text-red-600 text-xs rounded-lg flex items-center gap-3"
              >
                <div className="w-1 h-1 bg-red-400 rounded-full animate-pulse" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>

      {isLoading && (
        <div className="fixed inset-0 bg-natural-bg/90 backdrop-blur-md z-[100] flex flex-col items-center justify-center gap-6">
          <div className="relative">
            <Loader2 className="w-16 h-16 animate-spin text-natural-olive stroke-[1px]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-natural-olive rounded-full" />
            </div>
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm font-bold uppercase tracking-widest text-natural-ink">Consulting Oracle</p>
            <p className="text-xs text-stone-400">Synthesizing digital frequencies...</p>
          </div>
        </div>
      )}
    </div>
  );
}
