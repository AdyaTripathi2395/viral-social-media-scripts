import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, ArrowLeft, Loader2, Star, CheckCircle2, Download, Send, Copy, Check, ArrowRight } from 'lucide-react';
import { generateScripts, ScriptSuite as ScriptSuiteType, ContentIdea, ScriptContent } from '../lib/gemini';
import { logToGoogleSheets } from '../lib/backend';
import { ProgressBar } from './ProgressBar';

interface ScriptSuiteProps {
  idea: ContentIdea;
  inputs: any;
  onBack: () => void;
  userApiKey?: string;
  initialSuite?: ScriptSuiteType | null;
  isArchive?: boolean;
}

export function ScriptSuite({ idea, inputs, onBack, userApiKey, initialSuite, isArchive }: ScriptSuiteProps) {
  const [suite, setSuite] = useState<ScriptSuiteType | null>(initialSuite || null);
  const [isLoading, setIsLoading] = useState(!initialSuite);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState((inputs as any).email || '');
  const [isEmailSending, setIsSendingEmail] = useState(false);
  const [isEmailSubmitted, setIsEmailSubmitted] = useState(isArchive ? true : false);
  const [showSentMessage, setShowSentMessage] = useState(false);
  const [feedback, setFeedback] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const loadingMessages = [
    "Analyzing audience patterns...",
    "Architecting narrative flow...",
    "Crafting emotional resonances...",
    "Calibrating viral frequencies...",
    "Synthesizing strategy suite..."
  ];

  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [isLoading]);

  useEffect(() => {
    async function fetchScripts() {
      if (initialSuite) return;
      setIsLoading(true);
      setError(null);
      try {
        const generated = await generateScripts(idea.title, idea.description, inputs.contentFormat, inputs.onCamera, userApiKey);
        setSuite(generated);
        
        // Save to history only on new generation
        if (!isArchive) {
          const history = JSON.parse(localStorage.getItem('vibe_script_history') || '[]');
          
          // Check if this specific generation (by title and description) already exists to prevent duplicates
          const isDuplicate = history.some((item: any) => 
            item.idea.title === idea.title && item.idea.description === idea.description
          );

          if (!isDuplicate) {
            const newEntry = {
              id: Date.now(),
              timestamp: new Date().toISOString(),
              idea,
              inputs,
              suite: generated,
              logId: idea.title + (inputs.niche || '') + Date.now() // Unique ID for sheet tracking
            };
            localStorage.setItem('vibe_script_history', JSON.stringify([newEntry, ...history].slice(0, 20)));
          }
        }
      } catch (err: any) {
        console.error("Failed to generate scripts:", err);
        setError("Drafting failed. The creative engine encountered a glitch.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchScripts();
  }, [idea, inputs.contentFormat, userApiKey, initialSuite, isArchive]);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isEmailSending || !suite) return;
    
    setIsSendingEmail(true);
    try {
      // Get the logId from the recently saved history entry
      const history = JSON.parse(localStorage.getItem('vibe_script_history') || '[]');
      const currentEntry = history.find((item: any) => item.idea.title === idea.title);
      const logId = currentEntry?.logId || (idea.title + (inputs.niche || '') + Date.now());

      await logToGoogleSheets({
        id: logId,
        email,
        ...inputs,
        selectedIdea: idea.title,
        scripts: {
          standard: JSON.stringify(suite.standard),
          storyteller: JSON.stringify(suite.storyteller),
          viral: JSON.stringify(suite.viral)
        }
      });
      setShowSentMessage(true);
      
      // Update history with email and logId so feedback can be tracked correctly
      const updatedHistory = history.map((item: any) => 
        item.idea.title === idea.title ? { ...item, email, logId } : item
      );
      localStorage.setItem('vibe_script_history', JSON.stringify(updatedHistory));

      // Give time for user to see the success message
      setTimeout(() => {
        setIsEmailSubmitted(true);
      }, 2000);
    } catch (err) {
      console.error("Failed to send email:", err);
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleFeedback = async (rating: number) => {
    setFeedback(rating);
  };

  const submitFeedback = async () => {
    if (!suite || feedback === 0) return;
    
    setFeedbackSubmitted(true);
    const history = JSON.parse(localStorage.getItem('vibe_script_history') || '[]');
    const currentEntry = history.find((item: any) => item.idea.title === idea.title);
    
    // Combine rating and comment
    const feedbackString = `${feedback}, ${feedbackComment || 'No comment'}`;

    await logToGoogleSheets({
      id: currentEntry?.logId || (idea.title + (inputs.niche || '') + Date.now()),
      email,
      ...inputs,
      selectedIdea: idea.title,
      feedback: feedbackString,
      scripts: {
        standard: JSON.stringify(suite.standard),
        storyteller: JSON.stringify(suite.storyteller),
        viral: JSON.stringify(suite.viral)
      }
    });

    // Update local history feedback
    const updatedHistory = history.map((item: any) => 
      item.idea.title === idea.title ? { ...item, feedback: feedback } : item
    );
    localStorage.setItem('vibe_script_history', JSON.stringify(updatedHistory));
  };

  const downloadStrategy = () => {
    if (!suite) return;
    
    const formatScript = (label: string, content: ScriptContent) => {
      const isCarousel = inputs.contentFormat === 'Carousel';
      const isStatic = inputs.contentFormat === 'Static Post';
      
      const hookLabel = isCarousel ? 'COVER SLIDE' : isStatic ? 'HEADLINE' : 'THE HOOK';
      const meatLabel = isCarousel ? 'SLIDE BREAKDOWN' : isStatic ? 'THE CAPTION' : 'THE MEAT';
      const visualsLabel = isCarousel ? 'VISUAL STYLE' : isStatic ? 'PHOTO COMPOSITION' : 'VISUAL CUES';

      return `
    --------------------------------------------------
    ${label.toUpperCase()}
    --------------------------------------------------
    ${hookLabel}: ${content.hook}
    
    ${meatLabel}:
    ${content.meat.map(m => `• ${m}`).join('\n')}
    
    ${visualsLabel}: ${content.visuals}
    
    CTA: ${content.cta}

    CAPTION: ${content.caption}

    HASHTAGS: ${content.hashtags.join(' ')}
    `;
    };

    const content = `
    VIBE SCRIPT: ${idea.title.toUpperCase()}
    PHASE: DISCOVERY & EXECUTION
    
    CONCEPT:
    ${idea.description}
    
    ${formatScript('Standard Strategy', suite.standard)}
    ${formatScript('Storyteller Variation', suite.storyteller)}
    ${formatScript('Viral Hook Variation', suite.viral)}
    
    --------------------------------------------------
    Generated by Vibe Script © 2026
    --------------------------------------------------
    `.trim();
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vibe_script_${idea.title.toLowerCase().replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-8">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="relative w-24 h-24"
        >
          <div className="absolute inset-0 border-t-2 border-natural-olive rounded-full opacity-20" />
          <div className="absolute inset-2 border-r-2 border-natural-olive rounded-full opacity-40" />
          <div className="absolute inset-4 border-b-2 border-natural-olive rounded-full opacity-60" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-natural-olive" />
          </div>
        </motion.div>
        
        <div className="text-center space-y-2">
          <AnimatePresence mode="wait">
            <motion.p 
              key={loadingMessageIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-stone-400 font-medium tracking-wide uppercase text-[10px]"
            >
              {loadingMessages[loadingMessageIndex]}
            </motion.p>
          </AnimatePresence>
          <div className="flex gap-1 justify-center">
            {[0, 1, 2, 3, 4].map(i => (
              <motion.div 
                key={i}
                animate={{ scale: i === loadingMessageIndex ? 1.5 : 1, opacity: i === loadingMessageIndex ? 1 : 0.3 }}
                className="w-1 h-1 rounded-full bg-natural-olive"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-6 text-center">
        <div className="p-4 bg-red-50 text-red-500 rounded-full">
          <Mail className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-light">Drafting Interrupted</h3>
          <p className="text-stone-400 text-sm max-w-xs mx-auto">{error}</p>
        </div>
        <button 
          onClick={onBack}
          className="btn-primary bg-natural-ink px-8 py-3 text-xs uppercase tracking-widest text-white mt-4"
        >
          Return to Strategy
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-12">
        <span className="text-[10px] font-black tracking-[0.4em] uppercase text-stone-400 mb-8 block">
          Phase III: Content Execution
        </span>
        <ProgressBar currentStep="scripts" />
      </div>

      <div className="flex justify-between items-end mb-12">
        <div className="space-y-2">
          <h2 className="text-5xl font-light tracking-tight text-natural-ink italic font-serif">{idea.title}</h2>
          <p className="text-stone-400 text-sm max-w-xl">{idea.description}</p>
        </div>
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-stone-400 hover:text-natural-ink transition-colors text-[10px] uppercase tracking-widest font-bold mb-2"
        >
          <ArrowLeft className="w-3 h-3" />
          <span>Change Strategy</span>
        </button>
      </div>

      <div className="grid gap-12">
        {suite && (
          <>
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-natural-olive" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-natural-ink">
                  Standard Strategy
                </span>
              </div>
              <ScriptCard content={suite.standard} format={inputs.contentFormat} />
            </div>

            <div className="grid gap-12 relative">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-stone-300" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-natural-ink">
                  Creative Variations
                </span>
              </div>
              
            <div className="grid md:grid-cols-2 gap-8 relative">
                {!isEmailSubmitted && (
                  <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-12">
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="natural-card bg-white/95 p-10 border-stone-200 shadow-2xl max-w-sm backdrop-blur-md text-center"
                    >
                      <Mail className="w-8 h-8 mb-4 text-natural-olive mx-auto" />
                      <h4 className="text-sm font-semibold text-natural-ink mb-2">Unlock variations</h4>
                      <p className="text-[11px] text-stone-400 mb-6 leading-relaxed">The Storyteller & Viral variations are generated and waiting. Unlock the full strategy to your inbox.</p>
                      <form onSubmit={handleUnlock} className="space-y-4">
                        <div className="space-y-2 text-left">
                          <label className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-400 ml-1">Secure Delivery Email</label>
                          <input 
                            type="email" 
                            placeholder="your@email.com"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="natural-input text-xs h-12"
                          />
                        </div>
                        <button 
                          disabled={isEmailSending || showSentMessage}
                          className="w-full h-12 bg-natural-ink text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl flex items-center justify-center gap-2 group disabled:opacity-70 disabled:hover:scale-100"
                        >
                          {isEmailSending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : showSentMessage ? (
                            <>
                              <span>Strategy Dispatched</span>
                              <CheckCircle2 className="w-3 h-3" />
                            </>
                          ) : (
                            <>
                              <span>Show Variations</span>
                              <Send className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                            </>
                          )}
                        </button>
                      </form>
                    </motion.div>
                  </div>
                )}

                <div className={`transition-all duration-700 ${!isEmailSubmitted ? 'opacity-40' : ''}`}>
                  <div className="mb-4 text-[9px] font-black tracking-widest text-stone-400 uppercase">Storyteller</div>
                  <ScriptCard content={suite.storyteller} format={inputs.contentFormat} isLocked={!isEmailSubmitted} />
                </div>
                <div className={`transition-all duration-700 ${!isEmailSubmitted ? 'opacity-40' : ''}`}>
                  <div className="mb-4 text-[9px] font-black tracking-widest text-stone-400 uppercase">Viral Hook</div>
                  <ScriptCard content={suite.viral} format={inputs.contentFormat} isLocked={!isEmailSubmitted} />
                </div>
              </div>
            </div>
          </>
        )}
      </div>


      <AnimatePresence>
        {isEmailSubmitted && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-natural-ink text-natural-bg p-16 rounded-[40px] text-center space-y-10 shadow-2xl"
          >
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-natural-olive" />
            </div>
            <div className="space-y-3">
              <h3 className="text-4xl font-light tracking-tight">Aligned.</h3>
              <p className="text-stone-400 text-sm">Your strategy is captured. Calibrate the output below.</p>
            </div>
            
            <div className="space-y-10">
              <div className="flex justify-center gap-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleFeedback(star)}
                    className={`p-6 rounded-3xl transition-all duration-500 ${feedback >= star ? 'bg-natural-olive text-white shadow-xl shadow-natural-olive/20' : 'bg-white/5 text-stone-600 hover:bg-white/10'}`}
                  >
                    <Star className={`w-8 h-8 ${feedback >= star ? 'fill-current' : ''}`} />
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {feedback > 0 && !feedbackSubmitted && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6 max-w-sm mx-auto w-full"
                  >
                    <textarea 
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                      placeholder="Briefly, any thoughts on the creative direction?"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm text-white focus:outline-none focus:border-natural-olive transition-colors h-28 resize-none placeholder-stone-600 shadow-inner"
                    />
                    <button 
                      onClick={submitFeedback}
                      className="w-full h-14 bg-natural-olive text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.3em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-natural-olive/10 group flex items-center justify-center gap-3"
                    >
                      <span>Finalize Feedback</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </motion.div>
                )}

                {feedbackSubmitted && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-10"
                  >
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-12 h-12 bg-natural-olive/20 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-natural-olive" />
                      </div>
                      <p className="text-natural-olive text-[10px] font-black tracking-[0.3em] uppercase">
                        Perspective Logged
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-center gap-8">
              <button 
                className="flex items-center gap-3 px-10 py-5 bg-natural-bg text-natural-ink rounded-full text-sm font-bold hover:scale-105 transition-transform"
                onClick={downloadStrategy}
              >
                <Download className="w-5 h-5" />
                <span>Export Strategy</span>
              </button>
              <div className="text-xs text-stone-500 italic max-w-[200px]">A digital copy is being routed to {email}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ScriptCard({ content, format, isLocked = false }: { content: ScriptContent, format: string, isLocked?: boolean }) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, section: string) => {
    if (isLocked) return;
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const isCarousel = format === 'Carousel';
  const isStatic = format === 'Static Post';

  const sections = [
    { 
      label: isCarousel ? 'Cover Slide (Slide 1)' : isStatic ? 'Headline' : 'The Hook', 
      value: content.hook, 
      color: 'text-natural-olive' 
    },
    { 
      label: isCarousel ? 'Slide Breakdown (Slides 2-7)' : isStatic ? 'The Caption' : 'The Meat', 
      value: content.meat, 
      isList: true, 
      color: 'text-natural-ink' 
    },
    { 
      label: isCarousel ? 'Visual Style' : isStatic ? 'Photo Composition' : 'Visual Cues', 
      value: content.visuals, 
      color: 'text-stone-400 italic' 
    },
    { label: 'The CTA', value: content.cta, color: 'text-natural-olive font-bold' },
    { label: 'Post Caption', value: content.caption, color: 'text-stone-500 text-xs bg-stone-50 p-4 rounded-xl border border-stone-100' },
    { label: 'Strategic Hashtags', value: content.hashtags.join(' '), color: 'text-natural-olive font-mono text-[10px]' },
  ];

  return (
    <div className="natural-card bg-white p-8 space-y-8 border-stone-100 shadow-sm">
      {sections.map((section) => (
        <div key={section.label} className="group relative">
          <div className="flex items-center justify-between mb-3">
            <h5 className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-300">
              {section.label}
            </h5>
            <button 
              onClick={() => copyToClipboard(
                section.isList ? (section.value as string[]).join('\n') : section.value as string, 
                section.label
              )}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-stone-50 rounded-lg text-stone-400 hover:text-natural-olive"
              title="Copy Section"
            >
              {copiedSection === section.label ? (
                <Check className="w-3 h-3" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>
          </div>
          
          {section.isList ? (
            <ul className={`space-y-2 transition-all duration-700 ${isLocked ? 'blur-md select-none' : ''}`}>
              {(section.value as string[]).map((pill, i) => (
                <li key={i} className="flex gap-3 text-sm leading-relaxed text-natural-ink">
                  <span className="text-natural-olive mt-1.5 w-1 h-1 rounded-full bg-natural-olive shrink-0" />
                  {pill}
                </li>
              ))}
            </ul>
          ) : (
            <p className={`text-sm leading-relaxed ${section.color} transition-all duration-700 ${isLocked ? 'blur-md select-none' : ''}`}>
              {section.value}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
