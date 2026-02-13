
import React from 'react';
import { Bot, ShieldAlert, Zap, ArrowRight, Flame, Shield, Cpu, Ghost } from 'lucide-react';

interface CoachInterventionProps {
  message: string;
  onDismiss: () => void;
  theme: 'light' | 'dark' | 'cyber';
  coachAvatar?: string;
}

const COACH_ICONS: Record<string, any> = {
  tactical: Bot,
  neural: Cpu,
  guardian: Shield,
  zen: Zap,
  ghost: Ghost
};

const CoachIntervention: React.FC<CoachInterventionProps> = ({ message, onDismiss, theme, coachAvatar = 'tactical' }) => {
  const themeStyles = {
    light: 'bg-white text-slate-900 border-slate-200',
    dark: 'bg-white/90 text-sky-950 border-sky-100 shadow-2xl backdrop-blur-3xl',
    cyber: 'bg-black text-[#00ff41] border-[#00ff41]'
  }[theme];

  const accentColor = theme === 'cyber' ? 'text-[#00ff41]' : 'text-sky-600';

  const renderAvatar = () => {
    if (coachAvatar.startsWith('data:')) {
      return <img src={coachAvatar} className="w-10 h-10 rounded-xl object-cover" alt="Coach" />;
    }
    const Icon = COACH_ICONS[coachAvatar] || Bot;
    return <Icon className={`w-10 h-10 ${accentColor}`} />;
  };

  return (
    <div className="fixed inset-0 z-[600] bg-sky-900/40 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in duration-500">
      <div className={`w-full max-w-sm rounded-[3rem] border-4 p-10 shadow-[0_0_50px_rgba(14,165,233,0.3)] ${themeStyles} animate-in zoom-in-95 duration-700 text-center relative overflow-hidden`}>
        {/* Background Decorative Element */}
        <div className={`absolute top-0 left-0 w-full h-1 ${theme === 'cyber' ? 'bg-[#00ff41]' : 'bg-sky-600'} opacity-50`}></div>
        
        <div className="mb-8 relative inline-block">
          <div className={`absolute inset-0 blur-2xl opacity-20 animate-pulse ${theme === 'cyber' ? 'bg-[#00ff41]' : 'bg-sky-500'}`}></div>
          <div className={`w-20 h-20 rounded-3xl flex items-center justify-center border-2 relative z-10 ${theme === 'cyber' ? 'border-[#00ff41] bg-black' : 'border-sky-200 bg-white'}`}>
            {renderAvatar()}
          </div>
        </div>

        <h2 className={`text-2xl font-black uppercase tracking-tighter mb-4 ${theme === 'cyber' ? 'text-[#00ff41]' : 'text-sky-950'}`}>
          Intervention
        </h2>
        
        <div className="bg-sky-50/50 rounded-3xl p-6 mb-10 border border-sky-100 relative">
          <p className={`text-[10px] font-black uppercase tracking-[0.3em] mb-4 opacity-40 ${accentColor}`}>
            Briefing Transcript
          </p>
          <p className="text-lg font-bold italic leading-relaxed text-balance">
            "{message}"
          </p>
        </div>

        <div className="space-y-4">
          <button 
            onClick={onDismiss}
            className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all ${
              theme === 'cyber' ? 'bg-[#00ff41] text-black' : 'bg-sky-600 text-white shadow-sky-500/20'
            }`}
          >
            I UNDERSTAND <ArrowRight className="w-4 h-4" />
          </button>
          
          <p className="text-[9px] font-black uppercase tracking-widest opacity-30">
            System Active
          </p>
        </div>
      </div>
    </div>
  );
};

export default CoachIntervention;
