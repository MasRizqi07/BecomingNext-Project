import { motion } from "motion/react";
import { useBecomingStore } from "../store/useBecomingStore";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Sparkles, AlertCircle, TrendingUp, Mail, Calendar, Target, ShieldCheck, Download, Share2, RefreshCcw } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { cn } from "../lib/utils";

export const Results = () => {
  const { analysis, setStep, resetResponses } = useBecomingStore();

  if (!analysis) return null;

  return (
    <div className="min-h-screen bg-[#020205] text-white py-16 px-4 md:px-12 max-w-7xl mx-auto space-y-24">
      {/* Header */}
      <section className="text-center space-y-8 pt-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-3 px-4 py-1 glass rounded-full"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs font-display tracking-[0.4em] uppercase text-cyan-400/80">Trajectory Sync Successful</span>
        </motion.div>
        
        <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-extralight tracking-tighter leading-none">
            The evolution of <br/>
            <span className="italic font-serif opacity-90 text-gradient-cyan">your becoming.</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto font-light leading-relaxed italic">
            "{analysis.identity.description}"
            </p>
        </div>
      </section>

      {/* Analytics Strip Dashboard */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-8 glass rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-cyan-500/20 to-transparent" />
          
          <div className="p-4 space-y-4">
              <p className="text-[10px] uppercase tracking-widest opacity-40 font-bold">Potential Score</p>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-light">{analysis.identityCard.potentialScore}</span>
                <span className="text-[10px] text-cyan-400 mb-2 font-bold tracking-widest">PATH S_RANK</span>
              </div>
          </div>

          <div className="p-4 space-y-4 border-l border-white/5">
              <p className="text-[10px] uppercase tracking-widest opacity-40 font-bold">AI Era Readiness</p>
              <div className="flex items-end gap-2 text-purple-400">
                <span className="text-4xl font-light text-white">{analysis.identityCard.aiReadiness}</span>
                <span className="text-[10px] mb-2 font-bold tracking-widest text-purple-500">% OPTIMAL</span>
              </div>
          </div>

          <div className="p-4 space-y-4 border-l border-white/5">
            <p className="text-[10px] uppercase tracking-widest opacity-40 font-bold">Identity Status</p>
            <div className="space-y-1">
                <p className="text-xs font-medium text-cyan-200">"{analysis.identityCard.growthPotential}"</p>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${analysis.identityCard.potentialScore}%` }}
                        className="h-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]"
                    />
                </div>
            </div>
          </div>

          <div className="p-4 space-y-4 border-l border-white/5 flex flex-col justify-between">
              <p className="text-[10px] uppercase tracking-widest opacity-40 font-bold">Primary Archetype</p>
              <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-cyan-400" />
                  <span className="text-sm font-display font-medium tracking-wide uppercase">{analysis.identity.archetype}</span>
              </div>
          </div>
      </section>

      {/* The Future Split */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-10 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:block z-20">
          <div className="w-14 h-14 bg-[#020205] backdrop-blur-3xl border border-white/10 rounded-full flex items-center justify-center font-display font-bold text-[10px] text-white/30 tracking-[0.3em]">SPLIT</div>
        </div>

        {/* Future A */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          whileHover={{ 
            scale: 0.98, 
            boxShadow: "0 0 50px -10px rgba(239, 68, 68, 0.3)",
            x: -5,
            transition: { duration: 0.2 }
          }}
          viewport={{ once: true }}
          className="glass p-10 rounded-3xl space-y-8 relative group hover:border-red-500/40 transition-colors duration-300"
        >
          <div className="space-y-4">
            <span className="system-label bg-red-950 text-red-500 border border-red-500/30">The Drift Path</span>
            <h3 className="text-3xl font-display font-bold text-white tracking-tight">{analysis.futureA.title}</h3>
          </div>
          <p className="text-gray-400 leading-relaxed font-light text-lg">
            {analysis.futureA.description}
          </p>
          <div className="pt-6 border-t border-white/5">
            <p className="text-[10px] text-red-500 font-display uppercase tracking-[0.3em] font-bold mb-2">Deep Future Regret</p>
            <p className="text-red-100/70 font-serif italic text-lg leading-relaxed">"{analysis.futureA.keyRegret}"</p>
          </div>
        </motion.div>

        {/* Future B */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          whileHover={{ 
            scale: 1.03, 
            y: -10,
            boxShadow: "0 0 60px -10px rgba(34, 211, 238, 0.5)",
            transition: { duration: 0.3, ease: "easeOut" }
          }}
          viewport={{ once: true }}
          className="glass p-10 rounded-3xl space-y-8 relative group hover:border-cyan-400/50 transition-colors duration-300 glow-cyan"
        >
          <div className="space-y-4">
            <span className="system-label bg-cyan-950 text-cyan-400 border border-cyan-400/30">The Becoming Path</span>
            <h3 className="text-3xl font-display font-bold text-white tracking-tight">{analysis.futureB.title}</h3>
          </div>
          <p className="text-white/80 leading-relaxed font-light text-lg">
            {analysis.futureB.description}
          </p>
          <div className="pt-6 border-t border-white/5">
            <p className="text-[10px] text-cyan-400 font-display uppercase tracking-[0.3em] font-bold mb-2">Future Climax Moment</p>
            <p className="text-cyan-100 font-serif italic text-lg leading-relaxed">"{analysis.futureB.keyGrowth}"</p>
          </div>
        </motion.div>
      </section>

      {/* Technical Data Visualization */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Radar Map */}
        <div className="lg:col-span-7 glass p-10 rounded-3xl space-y-10">
          <div className="flex justify-between items-start">
              <div className="space-y-2">
                <h4 className="text-xl font-display font-bold tracking-tight uppercase">Cognitive Potential Mesh</h4>
                <p className="text-xs text-gray-500 tracking-wider">Multidimensional analysis of capability shift over 5 years.</p>
              </div>
              <div className="flex flex-col gap-1 items-end">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span className="text-[9px] uppercase tracking-widest text-cyan-400/60 font-bold">Protocol Becoming</span>
                  </div>
                  <div className="flex items-center gap-2 opacity-40">
                    <div className="w-2 h-2 rounded-full bg-red-400" />
                    <span className="text-[9px] uppercase tracking-widest font-bold">Standard Drift</span>
                  </div>
              </div>
          </div>
          
          <div className="h-100 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={analysis.radarData}>
                <PolarGrid stroke="#ffffff10" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#666', fontSize: 10, className: 'font-display uppercase tracking-widest font-bold' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Drifting"
                  dataKey="A"
                  stroke="#ef444450"
                  fill="#ef4444"
                  fillOpacity={0.1}
                />
                <Radar
                  name="Becoming"
                  dataKey="B"
                  stroke="#22d3ee"
                  strokeWidth={2}
                  fill="#22d3ee"
                  fillOpacity={0.2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Action Items List */}
        <div className="lg:col-span-5 space-y-8">
            <div className="glass p-10 rounded-3xl space-y-8 h-full bg-linear-to-br from-cyan-950/20 to-transparent">
                 <h4 className="text-xl font-display font-bold flex items-center gap-2 uppercase tracking-tight">
                    <Calendar size={18} className="text-cyan-400" /> Evolution Roadmap
                 </h4>
                 <div className="space-y-8">
                    {analysis.timeline.map((item: any, idx: number) => (
                        <div key={idx} className="flex gap-6 items-start relative group">
                            {idx !== 2 && <div className="absolute left-2.75 top-6 -bottom-6 w-px bg-white/5" />}
                            <div className="w-6 h-6 rounded-full border border-cyan-400/20 bg-[#020205] flex items-center justify-center z-10">
                                <div className={cn("w-1.5 h-1.5 rounded-full", idx === 0 ? "bg-cyan-400 animate-pulse" : "bg-cyan-800")} />
                            </div>
                            <div className="space-y-2">
                                <span className="text-[10px] font-display text-cyan-400/40 uppercase tracking-[0.3em] font-bold">{item.period} Marker</span>
                                <p className="text-sm text-gray-300 leading-relaxed font-light group-hover:text-white transition-colors duration-500">
                                    "{item.stateB}"
                                </p>
                            </div>
                        </div>
                    ))}
                 </div>
                 
                 <div className="pt-10">
                     <button className="w-full py-4 bg-white text-black font-display font-bold text-[10px] tracking-[0.2em] uppercase rounded-full hover:bg-cyan-400 transition-colors">
                         Finalize Protocol
                     </button>
                 </div>
            </div>
        </div>
      </section>

      {/* Future Letter Section */}
      <section className="max-w-4xl mx-auto glass p-10 md:p-20 rounded-[3rem] relative overflow-hidden text-center">
        <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-cyan-500/30 to-transparent" />
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative space-y-12 z-10">
            <div className="space-y-4">
                <span className="text-[10px] font-display uppercase tracking-[0.5em] text-cyan-400 font-bold">Transmission: Chronos_9.0</span>
                <h3 className="text-4xl md:text-5xl font-extralight tracking-tighter">A Letter from<br/><span className="font-serif italic text-white/90">your potential self.</span></h3>
            </div>
            
            <div className="prose prose-invert prose-cyan max-w-none text-left">
                <div className="text-lg md:text-xl leading-loose text-gray-300 font-light font-sans whitespace-pre-wrap selection:bg-cyan-400 selection:text-black">
                    <ReactMarkdown>{analysis.futureLetter}</ReactMarkdown>
                </div>
            </div>

            <div className="flex flex-col items-center gap-6 pt-10">
                 <button className="flex items-center gap-3 text-cyan-400 hover:text-white transition-all text-[11px] font-bold tracking-[0.3em] uppercase">
                    <Download size={16} /> Archive this letter
                 </button>
            </div>
        </div>
      </section>

      {/* Transformation Plan Cards */}
      <section className="space-y-12">
        <div className="text-center space-y-4">
            <h3 className="text-3xl font-display font-bold uppercase tracking-tight">Active Protocols</h3>
            <p className="text-gray-500 text-sm tracking-wider">Execute these directives immediately to secure Future B.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass p-10 rounded-3xl space-y-8 hover:bg-white/5 transition-all">
                <div className="w-10 h-10 border border-cyan-400/30 rounded-xl flex items-center justify-center text-cyan-400">
                    <RefreshCcw size={18} />
                </div>
                <h5 className="text-lg font-display font-bold uppercase tracking-widest text-white/50">Daily Habits</h5>
                <ul className="space-y-4">
                    {analysis.plan.dailyHabits.map((h: string, i: number) => (
                        <li key={i} className="flex gap-4 items-start text-sm text-gray-400 group">
                            <span className="text-cyan-400 font-bold opacity-30">0{i+1}</span>
                            <span className="font-light group-hover:text-white transition-colors">{h}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="glass p-10 rounded-3xl space-y-8 hover:bg-white/5 transition-all border-cyan-500/5">
                <div className="w-10 h-10 border border-purple-400/30 rounded-xl flex items-center justify-center text-purple-400">
                    <Target size={18} />
                </div>
                <h5 className="text-lg font-display font-bold uppercase tracking-widest text-white/50">System Mastery</h5>
                <ul className="space-y-4">
                    {analysis.plan.learningRoadmap.map((h: string, i: number) => (
                        <li key={i} className="flex gap-4 items-start text-sm text-gray-400 group">
                            <span className="text-purple-400 font-bold opacity-30">0{i+1}</span>
                            <span className="font-light group-hover:text-white transition-colors">{h}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="glass p-10 rounded-3xl space-y-8 hover:bg-white/5 transition-all">
                <div className="w-10 h-10 border border-blue-400/30 rounded-xl flex items-center justify-center text-blue-400">
                    <Mail size={18} />
                </div>
                <h5 className="text-lg font-display font-bold uppercase tracking-widest text-white/50">Core Strategy</h5>
                <p className="text-sm text-gray-400 leading-relaxed font-light italic">
                    "{analysis.plan.antiProcrastination}"
                </p>
            </div>
        </div>
      </section>

      {/* Footer / Reset */}
      <footer className="text-center pt-24 pb-12 flex flex-col items-center gap-10">
         <div className="h-px w-48 bg-linear-to-r from-transparent via-white/20 to-transparent" />
         <button 
            onClick={() => {
                resetResponses();
                setStep('landing');
            }}
            className="px-10 py-5 glass border-white/10 rounded-full hover:bg-white hover:text-black transition-all flex items-center gap-4 text-[11px] font-bold tracking-[0.2em] uppercase"
         >
            <RefreshCcw size={14} />
            Re-Evaluate Identity Trajectory
         </button>
         <div className="flex flex-col items-center gap-2 opacity-20">
            <span className="text-[9px] font-bold tracking-[0.4em] uppercase">Becoming. Eternal Version</span>
            <span className="text-[8px] font-display tracking-[0.2em] uppercase italic underline underline-offset-4">Chronos Protocol Active</span>
         </div>
      </footer>
    </div>
  );
};
