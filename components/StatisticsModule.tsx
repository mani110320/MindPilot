
import React, { useMemo } from 'react';
import { Habit, CompletionLog, CompletionStatus, AppTheme } from '../types.ts';
import { 
  Activity, Shield, AlertCircle, PieChart, CheckCircle2, 
  Cpu, TrendingUp, BarChart3, Clock, Layout,
  Zap, AlertTriangle, ShieldCheck, Terminal, 
  ChevronRight, Radio, Waves, Target, Hash
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell 
} from 'recharts';

interface StatisticsModuleProps {
  habits: Habit[];
  logs: CompletionLog[];
  theme: AppTheme;
}

const HUDCorner = ({ position }: { position: 'tl' | 'tr' | 'bl' | 'br' }) => {
  const classes = {
    tl: "top-0 left-0 border-t border-l",
    tr: "top-0 right-0 border-t border-r",
    bl: "bottom-0 left-0 border-b border-l",
    br: "bottom-0 right-0 border-b border-r"
  }[position];
  return <div className={`absolute w-3 h-3 border-cyan-500/30 ${classes} pointer-events-none`} />;
};

const StatisticsModule: React.FC<StatisticsModuleProps> = ({ habits, logs, theme }) => {
  const stats = useMemo(() => {
    const successes = logs.filter(l => l.status === CompletionStatus.SUCCESS).length;
    const failures = logs.filter(l => l.status === CompletionStatus.FAIL).length;
    const globalRate = logs.length > 0 ? Math.round((successes / logs.length) * 100) : 0;
    
    // Categorical breakdown
    const categories: Record<string, { total: number; success: number }> = {};
    habits.forEach(h => {
      if (!categories[h.category]) categories[h.category] = { total: 0, success: 0 };
    });
    
    logs.forEach(l => {
      const habit = habits.find(h => h.id === l.habitId);
      if (habit) {
        categories[habit.category].total++;
        if (l.status === CompletionStatus.SUCCESS) categories[habit.category].success++;
      }
    });

    const categoryStats = Object.entries(categories).map(([name, data]) => ({
      name,
      rate: data.total > 0 ? Math.round((data.success / data.total) * 100) : 0,
      count: data.success
    })).sort((a, b) => b.rate - a.rate);

    // Temporal Performance (0: Morning, 1: Afternoon, 2: Evening)
    const temporalData = [
      { period: 'Morning', success: 0, fail: 0, label: 'Sector Alpha' },
      { period: 'Afternoon', success: 0, fail: 0, label: 'Sector Beta' },
      { period: 'Evening', success: 0, fail: 0, label: 'Sector Gamma' }
    ];

    logs.forEach(l => {
      const hour = new Date(l.timestamp).getHours();
      let index = 2; // evening
      if (hour >= 4 && hour < 12) index = 0; // morning
      else if (hour >= 12 && hour < 17) index = 1; // afternoon
      
      if (l.status === CompletionStatus.SUCCESS) temporalData[index].success++;
      else temporalData[index].fail++;
    });

    // Last 7 days trend
    const trendData = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayLogs = logs.filter(l => new Date(l.timestamp).toLocaleDateString() === d.toLocaleDateString());
      const daySuccesses = dayLogs.filter(l => l.status === CompletionStatus.SUCCESS).length;
      return { name: dayStr, value: daySuccesses };
    }).reverse();

    return { globalRate, categoryStats, temporalData, trendData, successes, failures };
  }, [habits, logs]);

  const themeStyles = {
    light: {
      card: 'bg-white border-slate-200 shadow-xl',
      textPrimary: 'text-black',
      textMuted: 'text-slate-500',
      accent: '#0ea5e9',
      grid: '#f1f5f9',
      panel: 'bg-slate-50',
      chronoBg: 'bg-slate-50/50',
      cellSuccess: 'bg-sky-500',
      cellFail: 'bg-rose-500'
    },
    dark: {
      card: 'bg-[#050b18]/80 border-blue-900 shadow-2xl backdrop-blur-xl',
      textPrimary: 'text-white',
      textMuted: 'text-blue-500',
      accent: '#38bdf8',
      grid: '#1e293b',
      panel: 'bg-blue-950/40',
      chronoBg: 'bg-blue-950/20',
      cellSuccess: 'bg-sky-400',
      cellFail: 'bg-rose-600'
    },
    cyber: {
      card: 'bg-black border-[#00ff41] shadow-[0_0_20px_rgba(0,255,65,0.1)]',
      textPrimary: 'text-[#00ff41]',
      textMuted: 'text-[#008f11]',
      accent: '#00ff41',
      grid: '#003300',
      panel: 'bg-black/40',
      chronoBg: 'bg-black/60',
      cellSuccess: 'bg-[#00ff41]',
      cellFail: 'bg-red-500'
    }
  }[theme];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
      
      {/* Summary Diagnostic */}
      <div className={`rounded-[2.5rem] border-2 p-8 relative overflow-hidden transition-all duration-500 ${themeStyles.card}`}>
        <HUDCorner position="tl" />
        <HUDCorner position="tr" />
        <HUDCorner position="bl" />
        <HUDCorner position="br" />
        
        <div className="flex justify-between items-start mb-8 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5 opacity-60">
              <Shield className="w-3 h-3" style={{ color: themeStyles.accent }} />
              <p className="text-[9px] font-black uppercase tracking-[0.4em]">Performance Intel</p>
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tight italic">Mission Integrity</h3>
          </div>
          <div className="text-right">
            <p className="text-4xl font-black font-mono-tactical tracking-tighter" style={{ color: themeStyles.accent }}>{stats.globalRate}%</p>
            <p className="text-[8px] font-black uppercase tracking-widest opacity-40">System Adherence</p>
          </div>
        </div>

        <div className="h-40 w-full mb-8 relative z-10">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <AreaChart data={stats.trendData}>
              <defs>
                <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={themeStyles.accent} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={themeStyles.accent} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={themeStyles.grid} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: theme === 'dark' ? '#0f172a' : '#fff', 
                  borderRadius: '12px', 
                  border: `1px solid ${themeStyles.accent}40`,
                  fontSize: '10px',
                  fontWeight: 'bold',
                  color: theme === 'dark' ? '#fff' : '#000'
                }} 
              />
              <Area type="monotone" dataKey="value" stroke={themeStyles.accent} strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-4 relative z-10">
          <div className={`p-5 rounded-3xl border border-sky-100/10 ${themeStyles.panel}`}>
            <p className="text-[8px] font-black uppercase tracking-widest opacity-40 mb-3">Secured</p>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-black font-mono-tactical">{stats.successes.toString().padStart(3, '0')}</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500 mb-1" />
            </div>
          </div>
          <div className={`p-5 rounded-3xl border border-sky-100/10 ${themeStyles.panel}`}>
            <p className="text-[8px] font-black uppercase tracking-widest opacity-40 mb-3">Breaches</p>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-black font-mono-tactical">{stats.failures.toString().padStart(3, '0')}</span>
              <AlertCircle className="w-4 h-4 text-red-500 mb-1" />
            </div>
          </div>
        </div>
      </div>

      {/* CHRONO-DIAGNOSTIC SECTORS (Improved Temporal Efficiency) */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-2">
          <div className="flex items-center gap-3">
             <Clock className="w-4 h-4 text-sky-500" />
             <h4 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Tactical Chrono-Diagnostic</h4>
          </div>
          <div className="flex items-center gap-1.5 opacity-20">
             <Activity className="w-3 h-3" />
             <span className="text-[7px] font-black uppercase tracking-widest">Active Scan</span>
          </div>
        </div>
        
        <div className={`p-8 rounded-[2.5rem] border-2 relative overflow-hidden transition-all duration-500 ${themeStyles.card}`}>
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[size:20px_20px] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)]" />
          
          <div className="space-y-8 relative z-10">
            {stats.temporalData.map((data, i) => {
              const total = data.success + data.fail;
              const rate = total > 0 ? Math.round((data.success / total) * 100) : 0;
              const isVolatile = data.fail > 0 && rate < 70;
              const isOptimal = rate >= 90 && data.success > 0;
              
              return (
                <div key={i} className="group">
                  <div className="flex justify-between items-end mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Radio className={`w-3 h-3 ${isVolatile ? 'text-rose-500' : isOptimal ? 'text-emerald-500' : 'text-sky-500'}`} />
                        <span className="text-[8px] font-black uppercase tracking-[0.3em] opacity-40">{data.label}</span>
                      </div>
                      <h5 className={`text-sm font-black uppercase tracking-tight ${themeStyles.textPrimary}`}>{data.period} Operations</h5>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-black font-mono-tactical leading-none ${isVolatile ? 'text-rose-500' : isOptimal ? 'text-emerald-400 shadow-emerald-500/20' : themeStyles.textPrimary}`}>
                        {rate}%
                      </p>
                      <p className="text-[7px] font-black uppercase tracking-widest opacity-30 mt-1">Sync Capacity</p>
                    </div>
                  </div>

                  {/* High Fidelity Power Cell Bar */}
                  <div className={`h-3 w-full rounded-full overflow-hidden flex gap-1 p-0.5 border ${theme === 'dark' ? 'bg-blue-950/40 border-white/5' : 'bg-slate-100 border-slate-200'}`}>
                    {/* Success Segments */}
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 relative overflow-hidden ${isOptimal ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : themeStyles.cellSuccess}`}
                      style={{ width: `${rate}%` }}
                    >
                      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)] animate-[shimmer_2s_infinite]" />
                    </div>
                    {/* Fail Segments */}
                    {data.fail > 0 && (
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${themeStyles.cellFail}`}
                        style={{ width: `${100 - rate}%` }}
                      />
                    )}
                  </div>

                  {/* Metadata Diagnostic Line */}
                  <div className="flex justify-between items-center mt-3 px-1">
                    <div className="flex gap-4">
                      <div className="flex items-center gap-1.5">
                        <Zap className={`w-2.5 h-2.5 ${isOptimal ? 'text-amber-400' : 'opacity-20'}`} />
                        <span className="text-[7px] font-black uppercase tracking-widest opacity-40">Load: {isVolatile ? 'Critical' : 'Balanced'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className={`w-2.5 h-2.5 ${isOptimal ? 'text-emerald-500' : 'opacity-20'}`} />
                        <span className="text-[7px] font-black uppercase tracking-widest opacity-40">Status: {isVolatile ? 'Amber' : isOptimal ? 'Emerald' : 'Secure'}</span>
                      </div>
                    </div>
                    {isOptimal && (
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                        <Target className="w-2.5 h-2.5 text-emerald-500" />
                        <span className="text-[7px] font-black uppercase tracking-widest text-emerald-500">Peak Sync</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className={`mt-8 pt-8 border-t flex flex-col gap-4 ${theme === 'dark' ? 'border-white/5' : 'border-slate-100'}`}>
             <div className="flex items-center gap-3">
               <Terminal className="w-3.5 h-3.5 text-sky-500" />
               <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Diagnostic Summary</p>
             </div>
             <div className={`p-4 rounded-2xl border italic text-[11px] font-bold leading-relaxed ${theme === 'dark' ? 'bg-blue-950/20 border-blue-900 text-blue-100' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                {stats.globalRate > 80 
                  ? "Operational integrity is within high-fidelity parameters. Continue current temporal distribution protocols." 
                  : "Temporal volatility detected in specific sectors. Recommend Sector Re-fortification through earlier protocol engagement."}
             </div>
          </div>
        </div>
      </section>

      {/* Sector breakdown */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-2">
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Sector Reliability</h4>
          <Layout className="w-4 h-4 opacity-20" />
        </div>
        <div className="space-y-3">
          {stats.categoryStats.map(cat => (
            <div key={cat.name} className={`p-6 rounded-[2rem] border-2 transition-all duration-500 ${themeStyles.card} group hover:border-sky-500/30`}>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <Hash className="w-3.5 h-3.5 text-sky-500 opacity-40" />
                  <span className="text-xs font-black uppercase tracking-tight">{cat.name}</span>
                </div>
                <div className="flex items-center gap-2">
                   <span className="text-[10px] font-black font-mono-tactical">{cat.rate}%</span>
                   <ChevronRight className="w-3 h-3 opacity-10 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
              <div className={`w-full h-2 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-slate-800' : 'bg-sky-50'}`}>
                <div 
                  className="h-full transition-all duration-1000"
                  style={{ width: `${cat.rate}%`, backgroundColor: themeStyles.accent, boxShadow: `0 0 10px ${themeStyles.accent}60` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
      
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default StatisticsModule;
