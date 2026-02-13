
import React, { useMemo, useState } from 'react';
import { Habit, CompletionLog, CompletionStatus, Difficulty } from '../types.ts';
import { Check, X, Shield, Activity, Target, Zap, Cpu, Layers, TrendingUp, BarChart, Crosshair, ChevronRight, Info, Calendar, ChevronLeft, Plus, Clock, Terminal, ShieldCheck, Radar, Hash, ZapOff, Fingerprint, ShieldAlert, FileText } from 'lucide-react';

interface CalendarModuleProps {
  habits: Habit[];
  logs: CompletionLog[];
  theme: 'light' | 'dark' | 'cyber';
  onAddProtocol?: () => void;
}

const HUDCorner = ({ position, theme }: { position: 'tl' | 'tr' | 'bl' | 'br', theme: string }) => {
  const accent = theme === 'cyber' ? 'border-[#00ff41]' : 'border-sky-500';
  const classes = {
    tl: "top-0 left-0 border-t border-l",
    tr: "top-0 right-0 border-t border-r",
    bl: "bottom-0 left-0 border-b border-l",
    br: "bottom-0 right-0 border-b border-r"
  }[position];
  return <div className={`absolute w-3 h-3 ${accent} opacity-30 ${classes} pointer-events-none`} />;
};

