
import React, { useState, useRef } from 'react';
import { Volume2, Play, Pause, Bell, Radio, Headphones, Download, Check, Activity, Zap } from 'lucide-react';

interface ArsenalModuleProps {
  theme: 'light' | 'dark' | 'cyber';
  currentAlarm: string;
  onSetAlarm: (url: string) => void;
}

const ALARM_SIGNATURES = [
  { id: 'elite', name: 'Elite Alert', url: 'https://assets.mixkit.co/active_storage/sfx/995/995-preview.mp3', category: 'High Priority' },
  { id: 'tactical', name: 'Tactical Pulse', url: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3', category: 'Standard' },
  { id: 'hazard', name: 'Hazard Proximity', url: 'https://assets.mixkit.co/active_storage/sfx/1017/1017-preview.mp3', category: 'Urgent' },
  { id: 'cyber', name: 'Cyber Net', url: 'https://assets.mixkit.co/active_storage/sfx/2658/2658-preview.mp3', category: 'Digital' }
];

const SOUNDSCAPES = [
  { id: 'deep_focus', name: 'Deep Sector Focus', url: 'https://assets.mixkit.co/active_storage/sfx/2324/2324-preview.mp3', duration: 'Infinite', type: 'Binaural' },
  { id: 'white_noise', name: 'Neural Static', url: 'https://assets.mixkit.co/active_storage/sfx/2431/2431-preview.mp3', duration: 'Infinite', type: 'Static' },
  { id: 'zen_garden', name: 'Zen Perimeter', url: 'https://assets.mixkit.co/active_storage/sfx/2325/2325-preview.mp3', duration: 'Loop', type: 'Ambient' }
];

const ArsenalModule: React.FC<ArsenalModuleProps> = ({ theme, currentAlarm, onSetAlarm }) => {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = (url: string, id: string) => {
    if (playingId === id) {
      if (audioRef.current) audioRef.current.pause();
      setPlayingId(null);
    } else {
      if (audioRef.current) audioRef.current.pause();
      try {
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.play().then(() => setPlayingId(id)).catch(e => console.warn("Audio blocked", e));
        audio.onended = () => setPlayingId(null);
      } catch (err) {
        console.error("Audio Load Error:", err);
      }
    }
  };

  const themeStyles = {
    light: { card: 'bg-white border-slate-200', text: 'text-slate-900', muted: 'text-slate-400' },
    dark: { card: 'bg-white/50 border-sky-100', text: 'text-sky-950', muted: 'text-sky-400' },
    cyber: { card: 'bg-black border-[#00ff41]/30', text: 'text-[#00ff41]', muted: 'text-[#008f11]' }
  }[theme];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section>
        <div className="flex items-center gap-3 mb-6">
          <Bell className={`w-5 h-5 ${theme === 'cyber' ? 'text-[#00ff41]' : 'text-sky-600'}`} />
          <h3 className={`text-sm font-black uppercase tracking-[0.2em] ${themeStyles.text}`}>Audio Signatures</h3>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {ALARM_SIGNATURES.map((sig) => (
            <div key={sig.id} className={`${themeStyles.card} border rounded-[2rem] p-5 flex items-center justify-between group transition-all hover:bg-white/70 shadow-sm`}>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => togglePlay(sig.url, sig.id)}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${playingId === sig.id ? 'bg-sky-600 text-white' : 'bg-sky-50 text-sky-400'}`}
                >
                  {playingId === sig.id ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 pl-1" />}
                </button>
                <div>
                  <h4 className={`text-sm font-black uppercase tracking-tight ${themeStyles.text}`}>{sig.name}</h4>
                  <p className={`text-[9px] font-black uppercase opacity-40 mt-1 ${themeStyles.text}`}>{sig.category}</p>
                </div>
              </div>
              <button 
                onClick={() => onSetAlarm(sig.url)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${currentAlarm === sig.url ? 'bg-emerald-500 text-white' : 'bg-sky-50 opacity-40 hover:opacity-100 text-sky-600'}`}
              >
                {currentAlarm === sig.url ? <Check className="w-5 h-5" /> : <Download className="w-4 h-4" />}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-3 mb-6">
          <Headphones className={`w-5 h-5 ${theme === 'cyber' ? 'text-[#00ff41]' : 'text-sky-600'}`} />
          <h3 className={`text-sm font-black uppercase tracking-[0.2em] ${themeStyles.text}`}>Neural Soundscapes</h3>
        </div>
        <div className="space-y-4">
          {SOUNDSCAPES.map((sc) => (
            <div key={sc.id} className={`${themeStyles.card} border rounded-[2.5rem] p-6 relative overflow-hidden group hover:bg-white/70 shadow-sm`}>
               {playingId === sc.id && (
                 <div className="absolute inset-x-0 bottom-0 h-1.5 flex gap-0.5 opacity-30">
                    {[...Array(20)].map((_, i) => (
                      <div key={i} className="flex-1 bg-sky-500 animate-pulse" style={{ animationDelay: `${i * 0.1}s`, height: `${Math.random() * 100}%` }} />
                    ))}
                 </div>
               )}
               <div className="flex justify-between items-center relative z-10">
                 <div className="flex gap-5 items-center">
                    <div className="w-14 h-14 rounded-3xl bg-sky-50 flex items-center justify-center border border-sky-100">
                      <Radio className={`w-6 h-6 ${playingId === sc.id ? 'text-sky-600 animate-pulse' : 'opacity-20 text-sky-900'}`} />
                    </div>
                    <div>
                      <h4 className={`text-base font-black uppercase tracking-tight ${themeStyles.text}`}>{sc.name}</h4>
                      <p className={`text-[10px] font-black opacity-40 uppercase tracking-widest mt-1 ${themeStyles.text}`}>{sc.type} Uplink</p>
                    </div>
                 </div>
                 <button onClick={() => togglePlay(sc.url, sc.id)} className={`w-14 h-14 rounded-[1.5rem] flex items-center justify-center shadow-xl transition-all ${playingId === sc.id ? 'bg-sky-600 text-white scale-90' : 'bg-sky-50 text-sky-600'}`}>
                    {playingId === sc.id ? <Activity className="w-6 h-6" /> : <Play className="w-6 h-6 pl-1" />}
                 </button>
               </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ArsenalModule;
