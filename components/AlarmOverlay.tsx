
import React, { useEffect, useState, useRef } from 'react';
import { 
  ShieldCheck, Bot, Cpu, Zap, Activity, Clock, 
  AlertTriangle, ShieldAlert, Crosshair, 
  ChevronRight, Volume2, Timer, Radio,
  BellRing, Target, RefreshCw, Phone, PhoneOff,
  Signal, Lock, Info, Terminal, Mic, MicOff, Waves,
  ShieldQuestion, Database, Share2, Scan, ChevronDown,
  X
} from 'lucide-react';
import { Habit } from '../types.ts';
import { GeminiCoach } from '../services/geminiService.ts';

interface AlarmOverlayProps {
  habit: Habit;
  onDismiss: () => void;
  onComplete: () => void;
  alarmSound?: string;
  coachAvatar?: string;
  voiceName?: string;
}

// Helper functions for audio decoding
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const HUDCorner = ({ position }: { position: 'tl' | 'tr' | 'bl' | 'br' }) => {
  const classes = {
    tl: "top-0 left-0 border-t-2 border-l-2",
    tr: "top-0 right-0 border-t-2 border-r-2",
    bl: "bottom-0 left-0 border-b-2 border-l-2",
    br: "bottom-0 right-0 border-b-2 border-r-2"
  }[position];
  return <div className={`absolute w-6 h-6 border-cyan-500/40 ${classes} pointer-events-none`} />;
};

const NeuralVoiceProfile = ({ isSpeaking }: { isSpeaking: boolean }) => (
  <div className="relative w-52 h-52 flex items-center justify-center">
    {/* High Fidelity Radar Rings */}
    <div className={`absolute inset-0 rounded-full border border-cyan-500/10 transition-transform duration-[2000ms] ${isSpeaking ? 'scale-125 opacity-20 animate-spin-slow' : 'scale-100 opacity-5'}`} />
    <div className={`absolute inset-4 rounded-full border border-cyan-500/20 transition-transform duration-[1500ms] ${isSpeaking ? 'scale-115 opacity-40 animate-[spin_10s_linear_infinite_reverse]' : 'scale-100 opacity-10'}`} />
    
    {/* Central Core Glow */}
    <div className={`absolute inset-0 rounded-full bg-cyan-500/5 blur-[60px] transition-opacity duration-1000 ${isSpeaking ? 'opacity-50' : 'opacity-10'}`} />
    
    <div className="relative z-10 w-full h-full flex items-center justify-center">
      {/* Scanning Line */}
      {isSpeaking && (
        <div className="absolute inset-0 overflow-hidden rounded-full pointer-events-none z-20">
          <div className="w-full h-1 bg-cyan-400/40 shadow-[0_0_15px_rgba(34,211,238,0.8)] absolute top-0 animate-[scan_3s_linear_infinite]" />
        </div>
      )}
      
      <svg viewBox="0 0 200 200" className={`w-4/5 h-4/5 drop-shadow-[0_0_30px_rgba(34,211,238,0.4)] transition-all duration-700 ${isSpeaking ? 'scale-105' : 'scale-100 opacity-60 grayscale-[0.5]'}`}>
        <defs>
          <filter id="premiumNeon" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        <g filter="url(#premiumNeon)" stroke="#22d3ee" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round">
          {/* Detailed Head Chassis */}
          <path d="M50,80 Q50,40 100,40 Q150,40 150,80 L150,130 Q150,160 100,160 Q50,160 50,130 Z" className="fill-[#050b18]/80" />
          
          {/* Inner Optics Panel */}
          <rect x="65" y="90" width="70" height="35" rx="8" className="fill-cyan-950/40 stroke-cyan-500/20" />
          
          {/* Optic Sensors */}
          <g className={isSpeaking ? 'animate-[pulse_0.15s_infinite]' : 'opacity-30'}>
            <circle cx="85" cy="107" r="4" fill="#22d3ee" />
            <circle cx="115" cy="107" r="4" fill="#22d3ee" />
          </g>
          
          {/* Neural Feedback Ribbon */}
          <path 
            d={isSpeaking ? "M80,140 Q100,160 120,140" : "M85,140 Q100,145 115,140"} 
            strokeWidth={isSpeaking ? 8 : 4}
            className="transition-all duration-150 stroke-cyan-400"
          />
          
          {/* External Comm Gear */}
          <path d="M150,100 Q170,100 170,120 L170,140 Q170,160 140,165" strokeWidth="4" />
          <rect x="132" y="160" width="16" height="10" rx="4" fill="#22d3ee" />
        </g>
      </svg>
    </div>
    
    <style>{`
      @keyframes scan {
        0% { transform: translateY(-50px); opacity: 0; }
        50% { opacity: 1; }
        100% { transform: translateY(200px); opacity: 0; }
      }
      .animate-spin-slow {
        animation: spin 15s linear infinite;
      }
    `}</style>
  </div>
);

