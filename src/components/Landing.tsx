import { motion } from "motion/react";
import { useBecomingStore } from "../store/useBecomingStore";
import { signInWithGoogle } from "../lib/firebase";
import { Sparkles, ArrowRight } from "lucide-react";

export const Landing = () => {
  const { setStep, setUser } = useBecomingStore();

  const handleStart = async () => {
    try {
      const user = await signInWithGoogle();
      setUser(user);
      setStep('intake');
    } catch (e) {
      // If sign in fails, still allow experience for demo if requested, 
      // but here we force sign in as per requirement "Authentication: Firebase Auth"
      console.error(e);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden">
      {/* Navigation */}
      <nav className="absolute top-0 left-0 w-full flex justify-between items-center px-8 md:px-12 py-8 z-50">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_#22d3ee]"></div>
          <span className="text-xs tracking-[0.4em] font-semibold uppercase opacity-80 group-hover:opacity-100 transition-opacity">Becoming.</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#" className="nav-link">Philosophy</a>
          <a href="#" className="nav-link">Projection</a>
          <button 
            onClick={handleStart}
            className="px-5 py-2 border border-white/20 rounded-full text-[10px] tracking-[0.2em] font-medium uppercase opacity-50 hover:opacity-100 hover:bg-white hover:text-black transition-all"
          >
            Enter Experience
          </button>
        </div>
      </nav>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="z-10 max-w-5xl"
      >
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 2 }}
          className="text-cyan-400 font-display tracking-[0.5em] uppercase text-[10px] mb-8 font-medium"
        >
          Future Projection Engine 1.0
        </motion.p>
        
        <h1 className="text-6xl md:text-8xl font-extralight tracking-tighter leading-[0.9] mb-10">
          The future version<br/>
          <span className="italic font-serif opacity-90 text-white/80">of you is watching.</span>
        </h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1.5 }}
          className="text-gray-400 text-sm md:text-base max-w-md mx-auto mb-14 leading-relaxed font-light"
        >
          Every decision shapes someone. Becoming uses generative AI to simulate 
          the life trajectory your current habits are creating.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center"
        >
          <button
            onClick={handleStart}
            className="group relative px-10 py-4 bg-white text-black font-display font-bold text-[11px] tracking-[0.2em] uppercase rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95"
          >
            <span className="relative z-10 flex items-center gap-2">
              Start Reflection <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </span>
            <div className="absolute inset-0 bg-linear-to-r from-cyan-400 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          
          <button
            onClick={() => setStep('intake')}
            className="px-10 py-4 glass text-white/50 font-display font-medium text-[11px] tracking-[0.2em] uppercase rounded-full hover:text-white hover:bg-white/10 transition-all border border-white/10"
          >
            See Projection
          </button>
        </motion.div>
      </motion.div>

      {/* Decorative vertical label */}
      <div className="absolute bottom-[10%] left-[5%] text-[8px] tracking-[0.4em] uppercase opacity-20 hidden md:block vertical-text">
        System.Reflect // Node_722
      </div>
    </div>
  );
};
