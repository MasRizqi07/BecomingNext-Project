import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./lib/firebase";
import { useBecomingStore } from "./store/useBecomingStore";
import { Landing } from "./components/Landing";
import { Intake } from "./components/Intake";
import { Analysis } from "./components/Analysis";
import { Results } from "./components/Results";
import { ParticlesBG } from "./components/ParticlesBG";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const { user, setUser, step } = useBecomingStore();
  const [opening, setOpening] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    
    const openingTimer = setTimeout(() => {
        setOpening(false);
    }, 4500);

    return () => {
        unsub();
        clearTimeout(openingTimer);
    };
  }, []);

  if (opening) {
      return (
          <div className="fixed inset-0 bg-black flex flex-col items-center justify-center p-6 text-center z-100">
              <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5 }}
                    className="space-y-4"
                  >
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 2 }}
                            className="text-xl md:text-3xl font-display font-light text-white/50 italic tracking-widest"
                        >
                            “Every decision shapes someone.”
                        </motion.p>
                        
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 2.5, duration: 2 }}
                            className="text-3xl md:text-5xl font-display font-bold tracking-tight text-white"
                        >
                            Who are you becoming?
                        </motion.p>
                  </motion.div>
              </AnimatePresence>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-[#020205] text-white overflow-x-hidden p-0 m-0 relative">
      {/* Atmospheric Background Glows */}
      <div className="fixed -top-25 -left-25 w-125 h-125 bg-cyan-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed -bottom-25 -right-25 w-150 h-150 bg-purple-900/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed top-[20%] right-[10%] w-75 h-75 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />
      
      <ParticlesBG />
      
      <main className="relative z-10 min-h-screen flex flex-col">
        <AnimatePresence mode="wait">
          {step === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.8 }}
            >
              <Landing />
            </motion.div>
          )}

          {step === 'intake' && (
            <motion.div
              key="intake"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, filter: "blur(10px)" }}
              transition={{ duration: 0.8 }}
            >
              <Intake />
            </motion.div>
          )}

          {step === 'analysis' && (
            <motion.div
              key="analysis"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Analysis />
            </motion.div>
          )}

          {step === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            >
              <Results />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Audio Hint or Premium Accent */}
      <div className="fixed bottom-6 right-6 z-50 group pointer-events-none sm:pointer-events-auto">
          <div className="glass px-4 py-2 rounded-full text-[10px] uppercase font-display tracking-widest text-white/30 border border-white/5 flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />
            Premium AI Experience
          </div>
      </div>
    </div>
  );
}
