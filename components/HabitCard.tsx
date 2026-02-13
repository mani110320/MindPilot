
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Habit, CompletionLog, CompletionStatus } from '../types.ts';
import { CheckCircle2, Circle, Clock, Flame, ShieldCheck, MoreVertical, Edit3, Trash2, XCircle, ArrowUpRight, Activity } from 'lucide-react';

interface HabitCardProps {
  habit: Habit;
  logs: CompletionLog[];
  onToggle: (habitId: string) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (habitId: string) => void;
  theme?: 'light' | 'dark' | 'cyber';
}

const HabitCard: React.FC<HabitCardProps> = ({ habit, logs, onToggle, onEdit, onDelete, theme = 'light' }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const today = new Date().toLocaleDateString();
  const todayLog = logs.find(l => l.habitId === habit.id && new Date(l.timestamp).toLocaleDateString() === today);
  const isCompleted = todayLog?.status === CompletionStatus.SUCCESS;
  const isFailed = todayLog?.status === CompletionStatus.FAIL;

  // Last 7 days sparkline data
  const sparklineData = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString();
      const log = logs.find(l => l.habitId === habit.id && new Date(l.timestamp).toLocaleDateString() === dateStr);
      return log?.status === CompletionStatus.SUCCESS;
    }).reverse();
  }, [logs, habit.id]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false); };
    if (showMenu) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showMenu]);

  const styles = {
    light: { 
      card: 'bg-white/80 border-sky-100 shadow-xl backdrop-blur-md', 
      text: 'text-black', 
      muted: 'text-sky-400', 
      menu: 'bg-white border-sky-100 shadow-2xl', 
      accent: 'bg-sky-500',
      sparkActive: 'bg-sky-500',
      sparkEmpty: 'bg-sky-100/50'
    },
    dark: { 
      card: 'bg-slate-900/60 border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.4)] backdrop-blur-md', 
      text: 'text-white', 
      muted: 'text-slate-500', 
      menu: 'bg-slate-900 border-slate-800 shadow-2xl', 
      accent: 'bg-sky-600',
      sparkActive: 'bg-sky-400',
      sparkEmpty: 'bg-slate-800'
    },
    cyber: { 
      card: 'bg-black border-[#00ff41]/30 shadow-[0_0_15px_rgba(0,255,65,0.05)]', 
      text: 'text-[#00ff41]', 
      muted: 'text-[#008f11]', 
      menu: 'bg-black border-2 border-[#00ff41] shadow-[0_0_20px_rgba(0,255,65,0.2)]', 
      accent: 'bg-[#00ff41]',
      sparkActive: 'bg-[#00ff41]',
      sparkEmpty: 'bg-[#00ff41]/10'
    }
  }[theme];

  return (
    <div className={`relative flex flex-col p-5 rounded-[2rem] border transition-all duration-300 overflow-hidden group glass-card ${styles.card} ${isCompleted ? 'opacity-60' : ''}`}>
      {/* Background Subtle Gradient */}
      <div className={`absolute inset-0 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-700 ${styles.accent}`} />
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Interactive Toggle */}
          <button 
            onClick={() => onToggle(habit.id)} 
            disabled={isCompleted || isFailed} 
            className={`shrink-0 transition-all duration-300 ${isCompleted ? 'text-emerald-500 scale-110 drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]' : isFailed ? 'text-red-500' : `text-sky-200 group-hover:text-sky-500 hover:scale-105 active:scale-90`}`}
          >
            {isCompleted ? <CheckCircle2 className="w-10 h-10" /> : isFailed ? <XCircle className="w-10 h-10" /> : <Circle className="w-10 h-10" strokeWidth={1.5} />}
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className={`font-black uppercase tracking-tight text-base truncate ${styles.text} ${isCompleted ? 'line-through opacity-40' : ''}`}>
                {habit.name}
              </h3>
              {habit.distractionBlocker && <ShieldCheck className="w-3.5 h-3.5 text-sky-400 opacity-60" />}
            </div>
            <div className="flex items-center gap-4">
              <div className={`flex items-center text-[9px] font-black uppercase tracking-[0.2em] ${styles.muted}`}>
                <Clock className="w-3 h-3 mr-1.5 opacity-60" />
                {habit.time}
              </div>
              <div className={`flex items-center text-[9px] font-black uppercase tracking-[0.2em] ${theme === 'cyber' ? 'text-[#00ff41]' : 'text-sky-500'}`}>
                <Flame className="w-3 h-3 mr-1 fill-current opacity-60" />
                {habit.streak} Streak
              </div>
            </div>
          </div>
        </div>

        <div className="relative flex items-center gap-1" ref={menuRef}>
           {/* Mini Sparkline HUD */}
           <div className={`flex gap-0.5 h-4 items-end px-2 border-r mr-1 ${theme === 'dark' ? 'border-white/5' : 'border-sky-100/50'}`}>
              {sparklineData.map((s, i) => (
                <div key={i} className={`w-1 rounded-full transition-all ${s ? styles.sparkActive + ' h-full shadow-[0_0_4px_rgba(14,165,233,0.3)]' : styles.sparkEmpty + ' h-1.5'}`} />
              ))}
           </div>

          <button 
            onClick={() => setShowMenu(!showMenu)} 
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${showMenu ? 'bg-sky-600 text-white' : (theme === 'dark' ? 'text-slate-500 hover:bg-slate-800' : 'text-sky-300 hover:bg-sky-50')}`}
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {showMenu && (
            <div className={`absolute right-0 top-full mt-3 w-52 py-2 rounded-2xl z-[100] animate-in fade-in zoom-in-95 duration-200 border ${styles.menu} backdrop-blur-2xl`}>
              <button onClick={() => { onEdit(habit); setShowMenu(false); }} className={`w-full px-5 py-4 text-left flex items-center justify-between text-[11px] font-black uppercase tracking-widest ${styles.text} hover:bg-sky-500/10 transition-colors`}>
                <span className="flex items-center gap-4"><Edit3 className="w-4 h-4" /> Edit Protocol</span>
              </button>
              <button onClick={() => { onDelete(habit.id); setShowMenu(false); }} className="w-full px-5 py-4 text-left flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 transition-colors">
                <span className="flex items-center gap-4"><Trash2 className="w-4 h-4" /> Delete Habit</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Adaptive Metadata HUD Footer */}
      <div className="flex items-center justify-between mt-1 px-1">
        <div className="flex gap-3">
          <div className="flex items-center gap-1.5">
            <div className={`w-1 h-1 rounded-full ${isCompleted ? 'bg-emerald-500' : isFailed ? 'bg-red-500' : 'bg-sky-200'} animate-pulse`} />
            <span className={`text-[7px] font-black uppercase tracking-[0.3em] opacity-40 ${styles.text}`}>
              {isCompleted ? 'Mission Secured' : isFailed ? 'Protocol Breach' : 'Awaiting Uplink'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-20 group-hover:opacity-40 transition-opacity">
          <Activity className="w-2.5 h-2.5" />
          <span className="text-[7px] font-black uppercase tracking-widest font-mono-tactical">SEC-0A1</span>
        </div>
      </div>

      {/* Full Width Progress Trace */}
      <div className={`absolute left-0 bottom-0 h-1 w-full ${theme === 'dark' ? 'bg-slate-800/40' : 'bg-sky-100/30'}`}>
        <div 
          className={`h-full transition-all duration-1000 ease-out ${isCompleted ? 'bg-emerald-500 w-full shadow-[0_0_10px_rgba(16,185,129,0.4)]' : isFailed ? 'bg-red-500 w-full' : 'bg-sky-400 w-[8%]'}`} 
          style={{ width: isCompleted || isFailed ? '100%' : '8%' }}
        />
      </div>
    </div>
  );
};

export default HabitCard;
