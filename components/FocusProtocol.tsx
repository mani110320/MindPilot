
import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap, X, Timer, Shield, AlertTriangle, RefreshCw, 
  ShieldAlert, Skull, Bot, Sparkles, MessageSquare, 
  ArrowRight, Activity, ShieldCheck, Lock, Scan,
  Cpu, Terminal, Hash, ChevronRight, AlertCircle
} from 'lucide-react';

interface FocusProtocolProps {
  durationMinutes: number;
  habitName?: string;
  onComplete: (violations: number) => void;
  onEmergencyStop: (reason: string) => void;
  onViolation?: (penalty: number) => void;
  theme: 'light' | 'dark' | 'cyber';
  blockDistractions?: boolean;
  getAiViolationMessage: (name: string) => Promise<string>;
}

const HUDCorner = ({ position, color }: { position: 'tl' | 'tr' | 'bl' | 'br', color: string }) => {
  const classes = {
    tl: "top-0 left-0 border-t-2 border-l-2",
    tr: "top-0 right-0 border-t-2 border-r-2",
    bl: "bottom-0 left-0 border-b-2 border-l-2",
    br: "bottom-0 right-0 border-b-2 border-r-2"
  }[position];
  return <div className={`absolute w-8 h-8 ${color} ${classes} pointer-events-none opacity-40`} />;
};