const NeuralWaveform = ({ isSpeaking }: { isSpeaking: boolean }) => (
  <div className="flex items-center justify-center gap-1.5 h-10 w-full px-12 overflow-hidden">
    {[...Array(24)].map((_, i) => (
      <div 
        key={i} 
        className={`w-0.5 rounded-full transition-all duration-300 ${isSpeaking ? 'bg-cyan-400' : 'bg-white/5'}`}
        style={{ 
          height: isSpeaking ? `${20 + Math.random() * 80}%` : '10%',
          animation: isSpeaking ? `waveform-premium 0.6s infinite ease-in-out alternate` : 'none',
          animationDelay: `${i * 0.02}s`,
          opacity: isSpeaking ? 0.4 + Math.random() * 0.6 : 0.1
        }} 
      />
    ))}
    <style>{`
      @keyframes waveform-premium {
        0% { transform: scaleY(0.8); }
        100% { transform: scaleY(1.4); }
      }
    `}</style>
  </div>
);

const coach = new GeminiCoach();
const VALID_GEMINI_VOICES = [
  'achernar', 'achird', 'algenib', 'algieba', 'alnilam', 'aoede', 'autonoe', 'callirrhoe', 'charon', 'despina', 'enceladus', 'erinome', 'fenrir', 'gacrux', 'iapetus', 'kore', 'laomedeia', 'leda', 'orus', 'puck', 'pulcherrima', 'rasalgethi', 'sadachbia', 'sadaltager', 'schedar', 'sulafat', 'umbriel', 'vindemiatrix', 'zephyr', 'zubenelgenubi'
];

