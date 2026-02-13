
import React, { useState } from 'react';
import { Star, X, Check, ArrowRight, ShieldCheck, Terminal, Zap, Activity, Cpu, Radio, Fingerprint, Database, MessageSquare } from 'lucide-react';
import { AppTheme } from '../types.ts';

interface RateUsModalProps {
  onClose: () => void;
  theme: AppTheme;
}

const HUDCorner = ({ position }: { position: 'tl' | 'tr' | 'bl' | 'br' }) => {
  const classes = {
    tl: "top-0 left-0 border-t-2 border-l-2",
    tr: "top-0 right-0 border-t-2 border-r-2",
    bl: "bottom-0 left-0 border-b-2 border-l-2",
    br: "bottom-0 right-0 border-b-2 border-r-2"
  }[position];
  return <div className={`absolute w-6 h-6 border-sky-500/30 ${classes} pointer-events-none`} />;
};

const RateUsModal: React.FC<RateUsModalProps> = ({ onClose, theme }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const themeStyles = {
    light: 'bg-white text-black border-slate-200 shadow-2xl backdrop-blur-3xl',
    dark: 'bg-[#050b18]/95 text-white border-blue-900 shadow-3xl backdrop-blur-2xl',
    cyber: 'bg-black text-[#00ff41] border-[#00ff41]'
  }[theme];

  const handleRatingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    setIsSubmitting(true);
    
    // Simulate tactical uplink
    setTimeout(() => {
      setSubmitted(true);
      setIsSubmitting(false);
      setTimeout(() => {
        onClose();
      }, 3000);
    }, 1500);
  };

  const getSyncStatus = (r: number) => {
    if (r === 0) return "Awaiting Input";
    if (r <= 2) return "Signal Degraded";
    if (r === 3) return "Standard Uplink";
    if (r === 4) return "High-Fidelity Sync";
    return "Peak Neural Optimization";
  };

  const inputStyle = theme === 'dark' ? 'bg-blue-950/50 border-blue-900 text-white' : 'bg-slate-50 border-slate-200 text-black';

  return (
    <div className="fixed inset-0 z-[1500] bg-sky-900/40 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className={`w-full max-w-sm rounded-[2.5rem] border-2 p-8 shadow-2xl relative animate-in zoom-in-95 duration-500 overflow-hidden font-mono-tactical ${themeStyles}`}>
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[size:20px_20px] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)]" />
        
        <HUDCorner position="tl" />
        <HUDCorner position="tr" />
        <HUDCorner position="bl" />
        <HUDCorner position="br" />

        {!submitted ? (
          <>
            <div className="flex justify-between items-start mb-8 relative z-10">
              <div>
                <div className="flex items-center gap-2 mb-1.5 opacity-40">
                  <Terminal className="w-3.5 h-3.5" />
                  <span className="text-[8px] font-black uppercase tracking-[0.3em]">Command Assessment</span>
                </div>
                <h2 className="text-2xl font-black uppercase tracking-tighter italic leading-none">Neural Feedback</h2>
              </div>
              <button onClick={onClose} className="p-2 opacity-50 hover:opacity-100 transition-opacity">
                <X className="w-5 h-5 text-sky-600" />
              </button>
            </div>

            <div className={`p-4 rounded-2xl border border-dashed mb-8 text-[11px] font-bold italic leading-relaxed ${theme === 'dark' ? 'bg-blue-950/20 border-blue-900 text-blue-200' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
              "Commander, your field evaluation directly influences core protocol optimization. Rate the current UI/UX fidelity."
            </div>

            <form onSubmit={handleRatingSubmit} className="space-y-8 relative z-10">
              <div className="space-y-4">
                <div className="flex justify-center gap-3">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isActive = (hoveredRating || rating) >= star;
                    return (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        onClick={() => setRating(star)}
                        className="relative p-1 transition-all active:scale-75 group"
                      >
                        {isActive && (
                          <div className="absolute inset-0 bg-sky-500/20 blur-xl rounded-full animate-pulse pointer-events-none" />
                        )}
                        <Star 
                          className={`w-10 h-10 transition-all duration-300 ${
                            isActive 
                              ? 'fill-sky-500 text-sky-500 drop-shadow-[0_0_12px_rgba(14,165,233,0.6)] scale-110' 
                              : 'text-sky-200/20'
                          }`} 
                        />
                        {isActive && (
                          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full animate-ping" />
                        )}
                      </button>
                    );
                  })}
                </div>
                
                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-center gap-2">
                    <Activity className={`w-3 h-3 ${rating > 0 ? 'text-sky-500 animate-pulse' : 'opacity-20'}`} />
                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${rating > 0 ? 'text-sky-500' : 'opacity-30'}`}>
                      {getSyncStatus(rating)}
                    </span>
                  </div>
                  <div className={`h-1 w-32 rounded-full overflow-hidden transition-all ${theme === 'dark' ? 'bg-blue-950' : 'bg-slate-100'}`}>
                    <div 
                      className="h-full bg-sky-500 transition-all duration-700 shadow-[0_0_10px_rgba(14,165,233,0.5)]" 
                      style={{ width: `${(rating / 5) * 100}%` }} 
                    />
                  </div>
                </div>
              </div>

              {rating > 0 && (
                <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <div className="relative">
                    <div className="absolute top-4 left-4 opacity-20"><MessageSquare className="w-4 h-4" /></div>
                    <textarea
                      placeholder="Enter tactical field report (optional)..."
                      className={`w-full rounded-2xl py-4 pl-12 pr-6 text-[11px] font-bold outline-none border-2 transition-all resize-none h-28 placeholder:opacity-30 ${inputStyle} focus:border-sky-500/50`}
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                    />
                    <div className="absolute bottom-3 right-3 opacity-10 pointer-events-none">
                      <Fingerprint className="w-6 h-6" />
                    </div>
                  </div>
                  
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all relative overflow-hidden group ${
                      theme === 'cyber' ? 'bg-[#00ff41] text-black shadow-[#00ff41]/20' : 'bg-sky-600 text-white shadow-sky-500/20'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCcw className="w-4 h-4 animate-spin" />
                        ENCRYPTING PACKET...
                      </>
                    ) : (
                      <>
                        INITIALIZE UPLINK <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  </button>
                </div>
              )}
            </form>

            <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center opacity-20">
               <div className="flex items-center gap-2">
                 <Database className="w-3 h-3" />
                 <span className="text-[7px] font-black uppercase tracking-widest">Protocol Sync: V4.1</span>
               </div>
               <div className="flex items-center gap-2">
                 <span className="text-[7px] font-black uppercase tracking-widest">Secure Link</span>
                 <ShieldCheck className="w-3 h-3" />
               </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12 animate-in fade-in zoom-in-95 duration-700 relative z-10">
            <div className="relative mb-10 inline-block">
              <div className="absolute inset-0 bg-emerald-500 blur-3xl opacity-30 animate-pulse" />
              <div className="w-24 h-24 rounded-[2.5rem] bg-emerald-500/10 border-4 border-emerald-500 flex items-center justify-center relative z-10 shadow-2xl shadow-emerald-500/20">
                <ShieldCheck className="w-12 h-12 text-emerald-500" />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-black text-[8px] font-black px-3 py-1 rounded-full border-2 border-black">
                VERIFIED
              </div>
            </div>
            
            <h3 className="text-2xl font-black uppercase tracking-tighter italic mb-4">Signal Secured</h3>
            
            <div className={`p-5 rounded-2xl border-2 mb-8 ${theme === 'dark' ? 'bg-blue-950/20 border-blue-900/50' : 'bg-slate-50 border-slate-100'}`}>
              <p className="text-[12px] font-bold italic leading-relaxed text-balance text-sky-100">
                "Intelligence received, Commander. Data packets have been integrated into the core neural network. Operational refinement in progress."
              </p>
            </div>

            <div className="flex items-center justify-center gap-4 opacity-30">
               <Zap className="w-3 h-3 animate-bounce" />
               <span className="text-[8px] font-black uppercase tracking-[0.5em]">Synchronizing</span>
               <Activity className="w-3 h-3 animate-pulse" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Internal icon for consistency
const RefreshCcw = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
);

export default RateUsModal;