const CalendarModule: React.FC<CalendarModuleProps> = ({ habits, logs, theme, onAddProtocol }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // --- CALENDAR HUD LOGIC ---
  const daysInMonth = useMemo(() => new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate(), [currentDate]);
  const firstDayOfMonth = useMemo(() => new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(), [currentDate]);
  const monthName = useMemo(() => currentDate.toLocaleString('default', { month: 'long' }), [currentDate]);
  const year = currentDate.getFullYear();

  const calendarDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  }, [daysInMonth, firstDayOfMonth]);

  const isToday = (day: number | null) => {
    if (!day) return false;
    const today = new Date();
    return today.getDate() === day && today.getMonth() === currentDate.getMonth() && today.getFullYear() === currentDate.getFullYear();
  };

  const getDayStatus = (day: number | null) => {
    if (!day) return null;
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toLocaleDateString();
    const dayLogs = logs.filter(l => new Date(l.timestamp).toLocaleDateString() === dateStr);
    const successes = dayLogs.filter(l => l.status === CompletionStatus.SUCCESS).length;
    if (successes > 0) return 'success';
    const failures = dayLogs.filter(l => l.status === CompletionStatus.FAIL).length;
    if (failures > 0) return 'fail';
    return 'none';
  };

  const getSelectedDayIntel = () => {
    if (!selectedDay) return [];
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDay).toLocaleDateString();
    return logs.filter(l => new Date(l.timestamp).toLocaleDateString() === dateStr);
  };

  const themeStyles = {
    light: {
      card: 'bg-[#2b2e3b] text-white shadow-2xl',
      gridText: 'text-slate-400',
      dayText: 'text-white/90',
      selectedDay: 'bg-slate-700 ring-2 ring-slate-500 shadow-[0_0_15px_rgba(255,255,255,0.1)]',
      panel: 'bg-white border-slate-200',
      textPrimary: 'text-black',
      textMuted: 'text-slate-500',
      heatmapBg: 'bg-slate-50',
      cellEmpty: 'bg-slate-100 border-slate-200',
      modal: 'bg-white border-slate-200 text-slate-900 shadow-3xl'
    },
    dark: {
      card: 'bg-[#2b2e3b] text-white shadow-2xl',
      gridText: 'text-slate-500',
      dayText: 'text-white',
      selectedDay: 'bg-slate-700 ring-2 ring-slate-500 shadow-[0_0_15_rgba(255,255,255,0.1)]',
      panel: 'bg-blue-950/20 border-blue-900/50',
      textPrimary: 'text-white',
      textMuted: 'text-blue-500',
      heatmapBg: 'bg-blue-950/20',
      cellEmpty: 'bg-blue-950/40 border-white/5',
      modal: 'bg-[#050b18]/95 border-blue-900 text-white shadow-3xl backdrop-blur-xl'
    },
    cyber: {
      card: 'bg-black border-[#00ff41] shadow-[0_0_30px_rgba(0,255,65,0.1)]',
      gridText: 'text-[#00ff41]/40',
      dayText: 'text-[#00ff41]',
      selectedDay: 'bg-[#00ff41]/10 ring-2 ring-[#00ff41]/50 shadow-[0_0_15px_rgba(0,255,65,0.3)]',
      panel: 'bg-black border-[#00ff41]/20',
      textPrimary: 'text-[#00ff41]',
      textMuted: 'text-[#008f11]',
      heatmapBg: 'bg-black',
      cellEmpty: 'bg-black border-[#00ff41]/10',
      modal: 'bg-black border-[#00ff41] text-[#00ff41] shadow-[0_0_50px_rgba(0,255,65,0.2)]'
    }
  }[theme];

  const tomorrowMetrics = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayIdx = tomorrow.getDay();
    const tomorrowHabits = habits.filter(h => {
      if (h.recurrenceMode === 'interval' && h.interval) {
        const start = new Date(h.createdAt);
        start.setHours(0, 0, 0, 0);
        const t = new Date(tomorrow);
        t.setHours(0, 0, 0, 0);
        const diffDays = Math.floor((t.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays % h.interval === 0;
      }
      return h.days.includes(dayIdx);
    });
    return { count: tomorrowHabits.length, protocols: tomorrowHabits };
  }, [habits]);

  const heatmapWeeks = useMemo(() => {
    const weeks = [];
    for (let i = 0; i < 4; i++) {
      const week = [];
      for (let j = 0; j < 7; j++) {
        const d = new Date();
        const offset = (3 - i) * 7 + (6 - j);
        d.setDate(d.getDate() - offset);
        d.setHours(0, 0, 0, 0);
        week.push(d);
      }
      weeks.push(week.reverse());
    }
    return weeks;
  }, []);

  const getIntensity = (date: Date) => {
    const dateStr = date.toLocaleDateString();
    const dayLogs = logs.filter(l => new Date(l.timestamp).toLocaleDateString() === dateStr && l.status === CompletionStatus.SUCCESS);
    if (dayLogs.length === 0) return 0;
    return Math.min(dayLogs.length / Math.max(habits.length, 1), 1);
  };

  const selectedIntel = getSelectedDayIntel();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 relative">
      
      {/* TACTICAL DAY INTEL MODAL */}
      {selectedDay && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedDay(null)} />
          <div className={`w-full max-w-sm rounded-[2.5rem] border-2 p-8 relative animate-in zoom-in-95 duration-500 ${themeStyles.modal}`}>
            <HUDCorner position="tl" theme={theme} />
            <HUDCorner position="tr" theme={theme} />
            <HUDCorner position="bl" theme={theme} />
            <HUDCorner position="br" theme={theme} />
            
            <div className="flex justify-between items-start mb-8">
              <div>
                <div className="flex items-center gap-2 mb-1.5 opacity-40">
                  <Fingerprint className="w-3.5 h-3.5" />
                  <span className="text-[8px] font-black uppercase tracking-[0.3em]">Day Archive Retrieval</span>
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight italic leading-none">
                  {new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDay).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                </h3>
              </div>
              <button onClick={() => setSelectedDay(null)} className="p-2 opacity-50 hover:opacity-100 transition-opacity">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 max-h-[40vh] overflow-y-auto custom-scrollbar pr-2">
              {selectedIntel.length > 0 ? (
                selectedIntel.map((log) => {
                  const habit = habits.find(h => h.id === log.habitId);
                  const isSuccess = log.status === CompletionStatus.SUCCESS;
                  return (
                    <div key={log.id} className={`p-4 rounded-2xl border flex items-center justify-between ${theme === 'dark' ? 'bg-blue-900/10 border-blue-900/30' : 'bg-slate-50 border-slate-100'}`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSuccess ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                          {isSuccess ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className={`text-[10px] font-black uppercase tracking-tight ${themeStyles.textPrimary}`}>{habit?.name || 'Protocol Unknown'}</p>
                          <p className={`text-[7px] font-black uppercase tracking-widest opacity-40 mt-0.5`}>
                            Logged @ {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      <div className={`text-[8px] font-black uppercase tracking-widest ${isSuccess ? 'text-emerald-500' : 'text-red-500'}`}>
                        {isSuccess ? 'Secured' : 'Breached'}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center opacity-30">
                  <ZapOff className="w-10 h-10 mx-auto mb-4" />
                  <p className="text-[9px] font-black uppercase tracking-[0.4em]">No activity detected in this temporal sector.</p>
                </div>
              )}
            </div>

            <button 
              onClick={() => setSelectedDay(null)}
              className={`w-full mt-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-2 transition-all active:scale-95 ${
                theme === 'cyber' ? 'bg-[#00ff41] text-black shadow-[#00ff41]/20' : 'bg-sky-600 text-white shadow-sky-500/20'
              }`}
            >
              Close Intel <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
      
      {/* TACTICAL CALENDAR HUD */}
      <div className={`p-10 rounded-[2.5rem] transition-all duration-500 flex flex-col relative overflow-hidden ${themeStyles.card}`}>
        <HUDCorner position="tl" theme={theme} />
        <HUDCorner position="tr" theme={theme} />
        <HUDCorner position="bl" theme={theme} />
        <HUDCorner position="br" theme={theme} />
        
        <div className="flex justify-between items-center mb-14 relative z-10">
          <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-2 opacity-30 hover:opacity-100 transition-opacity">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h2 className="text-2xl font-black tracking-tight uppercase leading-none">{monthName} {year}</h2>
            <p className="text-[7px] font-black uppercase tracking-[0.6em] opacity-30 mt-2">Operational Cycle Tracking</p>
          </div>
          <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-2 opacity-30 hover:opacity-100 transition-opacity">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-y-10 text-center relative z-10 mb-10">
          {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (
            <span key={d} className={`text-[10px] font-black tracking-widest ${themeStyles.gridText}`}>
              {d}
            </span>
          ))}
          
          {calendarDays.map((day, i) => {
            const status = getDayStatus(day);
            const active = isToday(day);
            
            return (
              <div key={i} className="flex flex-col items-center justify-center relative">
                <button 
                  disabled={!day}
                  onClick={() => day && setSelectedDay(day)}
                  className={`w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300 relative group active:scale-90 ${active ? themeStyles.selectedDay : 'hover:bg-white/5'}`}
                >
                  <span className={`text-base font-bold font-mono-tactical ${day ? themeStyles.dayText : 'opacity-0'} ${active ? 'text-white scale-110' : 'opacity-80'}`}>
                    {day}
                  </span>
                  {status === 'success' && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981]" />
                  )}
                  {status === 'fail' && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-red-500 rounded-full" />
                  )}
                  
                  {/* Subtle hover effect for numbers */}
                  {day && !active && (
                    <div className="absolute inset-0 border border-white/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity scale-90 group-hover:scale-100" />
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* TACTICAL GRID LEGEND */}
        <div className="mt-auto pt-6 border-t border-white/5 flex flex-wrap justify-center gap-6 relative">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_#10b981]" />
            <span className="text-[7px] font-black uppercase tracking-widest opacity-40">Mission Secured</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full shadow-[0_0_8px_#ef4444]" />
            <span className="text-[7px] font-black uppercase tracking-widest opacity-40">Protocol Breach</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full border border-white/20 flex items-center justify-center`}>
               <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
            </div>
            <span className="text-[7px] font-black uppercase tracking-widest opacity-40">Active Sector</span>
          </div>
        </div>
      </div>

      {/* MISSION PROJECTION */}
      <div className={`p-8 rounded-[2.5rem] border-2 transition-all duration-500 relative overflow-hidden ${themeStyles.panel}`}>
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
          <Radar className="w-24 h-24" />
        </div>

        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl ${theme === 'cyber' ? 'bg-[#00ff41]/10' : 'bg-sky-600/10'} flex items-center justify-center border ${theme === 'cyber' ? 'border-[#00ff41]/20' : 'border-sky-500/20'}`}>
              <Zap className={`w-6 h-6 ${theme === 'cyber' ? 'text-[#00ff41]' : 'text-sky-600'}`} />
            </div>
            <div>
              <h3 className={`text-sm font-black uppercase tracking-[0.2em] ${themeStyles.textPrimary}`}>Mission Projection</h3>
              <p className="text-[9px] font-black uppercase opacity-40 tracking-widest mt-1">Tomorrow's Protocol Loadout</p>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-2xl font-black font-mono-tactical ${themeStyles.textPrimary}`}>{tomorrowMetrics.count.toString().padStart(2, '0')}</p>
            <p className="text-[7px] font-black uppercase tracking-widest opacity-30">Active Uplinks</p>
          </div>
        </div>

        <div className="space-y-3 mb-8">
          {tomorrowMetrics.protocols.length > 0 ? (
            tomorrowMetrics.protocols.slice(0, 3).map((p, idx) => (
              <div key={idx} className={`p-4 rounded-2xl flex items-center justify-between border ${theme === 'dark' ? 'bg-blue-900/10 border-blue-900/30' : 'bg-slate-50 border-slate-100'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                  <span className={`text-[10px] font-black uppercase tracking-tight ${themeStyles.textPrimary}`}>{p.name}</span>
                </div>
                <span className="text-[9px] font-black font-mono-tactical opacity-40">{p.time}</span>
              </div>
            ))
          ) : (
            <div className={`p-6 rounded-2xl border border-dashed text-center ${theme === 'dark' ? 'border-blue-900/50' : 'border-slate-200'}`}>
               <p className="text-[10px] font-black uppercase tracking-widest opacity-30">No Objectives Primed</p>
            </div>
          )}
          {tomorrowMetrics.count > 3 && (
            <p className="text-[8px] font-black uppercase tracking-widest opacity-20 text-center">+{tomorrowMetrics.count - 3} additional protocols</p>
          )}
        </div>

        <div className="flex gap-3">
          <button 
            onClick={onAddProtocol}
            className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all ${
              theme === 'cyber' ? 'bg-[#00ff41] text-black shadow-[#00ff41]/20' : 'bg-sky-600 text-white shadow-sky-500/20'
            }`}
          >
            <Plus className="w-4 h-4" /> Deploy tomorrow
          </button>
        </div>
      </div>

      {/* IMPROVED TACTICAL CONSISTENCY GRID */}
      <div className={`p-8 rounded-[2.5rem] border-2 transition-all duration-500 relative overflow-hidden ${themeStyles.panel}`}>
        <div className="flex justify-between items-center mb-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
               <Fingerprint className={`w-3.5 h-3.5 ${theme === 'cyber' ? 'text-[#00ff41]' : 'text-sky-500'}`} />
               <h3 className={`text-[10px] font-black uppercase tracking-[0.4em] opacity-40 ${themeStyles.textPrimary}`}>Tactical Consistency Grid</h3>
            </div>
            <p className="text-[7px] font-black uppercase tracking-widest opacity-20 ml-5">Rolling 28-Day Adherence Intensity</p>
          </div>
          <div className="flex flex-col items-end gap-1 opacity-20">
             <div className="flex items-center gap-1">
                <span className="text-[6px] font-black uppercase">Grid Status</span>
                <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
             </div>
             <Activity className="w-3 h-3" />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {heatmapWeeks.map((week, weekIdx) => (
            <div key={weekIdx} className="flex items-center gap-4">
              <div className="w-8 flex flex-col items-end">
                 <span className="text-[7px] font-black uppercase opacity-20 tracking-tighter">SEC</span>
                 <span className={`text-[9px] font-black font-mono-tactical ${themeStyles.textPrimary}`}>{(weekIdx + 1).toString().padStart(2, '0')}</span>
              </div>
              
              <div className="flex-1 flex justify-between gap-1.5">
                {week.map((date, dayIdx) => {
                  const intensity = getIntensity(date);
                  const isTodayDate = date.toLocaleDateString() === new Date().toLocaleDateString();
                  const accentColor = theme === 'cyber' ? '#00ff41' : '#0ea5e9';
                  
                  return (
                    <div 
                      key={dayIdx} 
                      className={`flex-1 aspect-square rounded-md border transition-all duration-700 group relative flex items-center justify-center overflow-hidden ${
                        intensity === 0 
                          ? themeStyles.cellEmpty
                          : 'border-transparent'
                      } ${isTodayDate ? 'ring-1 ring-offset-2 ring-sky-500' : ''}`}
                      style={{ 
                        backgroundColor: intensity > 0 ? `${accentColor}${Math.round((0.1 + intensity * 0.9) * 255).toString(16).padStart(2, '0')}` : undefined,
                        boxShadow: intensity > 0.8 ? `0 0 15px ${accentColor}40` : 'none'
                      }}
                    >
                      {/* Interactive Tooltip HUD */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
                         <div className="flex flex-col items-center gap-0.5">
                            <span className="text-[5px] font-black text-white leading-none">{Math.round(intensity * 100)}%</span>
                         </div>
                      </div>

                      {/* Cell Design Decoration */}
                      {intensity > 0.5 && (
                        <div className="absolute inset-0.5 border-[0.5px] border-white/20 rounded-sm pointer-events-none" />
                      )}
                      
                      {/* Date Hover State */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-1.5 bg-black text-white text-[7px] rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 font-black uppercase tracking-[0.2em] shadow-2xl border border-white/10 transition-all scale-75 group-hover:scale-100">
                        <div className="flex items-center gap-2">
                           <Calendar className="w-2.5 h-2.5 text-sky-500" />
                           {date.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </div>
                        <div className="h-px bg-white/10 my-1" />
                        <div className="flex justify-between items-center gap-4">
                           <span>SYNC:</span>
                           <span className="text-sky-400">{Math.round(intensity * 100)}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* HUD FOOTER / LEGEND */}
        <div className="mt-10 pt-8 border-t border-white/5 flex items-end justify-between relative">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 rounded-full bg-[#2b2e3b] border border-white/5">
              <span className="text-[6px] font-black uppercase tracking-[0.4em] opacity-40">Load Intensity</span>
           </div>
           
           <div className="flex items-center gap-6">
             <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-sm ${themeStyles.cellEmpty} opacity-40`} />
                <span className="text-[7px] font-black uppercase tracking-widest opacity-30 italic">Minimal</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-sm bg-sky-500" />
                <span className="text-[7px] font-black uppercase tracking-widest opacity-30 italic">Peak Sync</span>
             </div>
           </div>

           <div className="flex flex-col items-end gap-1.5">
             <div className="flex items-center gap-2 opacity-20">
               <Terminal className="w-3.5 h-3.5 text-sky-500" />
               <span className="text-[8px] font-black uppercase tracking-widest">Sys Integrity Checked</span>
             </div>
             <div className="text-[6px] font-bold opacity-10 uppercase tracking-widest">Auth: COMMANDER-01 // SIG: Alpha-V</div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarModule;