const AlarmOverlay: React.FC<AlarmOverlayProps> = ({ 
  habit, onDismiss, onComplete, alarmSound, coachAvatar = 'tactical', voiceName = 'kore'
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ttsAudioContextRef = useRef<AudioContext | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [voiceBriefing, setVoiceBriefing] = useState<string>('');
  const [callDuration, setCallDuration] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const isNeuralVoice = habit.alertType === 'voice_ai' || habit.alertType === 'phone_call';

  useEffect(() => {
    if (!isNeuralVoice) return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => { if (recognitionRef.current) recognition.start(); };
      recognition.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
        if (transcript.includes("accept") || transcript.includes("confirm") || transcript.includes("start")) onComplete();
        else if (transcript.includes("decline") || transcript.includes("abort") || transcript.includes("stop")) onDismiss();
      };
      recognitionRef.current = recognition;
      recognition.start();
    }
    return () => { if (recognitionRef.current) { recognitionRef.current.onend = null; recognitionRef.current.stop(); recognitionRef.current = null; } };
  }, [isNeuralVoice]);

  useEffect(() => {
    let timer: number;
    if (isSpeaking) {
      timer = window.setInterval(() => setCallDuration(prev => prev + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isSpeaking]);

  useEffect(() => {
    if (habit.alertType === 'standard') {
      const ringtone = alarmSound || 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3';
      try {
        const audio = new Audio(ringtone);
        audioRef.current = audio;
        audio.loop = true;
        audio.volume = 0.4;
        audio.play().catch(() => console.warn("Audio blocked"));
      } catch (err) {}
    }

    if (isNeuralVoice) {
      const safeVoiceName = VALID_GEMINI_VOICES.includes(voiceName.toLowerCase()) ? voiceName.toLowerCase() : 'kore';
      setIsGenerating(true);
      coach.getVoiceCallScript(habit.name, habit.intention || 'Maintaining operational focus.')
        .then(async (script) => {
          setVoiceBriefing(script);
          try {
            const base64Audio = await coach.generateSpeech(script, safeVoiceName);
            if (base64Audio) await playGeminiTts(base64Audio);
            else speakBriefingFallback(script);
          } catch (err) { speakBriefingFallback(script); }
          finally { setIsGenerating(false); }
        });
    }

    return () => { 
      if (audioRef.current) audioRef.current.pause(); 
      if (ttsAudioContextRef.current) ttsAudioContextRef.current.close();
      window.speechSynthesis.cancel();
    };
  }, [alarmSound, habit, voiceName]);

  const playGeminiTts = async (base64Audio: string) => {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    ttsAudioContextRef.current = audioCtx;
    const audioBuffer = await decodeAudioData(decode(base64Audio), audioCtx, 24000, 1);
    const source = audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioCtx.destination);
    source.onended = () => setIsSpeaking(false);
    setIsSpeaking(true);
    source.start(0);
  };

  const speakBriefingFallback = (text: string) => {
    if (!text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-[#050b18] text-white flex flex-col animate-in fade-in duration-700 font-mono-tactical">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[size:30px_30px] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(14,165,233,0.1),transparent_70%)] pointer-events-none" />
      
      {/* HUD HEADER */}
      <div className="pt-10 px-10 flex flex-col items-center relative z-10">
        <div className="flex items-center gap-3 mb-1 px-4 py-1.5 rounded-full border border-white/5 bg-white/5 backdrop-blur-md">
          <div className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-cyan-500 shadow-[0_0_12px_#22d3ee] animate-pulse' : 'bg-red-500 animate-pulse'}`} />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60">
            {isNeuralVoice ? (isSpeaking ? 'NEURAL UPLINK ACTIVE' : 'ESTABLISHING SECURE LINE') : 'SIGNAL ACQUISITION'}
          </p>
        </div>
        <div className="flex gap-4 opacity-30">
          <p className="text-[8px] tracking-[0.2em] font-black">ENCRYPTION: HIGH</p>
          <p className="text-[8px] tracking-[0.2em] font-black">TIME: {formatDuration(callDuration)}</p>
        </div>
      </div>

      {/* VIEWPORT AREA */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 relative z-10 py-4">
        <div className="relative p-8 mb-4">
          <HUDCorner position="tl" />
          <HUDCorner position="tr" />
          <HUDCorner position="bl" />
          <HUDCorner position="br" />
          
          <div className="relative">
             <div className="absolute -left-16 top-1/2 -translate-y-1/2 flex flex-col gap-6 opacity-10 items-end hidden xs:flex">
                <div className="text-right">
                  <p className="text-[6px] font-black uppercase tracking-widest">Protocol</p>
                  <p className="text-[8px] font-black uppercase">Alpha-01</p>
                </div>
                <Database className="w-4 h-4" />
             </div>
             
             <div className="absolute -right-16 top-1/2 -translate-y-1/2 flex flex-col gap-6 opacity-10 items-start hidden xs:flex">
                <div>
                  <p className="text-[6px] font-black uppercase tracking-widest">Status</p>
                  <p className="text-[8px] font-black uppercase">Live</p>
                </div>
                <Share2 className="w-4 h-4" />
             </div>

             {isNeuralVoice ? (
               <NeuralVoiceProfile isSpeaking={isSpeaking} />
             ) : (
               <div className="w-36 h-36 rounded-[2.5rem] bg-white/5 border-2 border-white/10 flex items-center justify-center relative shadow-2xl backdrop-blur-3xl group">
                 <Scan className="absolute inset-0 w-full h-full opacity-10 p-6" />
                 <Target className={`w-14 h-14 transition-all duration-700 ${isSpeaking ? 'text-sky-400 scale-110 drop-shadow-[0_0_20px_rgba(56,189,248,0.5)]' : 'opacity-20'}`} />
               </div>
             )}
          </div>
        </div>

        <div className="text-center space-y-4 max-w-sm w-full">
          <div className="space-y-0.5">
            <p className="text-[7px] font-black uppercase tracking-[0.5em] text-cyan-400/60">Current Mission</p>
            <h1 className="text-3xl font-black uppercase tracking-tighter italic drop-shadow-lg leading-tight">
              {habit.name}
            </h1>
          </div>

          <div className="relative group">
             <div className="absolute -inset-1 bg-cyan-500/5 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity" />
             <div className={`relative border border-white/5 bg-black/40 rounded-xl p-4 transition-all duration-500 ${isSpeaking ? 'opacity-100 scale-100 border-cyan-500/20' : 'opacity-30 scale-95'}`}>
                <div className="flex items-center gap-2 mb-2 opacity-30">
                  <Terminal className="w-3 h-3" />
                  <span className="text-[7px] font-black uppercase tracking-widest">Strategic Briefing</span>
                </div>
                <p className="text-xs font-bold italic leading-relaxed text-cyan-50/90 text-balance line-clamp-3">
                  "{isGenerating ? 'Decrypting uplink data...' : (voiceBriefing || habit.intention || "Awaiting mission parameters...")}"
                </p>
             </div>
          </div>

          <div className="pt-2">
            <NeuralWaveform isSpeaking={isSpeaking} />
          </div>
        </div>
      </div>

      {/* CALL ACTION AREA - ENSURED VISIBILITY ON MOBILE */}
      <div className="pb-16 px-10 flex flex-col items-center relative z-10 mt-auto">
        
        {isNeuralVoice && isListening && (
          <div className="mb-8 flex flex-col items-center gap-2 animate-pulse">
             <div className="flex items-center gap-3 px-5 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-950/10 backdrop-blur-md">
                <Mic className="w-2.5 h-2.5 text-cyan-400" />
                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-cyan-400">Neural Sync Active</span>
             </div>
          </div>
        )}

        <div className="w-full max-w-sm flex items-center justify-between gap-8 sm:gap-12">
          {/* DECLINE SIGNAL */}
          <div className="flex flex-col items-center gap-3">
            <button 
              onClick={onDismiss}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-red-600/10 border border-red-500/30 flex items-center justify-center text-red-500 hover:bg-red-600/30 active:scale-90 transition-all shadow-[0_0_20px_rgba(239,68,68,0.1)]"
            >
              <PhoneOff className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
            </button>
            <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Decline</span>
          </div>

          {/* ACCEPT PROTOCOL - PROMINENT CENTER */}
          <div className="flex flex-col items-center gap-3 group">
            <div className="relative">
              {/* Pulsing Back Glow */}
              <div className="absolute inset-0 bg-cyan-400 rounded-full blur-2xl opacity-20 animate-pulse group-hover:opacity-40" />
              
              <button 
                onClick={onComplete}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-cyan-400 text-[#050b18] shadow-[0_10px_40px_rgba(34,211,238,0.4)] flex items-center justify-center active:scale-[0.95] transition-all relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
                <Phone className="w-8 h-8 sm:w-10 sm:h-10 fill-current animate-[bounce_2s_infinite]" />
                
                {/* Visual Bio-Sync Rings */}
                <div className="absolute inset-0 border-4 border-white/20 rounded-full scale-110 opacity-0 group-hover:opacity-100 group-hover:scale-95 transition-all duration-700" />
              </button>
            </div>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-400">Accept protocol</span>
          </div>

          {/* LATER / DISMISS MINI */}
          <div className="flex flex-col items-center gap-3">
            <button 
              onClick={onDismiss}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white/80 active:scale-90 transition-all"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Abort</span>
          </div>
        </div>
        
        <div className="mt-10 flex items-center gap-6 opacity-5">
           <Signal className="w-3 h-3" />
           <div className="w-32 h-px bg-white/20" />
           <Lock className="w-3 h-3" />
        </div>
      </div>
    </div>
  );
};

export default AlarmOverlay;
