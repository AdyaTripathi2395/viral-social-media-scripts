import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Loader2, Info, Waves } from 'lucide-react';
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
  const [loadingMessage, setLoadingMessage] = useState("Consulting the Creative Oracle...");
  const [cooldown, setCooldown] = useState(0);

  const loadingMessages = [
    "Consulting the Creative Oracle...",
    "Aligning with the algorithm...",
    "Synthesizing viral structures...",
    "Polishing the hooks...",
    "Finalizing the strategy..."
  ];

  useEffect(() => {
    let interval: any;
    if (isLoading) {
      let i = 0;
      interval = setInterval(() => {
        i = (i + 1) % loadingMessages.length;
        setLoadingMessage(loadingMessages[i]);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const [answers, setAnswers] = useState(initialAnswers || {
    platform: '',
    topic: '',
    goal: '',
    tone: '',
    length: '',
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
      id: 'platform',
      question: "Which platform is this for?",
      type: 'select',
      options: [
        'YouTube (long-form)', 
        'YouTube Shorts / Reels / TikTok', 
        'LinkedIn', 
        'Instagram / Facebook', 
        'Podcast', 
        'Other'
      ],
      description: "Drives everything: tone, length, hook style, and CTA format.",
      help: "Platform choice determines the fundamental architecture of your script."
    },
    {
      id: 'topic',
      question: "What is your video/post about?",
      type: 'text',
      placeholder: "e.g., How I went from zero to 10K followers in 90 days...",
      description: "Be specific — the more detail here, the better your script.",
      help: "Include the core message, key takeaway, or transformation."
    },
    {
      id: 'goal',
      question: "What's the desired outcome?",
      type: 'select',
      options: [
        'Follow / Subscribe', 
        'Visit a link / website', 
        'Buy something', 
        'Comment / engage', 
        'Share the content', 
        'Book a call / DM me'
      ],
      description: "What do you want your audience to DO after watching?",
      help: "Your Call to Action (CTA) will be optimized for this specific goal."
    },
    {
      id: 'tone',
      question: "How would you describe your style?",
      type: 'select',
      options: [
        'Educational & informative', 
        'Conversational & casual', 
        'Motivational & bold', 
        'Humorous & entertaining', 
        'Storytelling & personal', 
        'Professional & authoritative'
      ],
      description: "This is the 'vibe' — what makes the output sound human.",
      help: "Your tone ensures the script matches your personality and brand voice."
    },
    {
      id: 'length',
      question: "How long should it be?",
      type: 'select',
      options: [
        'Short (15–30 seconds)', 
        'Medium (60–90 seconds)', 
        'Standard (3–5 minutes)', 
        'Long (7–10 minutes)'
      ],
      description: "Platform-aware output sizing for maximum impact.",
      help: "Select a duration that fits your platform and topic complexity."
    }
  ];

  const handleNext = async (overriddenAnswers?: any) => {
    const currentAnswers = overriddenAnswers || answers;
    const nextStep = currentStep + 1;

    if (nextStep < steps.length) {
      setError(null);
      updateStep(nextStep, currentAnswers);
    } else {
      if (cooldown > 0) return;
      setIsLoading(true);
      setError(null);
      try {
        const ideas = await generateContentIdeas(
          currentAnswers.platform,
          currentAnswers.topic,
          currentAnswers.goal,
          currentAnswers.tone,
          currentAnswers.length,
          userApiKey
        );
        setCooldown(30);
        onComplete(currentAnswers, ideas);
      } catch (err: any) {
        console.error("Failed to generate ideas:", err);
        const errorMessage = err.message || "Unknown error";
        const isQuotaError = errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED') || errorMessage.includes('quota');
        
        if (isQuotaError) {
          setError("Shared strategy limit reached. Please use 'Developer Mode' (top right) with your own API key to continue immediately.");
        } else {
          setError(`The strategy nexus is offline (${errorMessage.substring(0, 50)}...). Please check your connection or API key.`);
        }
      } finally {
        // We don't immediately set isLoading to false here because onComplete might navigate away
        // But if it stays on the same page (e.g. error), we need it to be false
      }
    }
  };

  const handleBack = () => {
    const prevStep = currentStep - 1;

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
                  className="w-full bg-transparent border-b border-stone-200 py-6 pr-16 text-2xl font-light outline-none focus:border-natural-olive transition-all placeholder:text-stone-200"
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
        <div className="fixed inset-0 bg-natural-bg/90 backdrop-blur-md z-[100] flex flex-col items-center justify-center text-center space-y-12">
          <div className="relative w-24 h-24">
            <motion.div 
              animate={{ 
                rotate: 360,
                scale: [1, 1.1, 1],
                borderRadius: ["40%", "50%", "40%"]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border-2 border-natural-olive/20"
            />
            <motion.div 
              animate={{ 
                rotate: -360,
                scale: [1, 1.2, 1],
                borderRadius: ["50%", "40%", "50%"]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute inset-2 border border-natural-olive/40"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Waves className="w-8 h-8 text-natural-olive" />
              </motion.div>
            </div>
          </div>
          
          <div className="space-y-4">
            <AnimatePresence mode="wait">
              <motion.p
                key={loadingMessage}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-xl font-serif italic text-natural-ink"
              >
                {loadingMessage}
              </motion.p>
            </AnimatePresence>
            <div className="w-48 h-[1px] bg-stone-200 mx-auto relative overflow-hidden">
              <motion.div 
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 bg-natural-olive"
              />
            </div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-stone-400">Designing Momentum</p>
          </div>
        </div>
      )}
    </div>
  );
}
