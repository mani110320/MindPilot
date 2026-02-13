
import React from 'react';
import { CompletionLog, Habit, CompletionStatus, Difficulty } from '../types.ts';
import { Terminal, ShieldCheck, ShieldAlert, Clock, Info, ChevronRight, Activity, Database, Hash, FileText } from 'lucide-react';

interface HistoryModuleProps {
  habits: Habit[];
  logs: CompletionLog[];
  theme: 'light' | 'dark' | 'cyber';
}

const HistoryModule: React.FC<HistoryModuleProps> = ({ habits, logs, theme }) => {
  // Sort logs by timestamp (newest first)
  const sortedLogs = [...logs].sort((a, b) => b.timestamp - a.timestamp);

  const themeStyles = {
    light: {
      card: 'bg-white border-slate-100 shadow-xl',
      textPrimary: 'text-black',
      textMuted: 'text-slate-400',
      panel: 'bg-slate-50',
      accent: 'text-sky-600',
    },
    dark: {
      card: 'bg-[#050b18]/80 border-blue-900/50 shadow-2xl backdrop-blur-xl',
      textPrimary: 'text-white',
      textMuted: 'text-blue-500',
      panel: 'bg-blue-950/20',
      accent: 'text-sky-400',
    },
    cyber: {
      card: 'bg-black border-[#00ff41]/40 shadow-[0_0_20px_rgba(0,255,65,0.05)]',
      textPrimary: 'text-[#00ff41]',
      textMuted: 'text-[#008f11]',
      panel: 'bg-black/40',
      accent: 'text-[#00ff41]',
    }
  }[theme];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
      {/* HEADER HUD */}
      <div className={`p-8 rounded-[2.5rem] border-2 transition-all duration-500 relative overflow-hidden ${themeStyles.card}`}>
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
          <FileText className="w-24 h-24" />
        </div>

        <div className="flex justify-between items-center relative z-10">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl ${theme === 'cyber' ? 'bg-[#00ff41]/10' : 'bg-sky-600/10'} flex items-center justify-center border ${theme === 'cyber' ? 'border-[#00ff41]/20' : 'border-sky-500/20'}`}>
              <Database className={`w-7 h-7 ${theme === 'cyber' ? 'text-[#00ff41]' : 'text-sky-600'}`} />
            </div>
            <div>
              <h3 className={`text-lg font-black uppercase tracking-tight ${themeStyles.textPrimary}`}>Archive Access</h3>
              <p className="text-[9px] font-black uppercase opacity-40 tracking-widest mt-1">Full Mission History Logs</p>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-3xl font-black font-mono-tactical ${themeStyles.textPrimary}`}>{logs.length.toString().padStart(3, '0')}</p>
            <p className="text-[7px] font-black uppercase tracking-widest opacity-30">Total Packets</p>
          </div>
        </div>
      </div>

      {/* LOG FEED */}
      <div className="space-y-4">
        {sortedLogs.length > 0 ? (
          sortedLogs.map((log) => {
            const habit = habits.find(h => h.id === log.habitId);
            const isSuccess = log.status === CompletionStatus.SUCCESS;
            const date = new Date(log.timestamp);
            
            return (
              <div key={log.id} className={`p-5 rounded-[2.5rem] border-2 transition-all duration-300 group ${themeStyles.card} hover:scale-[1.01] active:scale-[0.98]`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isSuccess ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                      {isSuccess ? <ShieldCheck className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
                    </div>
                    <div>
                      <h4 className={`text-base font-black uppercase tracking-tight ${themeStyles.textPrimary}`}>
                        {habit?.name || 'Decommissioned Protocol'}
                      </h4>
                      <div className="flex items-center gap-3 mt-1.5">
                        <div className="flex items-center gap-1.5 opacity-40">
                          <Clock className="w-3 h-3" />
                          <span className="text-[9px] font-black uppercase tracking-widest">
                            {date.toLocaleDateString([], { month: 'short', day: 'numeric' })} @ {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className={`px-2 py-0.5 rounded-md text-[7px] font-black uppercase tracking-widest border ${
                          log.difficulty === Difficulty.HARD ? 'bg-red-500/10 border-red-500/20 text-red-500' : 
                          log.difficulty === Difficulty.MEDIUM ? 'bg-sky-500/10 border-sky-500/20 text-sky-500' : 
                          'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                        }`}>
                          {log.difficulty} Load
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-[9px] font-black uppercase tracking-[0.2em] mb-1 ${isSuccess ? 'text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'text-red-500'}`}>
                      {isSuccess ? 'MISSION SECURED' : 'BREACH DETECTED'}
                    </div>
                    <div className="text-[7px] font-black uppercase tracking-widest opacity-20 font-mono-tactical">
                      UID: {log.id.toUpperCase().slice(0, 6)}
                    </div>
                  </div>
                </div>

                {log.notes && (
                  <div className={`mt-4 p-4 rounded-2xl border border-dashed relative overflow-hidden group/note ${theme === 'dark' ? 'bg-blue-950/20 border-blue-900/50 text-blue-100/70' : 'bg-slate-50 border-slate-200 text-slate-500'} text-[11px] font-bold italic leading-relaxed`}>
                    <div className="flex items-center gap-2 mb-2.5 opacity-30">
                      <Terminal className="w-3.5 h-3.5" />
                      <span className="text-[8px] font-black uppercase tracking-[0.3em]">Field Intelligence</span>
                    </div>
                    <p className="relative z-10">"{log.notes}"</p>
                    <div className="absolute top-0 right-0 p-3 opacity-0 group-hover/note:opacity-10 transition-opacity">
                      <Hash className="w-4 h-4" />
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="py-24 text-center">
            <div className="w-20 h-20 rounded-[2rem] bg-slate-50 flex items-center justify-center mx-auto mb-6 opacity-20">
               <Hash className="w-10 h-10" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.5em] opacity-20">No archived log packets detected in this sector.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryModule;