const FocusProtocol: React.FC<FocusProtocolProps> = ({ 
  durationMinutes, 
  habitName, 
  onComplete, 
  onEmergencyStop, 
  onViolation,
  theme,
  blockDistractions = false,
  getAiViolationMessage
}) => {
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
  const [isEmergency, setIsEmergency] = useState(false);
  const [abortReason, setAbortReason] = useState('');
  const [isReasonConfirmed, setIsReasonConfirmed] = useState(false);
  const [violationCount, setViolationCount] = useState(0);
  const [showViolationWarning, setShowViolationWarning] = useState(false);
  const [aiWarning, setAiWarning] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [glitchActive, setGlitchActive] = useState(false);
  
  const hasBreachedRef = useRef(false);
  const violationCountRef = useRef(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onComplete(violationCountRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'hidden' && blockDistractions) {
        hasBreachedRef.current = true;
        violationCountRef.current += 1;
        setViolationCount(violationCountRef.current);
        setGlitchActive(true);
        
        if (onViolation) onViolation(10);

        setLoadingAi(true);
        try {
          const msg = await getAiViolationMessage(habitName || 'this mission');
          setAiWarning(msg);
        } catch (e) {
          setAiWarning("Security compromised. Distractions are tactical weaknesses.");
        } finally {
          setLoadingAi(false);
          setTimeout(() => setGlitchActive(false), 1000);
        }
      } else if (document.visibilityState === 'visible' && blockDistractions && hasBreachedRef.current) {
        setShowViolationWarning(true);
        hasBreachedRef.current = false;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [onComplete, blockDistractions, onViolation, habitName, getAiViolationMessage]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const themeStyles = {
    light: 'bg-slate-50 text-slate-900',
    dark: 'bg-[#050b18] text-white',
    cyber: 'bg-black text-[#00ff41]'
  }[theme];

  const integrity = Math.max(0, 100 - (violationCount * 33.4));
  const statusColor = violationCount >= 3 ? 'text-red-500' : violationCount > 0 ? 'text-amber-500' : 'text-emerald-500';
  const accentBorder = theme === 'cyber' ? 'border-[#00ff41]' : 'border-sky-500';

  if (showViolationWarning) {
    return (
      <div className={`fixed inset-0 z-[600] bg-black/95 backdrop-blur-3xl flex flex-col items-center justify-center p-10 text-center animate-in fade-in duration-500 font-mono-tactical`}>
        <div className="scanline opacity-20" />
        <div className="absolute inset-0 bg-red-900/10 animate-pulse pointer-events-none" />
        
        <div className="relative mb-12">
          <div className="absolute inset-0 bg-red-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
          <div className="w-32 h-32 bg-red-600/10 border-4 border-red-500 rounded-full flex items-center justify-center relative z-10">
            <ShieldAlert className="w-16 h-16 text-red-500" />
          </div>
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full animate-bounce">
            BREACH!
          </div>
        </div>
        
        <h2 className="text-4xl font-black uppercase mb-2 tracking-tighter text-red-500 italic">Perimeter Compromised</h2>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500/60 mb-10">Neural Signal Leak Detected</p>
        
        <div className="w-full max-w-sm grid grid-cols-2 gap-4 mb-10">
           <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-2xl flex flex-col items-center">
             <span className="text-[8px] font-black uppercase tracking-widest opacity-40 mb-1">Integrity</span>
             <span className="text-2xl font-black text-red-400">{Math.floor(integrity)}%</span>
           </div>
           <div className={`border p-4 rounded-2xl flex flex-col items-center transition-colors ${violationCount >= 3 ? 'bg-red-600 border-red-500 text-white' : 'bg-white/5 border-white/10 text-white'}`}>
             <span className="text-[8px] font-black uppercase tracking-widest opacity-40 mb-1">Breach Count</span>
             <span className="text-2xl font-black">{violationCount}/3</span>
           </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 mb-10 backdrop-blur-md relative overflow-hidden group w-full max-w-sm">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Bot className="w-12 h-12" />
          </div>
          <p className="text-[10px] font-black uppercase text-red-400 mb-4 tracking-[0.3em] flex items-center justify-center gap-2">
             AI Command Intervention
          </p>
          <p className="text-lg font-bold italic text-white leading-tight">
            {loadingAi ? "Calculating distraction fallout..." : `"${aiWarning || "Signal lost..."}"`}
          </p>
        </div>

        {violationCount >= 3 && (
          <div className="mb-10 p-5 bg-red-600/20 border-2 border-red-600 rounded-3xl animate-pulse">
            <div className="flex items-center justify-center gap-3 mb-1">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-xs font-black text-red-500 uppercase tracking-widest">THRESHOLD EXCEEDED</p>
            </div>
            <p className="text-[10px] font-bold text-red-400 opacity-80 uppercase leading-none">Streak degradation protocol will be applied on mission end.</p>
          </div>
        )}
        
        <button 
          onClick={() => setShowViolationWarning(false)}
          className="w-full max-w-xs py-6 bg-red-600 text-white rounded-[2rem] font-black text-xl shadow-2xl shadow-red-600/40 active:scale-95 transition-all border-t-2 border-red-400"
        >
          RESTORE PROTOCOL
        </button>
      </div>
    );
  }

  if (isEmergency) {
    return (
      <div className={`fixed inset-0 z-[500] ${themeStyles} flex flex-col items-center justify-center p-10 text-center animate-in fade-in duration-300 font-mono-tactical`}>
        <HUDCorner position="tl" color="border-red-500" />
        <HUDCorner position="tr" color="border-red-500" />
        <HUDCorner position="bl" color="border-red-500" />
        <HUDCorner position="br" color="border-red-500" />

        {!isReasonConfirmed ? (
          <>
            <div className="mb-10 p-6 bg-red-600/10 rounded-full">
              <AlertTriangle className="w-16 h-16 text-red-500 animate-pulse" />
            </div>
            <h2 className="text-3xl font-black uppercase mb-4 tracking-tighter text-red-500 italic">Request Withdrawal</h2>
            <p className="text-xs font-bold opacity-60 mb-10 max-w-xs uppercase tracking-widest">
              State the objective reason for mission abortion. Cowardice is logged in neural history.
            </p>
            <div className="w-full max-w-xs space-y-4">
              <div className="relative">
                <Terminal className="absolute top-4 left-4 w-4 h-4 opacity-30" />
                <textarea
                  value={abortReason}
                  onChange={(e) => setAbortReason(e.target.value)}
                  placeholder="LOG REASON..."
                  className={`w-full rounded-3xl py-5 pl-12 pr-6 text-sm font-black outline-none border-2 transition-all resize-none h-32 uppercase placeholder:opacity-20 ${
                    theme === 'light' ? 'bg-white border-slate-200' : 'bg-white/5 border-white/10 focus:border-red-500'
                  }`}
                />
              </div>
              <button 
                disabled={!abortReason.trim()}
                onClick={() => setIsReasonConfirmed(true)}
                className="w-full py-5 bg-red-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 disabled:opacity-30 transition-all active:scale-95 shadow-xl shadow-red-600/20"
              >
                PROCEED TO ABORT <ChevronRight className="w-4 h-4" />
              </button>
              <button 
                onClick={() => { setIsEmergency(false); setAbortReason(''); }}
                className="w-full py-4 text-[10px] font-black uppercase tracking-[0.4em] opacity-30 hover:opacity-100 transition-opacity"
              >
                Return to Mission
              </button>
            </div>
          </>
        ) : (
          <>
            <Skull className="w-24 h-24 text-red-500 mb-8 animate-bounce" />
            <h2 className="text-4xl font-black uppercase mb-4 tracking-tighter text-red-500 italic">Terminal Reset</h2>
            <div className="bg-red-500/5 border border-red-500/20 rounded-3xl p-6 mb-12 max-w-sm w-full">
              <div className="flex items-center gap-2 mb-2 opacity-40">
                <Hash className="w-3 h-3" />
                <span className="text-[8px] font-black uppercase tracking-widest">Withdrawal Log Entry</span>
              </div>
              <p className="text-sm font-bold italic leading-relaxed text-left text-red-200">"{abortReason}"</p>
            </div>
            
            <div className="flex flex-col gap-4 w-full max-w-xs">
              <button 
                onClick={() => onEmergencyStop(abortReason)}
                className="w-full py-6 bg-red-600 text-white rounded-[2rem] font-black text-xl shadow-2xl shadow-red-600/40 active:scale-95 transition-all"
              >
                CONFIRM ABORT
              </button>
              <button 
                onClick={() => { setIsEmergency(false); setIsReasonConfirmed(false); setAbortReason(''); }}
                className="w-full py-6 bg-white/10 text-white rounded-[2rem] font-black text-xl backdrop-blur-md active:scale-95 transition-all border border-white/20"
              >
                CANCEL RESET
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 z-[500] ${themeStyles} flex flex-col items-center justify-between py-24 px-10 animate-in slide-in-from-bottom duration-700 font-mono-tactical overflow-hidden`}>
      {/* Background HUD Layers */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[size:40px_40px] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)]" />
      <div className="scanline opacity-10" />
      
      {/* Glitch Overlay */}
      {glitchActive && (
        <div className="absolute inset-0 z-50 bg-red-500/20 mix-blend-overlay animate-pulse" />
      )}

      {/* TOP HUD NAV */}
      <div className="w-full flex justify-between items-start relative z-10 max-w-md">
         <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
               <div className={`w-2 h-2 rounded-full ${statusColor} animate-pulse shadow-[0_0_10px_currentColor]`} />
               <span className="text-[9px] font-black uppercase tracking-[0.4em] opacity-60">Status: Secure</span>
            </div>
            <p className="text-[7px] font-black uppercase tracking-widest opacity-20">Uplink: HIGH_LATENCY_DISABLED</p>
         </div>
         <div className="text-right">
            <p className={`text-[12px] font-black uppercase tracking-widest ${statusColor}`}>
               Integrity: {Math.floor(integrity)}%
            </p>
            <div className="flex gap-1 justify-end mt-1">
               {[...Array(3)].map((_, i) => (
                 <div key={i} className={`w-3 h-1 rounded-full ${i < violationCount ? 'bg-red-500' : 'bg-white/20'}`} />
               ))}
            </div>
         </div>
      </div>

      <div className="text-center relative z-10 w-full flex-1 flex flex-col items-center justify-center">
        <div className="relative p-16">
          <HUDCorner position="tl" color={accentBorder} />
          <HUDCorner position="tr" color={accentBorder} />
          <HUDCorner position="bl" color={accentBorder} />
          <HUDCorner position="br" color={accentBorder} />
          
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
             <div className="p-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-xl">
               <Lock className={`w-6 h-6 ${violationCount > 0 ? 'text-amber-500' : 'text-sky-400'}`} />
             </div>
             <p className="text-[8px] font-black uppercase tracking-[0.4em] opacity-40">Protocol Locked</p>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-black uppercase opacity-40 tracking-[0.6em] mb-4 italic">{habitName || 'Deep Work'}</h2>
            <div className={`text-[9rem] font-black tracking-tighter leading-none select-none tabular-nums transition-all duration-500 ${glitchActive ? 'translate-x-1 scale-105 blur-[2px]' : ''}`}>
              {formatTime(timeLeft)}
            </div>
          </div>

          {/* Dynamic Integrity Meter */}
          <div className="mt-12 w-64 mx-auto">
             <div className="flex justify-between text-[7px] font-black uppercase tracking-widest opacity-30 mb-2">
                <span>Core Sync</span>
                <span>{violationCount}/3 Breaches</span>
             </div>
             <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/10">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${statusColor.replace('text-', 'bg-')}`} 
                  style={{ width: `${integrity}%` }} 
                />
             </div>
          </div>
        </div>
      </div>

      {/* BOTTOM ACTION AREA */}
      <div className="w-full max-w-sm relative z-10 flex flex-col gap-8">
        <div className="bg-black/40 border border-white/5 p-6 rounded-3xl backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-transparent pointer-events-none" />
          <div className="flex items-center gap-3 mb-3 opacity-30">
            <Terminal className="w-4 h-4" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em]">Field Intelligence</span>
          </div>
          <p className="text-xs font-bold opacity-80 leading-relaxed italic text-balance">
            {blockDistractions 
              ? "\"Commander, neural integrity is tied to physical isolation. Leaving this terminal triggers immediate AI disciplinary protocols.\"" 
              : "\"The baseline for elite performance is focused execution. Any shift in attention is a mission degradation.\""}
          </p>
        </div>
        
        <div className="flex flex-col gap-4">
          <button 
            onClick={() => setIsEmergency(true)}
            className="w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] bg-white/5 border border-white/10 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-500 transition-all flex items-center justify-center gap-3 group"
          >
            <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-700" /> 
            Initiate Emergency Reset
          </button>
          
          <div className="flex justify-between items-center px-4 opacity-10">
             <div className="flex gap-2">
                <div className="w-1 h-1 rounded-full bg-white" />
                <div className="w-1 h-1 rounded-full bg-white" />
                <div className="w-1 h-1 rounded-full bg-white" />
             </div>
             <p className="text-[6px] font-black uppercase tracking-widest italic">Auth: ALPHA-V // SIG: FOCUS_MOD_01</p>
             <div className="flex gap-2">
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

export default FocusProtocol;
