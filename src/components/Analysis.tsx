import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useBecomingStore } from "../store/useBecomingStore";
import { generateAnalysis } from "../services/aiService";
import { Sparkles, Cpu, Layers, Disc } from "lucide-react";

const STEPS = [
  "Connecting to your future frequency...",
  "Decoding emotional patterns...",
  "Simulating habit trajectories...",
  "Building parallel timelines...",
  "Finalizing your becoming..."
];

export const Analysis = () => {
  const { responses, setAnalysis, setStep } = useBecomingStore();
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const runAnalysis = async () => {
      try {
        const result = await generateAnalysis(responses);
        setAnalysis(result);
        // Move to final step after a minimum duration for effect
        setTimeout(() => setStep('results'), 2000);
      } catch (error) {
        console.error("Analysis failed", error);
        // Fallback or retry logic
      }
    };

    runAnalysis();

    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#020205] overflow-hidden relative">
      <div className="z-10 text-center space-y-16">
        {/* Animated Scanner Effect */}
        <div className="relative w-40 h-40 mx-auto">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border border-cyan-500/20 rounded-full"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute inset-4 border border-purple-500/10 rounded-full"
          />
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute inset-12 bg-cyan-400/10 rounded-full blur-2xl"
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
            <div className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_15px_#22d3ee]" />
          </div>
        </div>

        <div className="h-20 flex flex-col items-center justify-center gap-6">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                >
                    <h2 className="text-xl md:text-2xl font-extralight tracking-tight text-white/90 font-display italic">
                        {STEPS[currentStep]}
                    </h2>
                </motion.div>
            </AnimatePresence>
            
            <div className="flex gap-2">
                {[0, 1, 2, 3, 4].map((i) => (
                    <motion.div
                        key={i}
                        animate={{
                            width: i === currentStep ? 24 : 6,
                            backgroundColor: i === currentStep ? "#22d3ee" : "#1f2937",
                        }}
                        className="h-0.5 rounded-full transition-all duration-500"
                    />
                ))}
            </div>
        </div>

        <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.2 }}
            className="text-[9px] text-gray-500 uppercase tracking-[0.6em] font-display font-bold"
        >
            System Sync in Progress // Link Established
        </motion.p>
      </div>
    </div>
  );
};
