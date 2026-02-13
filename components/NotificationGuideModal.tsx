
import React from 'react';
import { X, ShieldAlert, Settings, Smartphone, Monitor, LockKeyhole, ArrowRight, BellRing } from 'lucide-react';

interface NotificationGuideModalProps {
  onClose: () => void;
  theme: 'light' | 'dark' | 'cyber';
}

const NotificationGuideModal: React.FC<NotificationGuideModalProps> = ({ onClose, theme }) => {
  const themeStyles = {
    light: 'bg-white text-slate-900 border-slate-200',
    dark: 'bg-white/95 text-sky-950 border-sky-100 shadow-2xl backdrop-blur-3xl',
    cyber: 'bg-black text-[#00ff41] border-[#00ff41]'
  }[theme];

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  return (
    <div className="fixed inset-0 z-[1500] bg-sky-900/30 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className={`w-full max-w-sm rounded-[2.5rem] border-2 p-8 shadow-2xl ${themeStyles} animate-in zoom-in-95 duration-500 overflow-hidden relative`}>
        <div className="absolute top-0 left-0 w-full h-1 bg-red-600/40 animate-pulse"></div>
        
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-600/10 border border-red-600/30 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tighter">Tactical Breach</h2>
              <p className="text-[9px] font-black uppercase opacity-40 tracking-widest text-red-500">Signal Blocked at OS Level</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 opacity-50 hover:opacity-100 transition-opacity">
            <X className="w-5 h-5 text-sky-600" />
          </button>
        </div>

        <div className="space-y-6">
          <p className="text-sm font-bold opacity-80 leading-relaxed text-balance text-sky-900">
            Commander, your comms are currently offline. browser settings are preventing MindPilot from deploying mission alerts. Follow these protocols to restore the uplink:
          </p>

          <div className="space-y-4">
            <div className="flex gap-4 items-start bg-sky-50/50 p-4 rounded-2xl border border-sky-100">
              <div className="w-8 h-8 rounded-lg bg-sky-600/20 flex items-center justify-center shrink-0 mt-1">
                <Settings className="w-4 h-4 text-sky-600" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-sky-950">Step 1: Locate Settings</p>
                <p className="text-xs font-medium opacity-60 text-sky-900">
                  {isMobile 
                    ? "Open your Mobile Browser settings or System Settings app." 
                    : "Look for the Lock icon 🔒 or Settings icon in the browser address bar."}
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start bg-sky-50/50 p-4 rounded-2xl border border-sky-100">
              <div className="w-8 h-8 rounded-lg bg-emerald-600/20 flex items-center justify-center shrink-0 mt-1">
                <LockKeyhole className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-sky-950">Step 2: Reset Permission</p>
                <p className="text-xs font-medium opacity-60 text-sky-900">
                  Find 'Permissions' or 'Notifications' for this site and change 'Blocked' to 'Allow'.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start bg-sky-50/50 p-4 rounded-2xl border border-sky-100">
              <div className="w-8 h-8 rounded-lg bg-sky-500/20 flex items-center justify-center shrink-0 mt-1">
                <BellRing className="w-4 h-4 text-sky-500" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-sky-950">Step 3: Secure Uplink</p>
                <p className="text-xs font-medium opacity-60 text-sky-900">
                  Reload the terminal and click the Bell icon again to confirm connection.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 flex flex-col gap-3">
             <button 
               onClick={() => window.location.reload()}
               className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all ${
                 theme === 'cyber' ? 'bg-[#00ff41] text-black' : 'bg-sky-600 text-white'
               }`}
             >
               RELOAD TERMINAL <ArrowRight className="w-4 h-4" />
             </button>
             <button 
               onClick={onClose}
               className="w-full py-3 text-[9px] font-black uppercase tracking-[0.2em] opacity-40 hover:opacity-100 text-sky-900"
             >
               Dismiss Intelligence
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationGuideModal;
