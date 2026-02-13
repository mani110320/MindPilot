import React, { useMemo } from 'react';
// Added Check to the imports
import { Trophy, Target, CalendarCheck, Flame, ShieldCheck, Lock, Star, Zap, Check } from 'lucide-react';
import { Habit, CompletionLog, CompletionStatus, AppTheme } from '../types.ts';

interface AchievementsModuleProps {
  habits: Habit[];
  logs: CompletionLog[];
  theme: AppTheme;
}

const AchievementsModule: React.FC<AchievementsModuleProps> = ({ habits, logs, theme }) => {
  const stats = useMemo(() => {
    const successLogs = logs.filter(l => l.status === CompletionStatus.SUCCESS);
    const finishedCount = successLogs.length;
    const maxStreak = habits.length > 0 ? Math.max(...habits.map(h => h.streak), 0) : 0;
    
    // Perfect Days Calculation
    const logsByDate = successLogs.reduce((acc, log) => {
      const date = new Date(log.timestamp).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Simple estimation: A "perfect day" is one where at least 3 habits were completed 
    // or if the count matches current active habits (simplified for UI logic)
    // Fix: Explicitly cast to number[] to avoid TypeScript error comparing unknown to number
    const perfectDays = (Object.values(logsByDate) as number[]).filter(count => count >= Math.min(habits.length, 3)).length;

    return { finishedCount, maxStreak, perfectDays };
  }, [habits, logs]);

  const themeStyles = {
    light: {
      card: 'bg-white border-slate-100 shadow-xl',
      panel: 'bg-slate-50/50 border-slate-100',
      textPrimary: 'text-black',
      textMuted: 'text-slate-400',
      accent: 'bg-sky-600',
      banner: 'bg-sky-600 text-white shadow-sky-600/20'
    },
    dark: {
      card: 'bg-[#050b18]/80 border-blue-900/50 shadow-2xl backdrop-blur-xl',
      panel: 'bg-blue-950/20 border-blue-900/30',
      textPrimary: 'text-white',
      textMuted: 'text-blue-500',
      accent: 'bg-sky-500',
      banner: 'bg-sky-600 text-white shadow-sky-600/30'
    },
    cyber: {
      card: 'bg-black border-[#00ff41]/40 shadow-[0_0_20px_rgba(0,255,65,0.05)]',
      panel: 'bg-black border-[#00ff41]/20',
      textPrimary: 'text-[#00ff41]',
      textMuted: 'text-[#008f11]',
      accent: 'bg-[#00ff41]',
      banner: 'bg-[#00ff41] text-black shadow-[#00ff41]/20'
    }
  }[theme];

  const achievementCategories = [
    {
      title: 'Habits Finished',
      current: stats.finishedCount,
      badges: [
        { label: 'Finish Habit for The First Time', value: 1, icon: Target },
        { label: 'Finish Habit 10 Times', value: 10, icon: Target },
        { label: 'Finish Habit 20 Times', value: 20, icon: Target },
        { label: 'Finish Habit 50 Times', value: 50, icon: Target },
        { label: 'Finish Habit 100 Times', value: 100, icon: Target },
        { label: 'Finish Habit 300 Times', value: 300, icon: Target }
      ]
    },
    {
      title: 'Perfect Days',
      current: stats.perfectDays,
      badges: [
        { label: '3 Perfect Days', value: 3, icon: CalendarCheck },
        { label: '10 Perfect Days', value: 10, icon: CalendarCheck },
        { label: '20 Perfect Days', value: 20, icon: CalendarCheck },
        { label: '30 Perfect Days', value: 30, icon: CalendarCheck },
        { label: '50 Perfect Days', value: 50, icon: CalendarCheck },
        { label: '100 Perfect Days', value: 100, icon: CalendarCheck }
      ]
    },
    {
      title: 'Best Streak',
      current: stats.maxStreak,
      badges: [
        { label: '3 Days Streak', value: 3, icon: Zap },
        { label: '5 Days Streak', value: 5, icon: Zap },
        { label: '10 Days Streak', value: 10, icon: Zap },
        { label: '15 Days Streak', value: 15, icon: Zap },
        { label: '30 Days Streak', value: 30, icon: Zap },
        { label: '90 Days Streak', value: 90, icon: Zap }
      ]
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-10">
      
      {/* Top Banner HUD */}
      <div className={`p-8 rounded-[2.5rem] flex flex-col relative overflow-hidden transition-all duration-500 ${themeStyles.banner}`}>
        <div className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-white/20 blur-[60px] rounded-full pointer-events-none" />
        <div className="relative z-10">
          <h2 className="text-2xl font-black uppercase tracking-tighter italic mb-1 flex items-center gap-3">
            <Trophy className="w-6 h-6" /> My Achievements
          </h2>
          <p className="text-[10px] font-black uppercase tracking-widest opacity-80">
            {stats.finishedCount > 0 ? `${stats.finishedCount} Missions Secured Across Operational Sectors.` : "You haven't got any achievements yet. Begin synchronization."}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {achievementCategories.map((cat, idx) => {
          const securedCount = cat.badges.filter(b => cat.current >= b.value).length;
          return (
            <section key={idx} className={`p-8 rounded-[2.5rem] border-2 transition-all duration-500 ${themeStyles.card}`}>
              <div className="flex justify-between items-end mb-10 px-1">
                <div>
                  <h3 className={`text-xl font-black uppercase tracking-tighter leading-none mb-2 ${themeStyles.textPrimary}`}>{cat.title}</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${themeStyles.textMuted}`}>{securedCount}/6 Secured</span>
                  </div>
                </div>
                <div className="text-right opacity-30">
                   <ShieldCheck className="w-8 h-8" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-y-12 gap-x-4">
                {cat.badges.map((badge, bIdx) => {
                  const isSecured = cat.current >= badge.value;
                  const Icon = badge.icon;
                  return (
                    <div key={bIdx} className={`flex flex-col items-center text-center transition-all duration-700 ${isSecured ? 'scale-100 opacity-100' : 'scale-90 opacity-30 grayscale'}`}>
                      <div className="relative mb-4 group">
                        {isSecured && (
                          <div className="absolute inset-0 bg-sky-500/20 blur-xl rounded-full animate-pulse pointer-events-none" />
                        )}
                        <div className={`w-16 h-16 rounded-[1.5rem] border-2 flex flex-col items-center justify-center relative z-10 transition-colors ${isSecured ? 'bg-sky-600/10 border-sky-500 text-sky-500' : 'bg-transparent border-current opacity-40'}`}>
                           <Icon className="w-6 h-6 mb-1" />
                           <span className="text-[10px] font-black font-mono-tactical leading-none">{badge.value}</span>
                        </div>
                        
                        {/* Secured Ribbon Overlay */}
                        {isSecured && (
                           <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-sky-600 rounded-md shadow-lg z-20">
                              <Check className="w-2.5 h-2.5 text-white" strokeWidth={5} />
                           </div>
                        )}
                      </div>
                      <p className={`text-[8px] font-black uppercase tracking-widest leading-tight ${themeStyles.textPrimary} max-w-[70px]`}>
                        {badge.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      <div className={`p-6 rounded-[2rem] border-2 text-center opacity-40 ${themeStyles.panel}`}>
         <ShieldCheck className="w-8 h-8 mx-auto mb-3" />
         <p className="text-[10px] font-black uppercase tracking-[0.3em]">Operational Protocol: Achievement Archive v4.0</p>
      </div>
    </div>
  );
};

export default AchievementsModule;