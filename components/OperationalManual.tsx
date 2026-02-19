
import React from 'react';
// Added ArrowRight to the imports from lucide-react
import { X, Cpu, Code2, Bot, ShieldCheck, Zap, Database, Globe, Radio, Terminal, Hash, ChevronRight, Activity, Terminal as TerminalIcon, ArrowRight } from 'lucide-react';

interface OperationalManualProps {
  onClose: () => void;
  theme: 'light' | 'dark' | 'cyber';
}

const OperationalManual: React.FC<OperationalManualProps> = ({ onClose, theme }) => {
  const themeStyles = {
    light: 'bg-white text-slate-900 border-slate-200',
    dark: 'bg-[#050b18]/98 text-white border-blue-900 shadow-2xl backdrop-blur-3xl',
    cyber: 'bg-black text-[#00ff41] border-[#00ff41]'
  }[theme];

  const accentColor = theme === 'cyber' ? 'text-[#00ff41]' : 'text-sky-500';

  const TechBadge = ({ icon: Icon, label, detail }: { icon: any, label: string, detail: string }) => (
    <div className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-blue-950/30 border-blue-800/50' : 'bg-slate-50 border-slate-200'} flex items-start gap-4`}>
      <div className={`p-2 rounded-lg bg-sky-500/10 ${accentColor}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">{label}</p>
        <p className="text-[11px] font-bold opacity-60 leading-relaxed">{detail}</p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[2000] bg-sky-900/40 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-500 font-mono-tactical">
      <div className="scanline opacity-10" />
      <div className={`w-full max-w-lg h-[85vh] rounded-[2.5rem] border-2 flex flex-col relative overflow-hidden ${themeStyles} animate-in zoom-in-95 duration-500 shadow-3xl`}>
        
        {/* Header HUD */}
        <div className={`p-8 border-b ${theme === 'dark' ? 'border-white/5' : 'border-slate-100'} flex justify-between items-center shrink-0`}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl ${theme === 'cyber' ? 'bg-[#00ff41]/20' : 'bg-sky-600/10'} flex items-center justify-center`}>
              <TerminalIcon className={`w-6 h-6 ${accentColor}`} />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tighter italic">Mission Manual</h2>
              <div className="flex items-center gap-2 opacity-40">
                <span className="text-[8px] font-black uppercase tracking-widest">Protocol Version: 4.1.0-STABLE</span>
                <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all active:scale-90">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Technical Briefing Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar relative">
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[size:30px_30px] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)]" />

          {/* Section: Mission Statement */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 opacity-40">
              <ChevronRight className="w-3 h-3" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Operational Objective</span>
            </div>
            <div className={`p-6 rounded-3xl border-2 italic text-sm font-bold leading-relaxed ${theme === 'dark' ? 'bg-blue-900/20 border-blue-900/50' : 'bg-slate-50 border-slate-100'}`}>
              "MindPilot is a high-fidelity habit-optimization terminal designed to bridge the gap between human intention and military-grade discipline. It utilizes neural-uplink technology to monitor operational integrity and enforce protocol adherence."
            </div>
          </section>

          {/* Section: Tech Stack */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 opacity-40">
              <ChevronRight className="w-3 h-3" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">System Architecture (Tech Stack)</span>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <TechBadge 
                icon={Code2} 
                label="Frontend Framework" 
                detail="Built with React 19 and TypeScript for highly-typed, component-based mission controls." 
              />
              <TechBadge 
                icon={Bot} 
                label="Artificial Intelligence" 
                detail="Powered by Google Gemini (Flash & Pro 3) for tactical coaching, analysis, and motivational briefings." 
              />
              <TechBadge 
                icon={Radio} 
                label="Neural Audio (TTS)" 
                detail="Native integration of Gemini 2.5 Flash TTS for generating tactical voice signatures." 
              />
              <TechBadge 
                icon={Database} 
                label="State & Persistence" 
                detail="Local browser-encrypted storage with React Hooks (useMemo, useEffect) for zero-latency sync." 
              />
              <TechBadge 
                icon={Activity} 
                label="Visual Intelligence" 
                detail="Tailwind CSS for tactical HUD aesthetics and Recharts for rolling performance telemetry." 
              />
              <TechBadge 
                icon={Globe} 
                label="Uplink Protocols" 
                detail="PWA (Progressive Web App) architecture with Service Workers for background notifications." 
              />
            </div>
          </section>

          {/* Section: Protocols */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 opacity-40">
              <ChevronRight className="w-3 h-3" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Operational Protocols</span>
            </div>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-1 h-full bg-sky-500 rounded-full shrink-0" />
                <div>
                  <h4 className="text-xs font-black uppercase tracking-tight mb-2">Neural Alarms</h4>
                  <p className="text-[11px] font-bold opacity-60 leading-relaxed">Alarms are more than sounds; they are neural handshakes. Users can choose standard alerts, AI-generated tactical briefings, or phone-call simulations.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-1 h-full bg-red-500 rounded-full shrink-0" />
                <div>
                  <h4 className="text-xs font-black uppercase tracking-tight mb-2">Focus Mode (Perimeter Lock)</h4>
                  <p className="text-[11px] font-bold opacity-60 leading-relaxed">Detects when the operator leaves the terminal. Protocol breaches result in immediate AI intervention and streak degradation.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-1 h-full bg-emerald-500 rounded-full shrink-0" />
                <div>
                  <h4 className="text-xs font-black uppercase tracking-tight mb-2">Tactical Stats</h4>
                  <p className="text-[11px] font-bold opacity-60 leading-relaxed">Rolling 28-day adherence intensity grids and sector-based performance analysis identify volatility in the user's schedule.</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Footer HUD */}
        <div className={`p-8 border-t ${theme === 'dark' ? 'border-white/5' : 'border-slate-100'} shrink-0`}>
          <button 
            onClick={onClose}
            className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.4em] flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all ${
              theme === 'cyber' ? 'bg-[#00ff41] text-black shadow-[#00ff41]/20' : 'bg-sky-600 text-white shadow-sky-600/20'
            }`}
          >
            Mission Accepted <ArrowRight className="w-4 h-4" />
          </button>
          <div className="mt-4 flex justify-between items-center opacity-20">
             <div className="flex gap-1">
                <div className="w-1 h-1 rounded-full bg-white" />
                <div className="w-1 h-1 rounded-full bg-white" />
                <div className="w-1 h-1 rounded-full bg-white" />
             </div>
             <p className="text-[7px] font-black uppercase tracking-widest italic">Auth: COMMANDER-01 // SIG: Alpha-V</p>
             <div className="flex gap-1">
                <div className="w-1 h-1 rounded-full bg-white" />
                <div className="w-1 h-1 rounded-full bg-white" />
                <div className="w-1 h-1 rounded-full bg-white" />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperationalManual;
