import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useBecomingStore } from "../store/useBecomingStore";
import { ArrowRight, Sparkles, Send } from "lucide-react";
import { cn } from "../lib/utils";

const QUESTIONS = [
  "What future are you most afraid of right now?",
  "What is the one habit that is silently holding you back?",
  "When do you feel most disconnected from the person you want to be?",
  "If money and fear were gone, what kind of life would you choose today?",
  "What are you avoiding because it feels too difficult to start?",
  "What version of yourself are you actually trying to become?",
  "Be honest: on a scale of 1-10, how disciplined have you been lately?",
  "What dream are you afraid to commit to, even in your own head?"
];

export const Intake = () => {
  const { setStep, setResponse, responses } = useBecomingStore();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleNext = () => {
    if (!input.trim()) return;
    
    setResponse(QUESTIONS[currentIdx], input);
    setInput("");
    
    if (currentIdx < QUESTIONS.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setStep('analysis');
    }
  };

  useEffect(() => {
    setIsTyping(true);
    const timer = setTimeout(() => setIsTyping(false), 1000);
    return () => clearTimeout(timer);
  }, [currentIdx]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-20 relative">
      <div className="max-w-xl w-full z-10">
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIdx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="glass rounded-3xl p-8 md:p-12 shadow-2xl relative"
          >
            <div className="absolute -top-3 left-8">
                <span className="system-label">Current Reflection</span>
            </div>

            <div className="space-y-10">
                <div className="space-y-4">
                    <p className="text-[10px] tracking-[0.4em] font-display uppercase opacity-40">
                        Step {currentIdx + 1} of {QUESTIONS.length}
                    </p>
                    <h2 className="text-2xl md:text-3xl font-extralight leading-relaxed text-gray-100">
                    {isTyping ? (
                        <span className="flex gap-1">
                            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></span>
                            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse [animation-delay:0.2s]"></span>
                            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse [animation-delay:0.4s]"></span>
                        </span>
                    ) : (
                        <>
                        “{QUESTIONS[currentIdx].split('?')[0]} <span className="text-cyan-400 italic font-serif">?</span>”
                        </>
                    )}
                    </h2>
                </div>

                <div className="relative">
                <input
                    autoFocus
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        handleNext();
                    }
                    }}
                    className="w-full bg-transparent border-b border-white/10 pb-4 text-xl font-light focus:outline-none focus:border-cyan-400 transition-colors placeholder:opacity-10 text-white"
                    placeholder="Type your reflection here..."
                />
                <button
                    onClick={handleNext}
                    disabled={!input.trim()}
                    className={cn(
                    "absolute right-0 bottom-4 text-[10px] tracking-widest uppercase font-bold transition-all",
                    input.trim() ? "text-cyan-400 opacity-100 hover:text-white" : "text-gray-700 opacity-0"
                    )}
                >
                    Submit
                </button>
                </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Floating Hint */}
        <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            className="mt-12 text-[10px] text-gray-500 font-display uppercase tracking-[0.4em] text-center"
        >
            Press Enter to continue your journey
        </motion.p>
      </div>

      {/* Progress Indicator */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-4">
          {QUESTIONS.map((_, i) => (
              <div 
                key={i} 
                className={cn(
                    "h-px w-8 transition-all duration-500",
                    i === currentIdx ? "bg-cyan-400 shadow-[0_0_8px_#22d3ee]" : "bg-white/10"
                )}
              />
          ))}
      </div>
    </div>
  );
};
