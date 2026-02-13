
import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, Target, BarChart3, Bot, LayoutDashboard, Library, Zap, Shield, Eye } from 'lucide-react';

interface TutorialOverlayProps {
  onComplete: () => void;
  onTabChange: (tab: 'home' | 'library' | 'stats' | 'ai') => void;
  theme: 'light' | 'dark' | 'cyber';
}

interface Step {
  title: string;
  content: string;
  icon: any;
  highlight: 'home' | 'library' | 'stats' | 'ai' | 'none';
  actionLabel: string;
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ onComplete, onTabChange, theme }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps: Step[] = [
    {
      title: "COMMANDER HQ",
      content: "Welcome to your primary mission control. Deploy protocols, sync with high-fidelity tactical systems, and maintain peak discipline.",
      icon: LayoutDashboard,
      highlight: 'home',
      actionLabel: "Access Vault"
    },
    {
      title: "Protocol Vault",
      content: "Deployment starts here. Access the Library to choose from established habit templates or build custom missions to optimize your life.",
      icon: Library,
      highlight: 'library',
      actionLabel: "Intelligence Sync"
    },
    {
      title: "Intelligence Intel",
      content: "Track your operational integrity. Monitor streaks, consistency maps, and adherence rates to maintain elite performance levels.",
      icon: BarChart3,
      highlight: 'stats',
      actionLabel: "Strategic Uplink"
    },
    {
      title: "Neural Core",
      content: "Direct access to the AI Coach. Use this channel for tactical motivation and mission planning through our activated neural visual core.",
      icon: Bot,
      highlight: 'ai',
      actionLabel: "Mission Parameters"
    },
    {
      title: "Final Briefing",
      content: "Alarms will trigger as incoming calls or neural alerts. Complete your habits to secure streaks and level up. Discipline equals freedom.",
      icon: ShieldCheck,
      highlight: 'none',
      actionLabel: "Initiate System"
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      const nextHighlight = steps[nextStep].highlight;
      if (nextHighlight !== 'none') {
        onTabChange(nextHighlight as any);
      }
    } else {
      onComplete();
    }
  };

  const step = steps[currentStep];
  const Icon = step.icon;

  const accentColor = theme === 'cyber' ? 'text-[#00ff41]' : 'text-sky-600';
  const bgColor = theme === 'cyber' ? 'bg-black/90' : 'bg-sky-50/95';
  const borderColor = theme === 'cyber' ? 'border-[#00ff41]' : 'border-sky-300';

  return (
    <div className={`fixed inset-0 z-[1000] ${bgColor} backdrop-blur-md flex flex-col items-center justify-center p-8 animate-in fade-in duration-500`}>
      <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(rgba(12,74,110,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(0,0,255,0.03),rgba(0,0,0,0),rgba(0,0,255,0.03))] bg-[length:100%_2px,3px_100%]" />
      
      <div className={`w-full max-w-sm rounded-[3rem] border-2 ${borderColor} p-10 relative overflow-hidden flex flex-col items-center text-center animate-in zoom-in-95 duration-700 shadow-[0_0_100px_rgba(14,165,233,0.15)] bg-white/40`}>
        <div className="absolute top-6 left-1/2 -translate-x-1/2 flex gap-1">
          {steps.map((_, i) => (
            <div key={i} className={`w-4 h-1 rounded-full transition-all duration-300 ${i === currentStep ? 'bg-sky-600 w-8' : 'bg-sky-200'}`} />
          ))}
        </div>

        <div className="mb-8 relative">
          <div className={`absolute inset-0 blur-2xl opacity-20 animate-pulse ${theme === 'cyber' ? 'bg-[#00ff41]' : 'bg-sky-500'}`}></div>
          <div className={`w-20 h-20 rounded-[2rem] border-2 flex items-center justify-center bg-white/20 relative z-10 ${borderColor}`}>
            <Icon className={`w-10 h-10 ${accentColor}`} />
          </div>
        </div>

        <h2 className={`text-2xl font-black uppercase tracking-tighter mb-4 ${theme === 'cyber' ? 'text-[#00ff41]' : 'text-sky-950'}`}>
          {step.title}
        </h2>

        <p className="text-sm font-bold opacity-80 leading-relaxed mb-10 text-balance text-sky-900">
          {step.content}
        </p>

        <button 
          onClick={handleNext}
          className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 active:scale-95 transition-all shadow-2xl ${
            theme === 'cyber' ? 'bg-[#00ff41] text-black' : 'bg-sky-600 text-white shadow-sky-500/20'
          }`}
        >
          {step.actionLabel} <ArrowRight className="w-4 h-4" />
        </button>

        <div className="mt-6 flex items-center gap-2 opacity-30">
          <Shield className="w-3 h-3 text-sky-900" />
          <span className="text-[8px] font-black uppercase tracking-widest text-sky-900">Security Protocol v4.0.1</span>
        </div>
      </div>

      <div className="absolute bottom-10 flex justify-between w-full max-w-md px-10 pointer-events-none">
        {['home', 'library', 'stats', 'ai'].map(t => (
          <div 
            key={t} 
            className={`w-12 h-12 rounded-full border-2 transition-all duration-500 ${step.highlight === t ? 'border-sky-500 opacity-100 scale-125 shadow-[0_0_30px_rgba(14,165,233,0.3)]' : 'border-transparent opacity-0'}`} 
          />
        ))}
      </div>
    </div>
  );
};

export default TutorialOverlay;
