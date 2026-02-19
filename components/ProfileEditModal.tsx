
import React, { useState, useEffect, useRef } from 'react';
import { X, Save, User, Target, ShieldCheck, Bot, Cpu, Shield, Zap, Ghost, Globe, Moon, Sun, Volume2, Mic, Play, Check, Upload, Trash2, RefreshCcw, Languages, Radio, Camera, Terminal, Activity, MessageSquare, Speaker, Music, Headphones } from 'lucide-react';
import { UserProfile, AppTheme } from '../types.ts';
import { GeminiCoach } from '../services/geminiService.ts';
import { ALARM_PRESETS } from '../App.tsx';

interface ProfileEditModalProps {
  profile: UserProfile;
  onSave: (updatedProfile: UserProfile) => void;
  onCancel: () => void;
  theme: AppTheme;
}

const coach = new GeminiCoach();

const COACH_AVATAR_PRESETS = [
  { id: 'tactical', icon: Bot, label: 'Tactical' },
  { id: 'neural', icon: Cpu, label: 'Neural' },
  { id: 'guardian', icon: Shield, label: 'Guardian' },
  { id: 'zen', icon: Zap, label: 'Zen' },
  { id: 'ghost', icon: Radio, label: 'Ghost' }
];

const GEMINI_VOICES = [
  'achernar', 'achird', 'algenib', 'algieba', 'alnilam', 'aoede', 'autonoe', 
  'callirrhoe', 'charon', 'despina', 'enceladus', 'erinome', 'fenrir', 
  'gacrux', 'iapetus', 'kore', 'laomedeia', 'leda', 'orus', 'puck', 
  'pulcherrima', 'rasalgethi', 'sadachbia', 'sadaltager', 'schedar', 
  'sulafat', 'umbriel', 'vindemiatrix', 'zephyr', 'zubenelgenubi'
].sort();

const TACTICAL_TEST_COMMANDS = [
  { label: 'STATUS', text: 'System online. All neural links operational.' },
  { label: 'MISSION', text: 'Target acquired. Initiate protocol sequence immediately.' },
  { label: 'BREACH', text: 'Security breach detected. Immediate corrective action required.' },
  { label: 'MOMENTUM', text: 'Discipline is the baseline. Maintain momentum at all costs.' }
];

const SUPPORTED_LANGUAGES = [
  { code: 'en-US', label: 'English (US)' },
  { code: 'en-GB', label: 'English (UK)' },
  { code: 'es-ES', label: 'Español' },
  { code: 'fr-FR', label: 'Français' },
  { code: 'de-DE', label: 'Deutsch' },
  { code: 'it-IT', label: 'Italiano' },
  { code: 'pt-BR', label: 'Português (BR)' },
  { code: 'pt-PT', label: 'Português (PT)' },
  { code: 'ru-RU', label: 'Pусский' },
  { code: 'ja-JP', label: '日本語' },
  { code: 'zh-CN', label: '简体中文' },
  { code: 'zh-TW', label: '繁體中文' },
  { code: 'ko-KR', label: '한국어' },
  { code: 'ar-SA', label: 'العربية' },
  { code: 'hi-IN', label: 'हिन्दी' },
  { code: 'tr-TR', label: 'Türkçe' },
  { code: 'nl-NL', label: 'Nederlands' },
  { code: 'vi-VN', label: 'Tiếng Việt' }
];

const FALLBACK_TIMEZONES = [
  'UTC', 'Africa/Cairo', 'Africa/Johannesburg', 'Africa/Lagos', 'Africa/Nairobi',
  'America/Anchorage', 'America/Argentina/Buenos_Aires', 'America/Bogota', 'America/Chicago',
  'America/Denver', 'America/Los_Angeles', 'America/Mexico_City', 'America/New_York',
  'America/Phoenix', 'America/Sao_Paulo', 'Asia/Bangkok', 'Asia/Dubai', 'Asia/Hong_Kong',
  'Asia/Istanbul', 'Asia/Jakarta', 'Asia/Jerusalem', 'Asia/Kolkata', 'Asia/Seoul',
  'Asia/Shanghai', 'Asia/Singapore', 'Asia/Tokyo', 'Australia/Brisbane', 'Australia/Melbourne',
  'Australia/Perth', 'Australia/Sydney', 'Europe/Berlin', 'Europe/London', 'Europe/Madrid',
  'Europe/Moscow', 'Europe/Paris', 'Europe/Rome', 'Pacific/Auckland', 'Pacific/Honolulu'
];

const ProfileEditModal: React.FC<ProfileEditModalProps> = ({ profile, onSave, onCancel, theme }) => {
  const [formData, setFormData] = useState<UserProfile>({ ...profile });
  const [playingPreview, setPlayingPreview] = useState<string | null>(null);
  const [isPreviewingVoice, setIsPreviewingVoice] = useState(false);
  const [activeTestCommand, setActiveTestCommand] = useState<string | null>(null);
  const [isDetectingTz, setIsDetectingTz] = useState(false);
  const audioFileInputRef = useRef<HTMLInputElement>(null);
  const imageFileInputRef = useRef<HTMLInputElement>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  const allTimezones = React.useMemo(() => {
    try {
      return (Intl as any).supportedValuesOf('timeZone');
    } catch (e) {
      return FALLBACK_TIMEZONES;
    }
  }, []);

  const themeStyles = {
    light: 'bg-white text-black border-slate-200 shadow-2xl backdrop-blur-3xl',
    dark: 'bg-[#050b18]/95 text-white border-blue-900 shadow-2xl backdrop-blur-3xl',
    cyber: 'bg-black text-[#00ff41] border-[#00ff41]'
  }[theme];

  const inputClass = `w-full rounded-2xl py-4 pl-12 pr-6 text-sm font-bold outline-none border-2 transition-all ${
    theme === 'dark' 
      ? 'bg-blue-950 border-blue-900 focus:border-sky-500 text-white' 
      : 'bg-slate-50 border-slate-200 focus:border-sky-500 text-black'
  }`;

  const toggleDarkMode = () => {
    const newTheme: AppTheme = formData.theme === 'light' ? 'dark' : 'light';
    setFormData({ ...formData, theme: newTheme });
  };

  const previewAlarm = (url: string) => {
    if (playingPreview === url) {
      if (previewAudioRef.current) previewAudioRef.current.pause();
      setPlayingPreview(null);
      return;
    }
    
    if (previewAudioRef.current) previewAudioRef.current.pause();
    
    try {
      const audio = new Audio(url);
      previewAudioRef.current = audio;
      audio.play();
      setPlayingPreview(url);
      audio.onended = () => setPlayingPreview(null);
    } catch (err) {
      console.error("Preview Load Error:", err);
    }
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      alert("Terminal only accepts audio protocol packets.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setFormData({ ...formData, alarmSound: base64 });
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert("Terminal only accepts image protocol packets.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setFormData({ ...formData, profilePic: base64 });
    };
    reader.readAsDataURL(file);
  };

  const detectTimezone = () => {
    setIsDetectingTz(true);
    setTimeout(() => {
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setFormData({ ...formData, timezone: detected });
      setIsDetectingTz(false);
    }, 600);
  };

  const previewVoice = async (voiceName: string, customText?: string) => {
    if (isPreviewingVoice) return;
    setIsPreviewingVoice(true);
    if (customText) setActiveTestCommand(customText);

    try {
      const text = customText || "Neural link established. Commander, awaiting your command.";
      const base64Audio = await coach.generateSpeech(text, voiceName);
      if (base64Audio) {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const binaryString = atob(base64Audio);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        const dataInt16 = new Int16Array(bytes.buffer);
        const frameCount = dataInt16.length;
        const buffer = audioCtx.createBuffer(1, frameCount, 24000);
        const channelData = buffer.getChannelData(0);
        for (let i = 0; i < frameCount; i++) {
          channelData[i] = dataInt16[i] / 32768.0;
        }

        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(audioCtx.destination);
        source.onended = () => {
          setIsPreviewingVoice(false);
          setActiveTestCommand(null);
          audioCtx.close();
        };
        source.start(0);
      }
    } catch (err) {
      console.error("Voice Preview Failure:", err);
      setIsPreviewingVoice(false);
      setActiveTestCommand(null);
    }
  };

  const isCustomSound = formData.alarmSound && !ALARM_PRESETS.some(p => p.url === formData.alarmSound);

  return (
    <div className="fixed inset-0 z-[600] bg-sky-900/20 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className={`w-full max-w-sm rounded-[2.5rem] border-2 flex flex-col max-h-[90vh] shadow-2xl ${themeStyles} animate-in zoom-in-95 duration-500 overflow-hidden`}>
        <div className={`p-6 border-b flex justify-between items-center ${theme === 'dark' ? 'border-white/5' : 'border-sky-100'}`}>
          <h2 className="text-xl font-black uppercase tracking-tight">Identity Modification</h2>
          <button onClick={onCancel} className="p-2 opacity-50 hover:opacity-100 transition-opacity">
            <X className="w-5 h-5 text-sky-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {/* Profile Picture Upload Section */}
          <div className="flex flex-col items-center gap-4 mb-2">
            <div className="relative group cursor-pointer" onClick={() => imageFileInputRef.current?.click()}>
              <div className="absolute inset-0 bg-sky-500 blur-2xl opacity-10 group-hover:opacity-30 transition-opacity" />
              <div className={`w-28 h-28 rounded-[2rem] border-4 flex items-center justify-center overflow-hidden relative shadow-xl transition-transform group-active:scale-95 ${theme === 'dark' ? 'bg-blue-950 border-blue-900' : 'bg-white border-sky-100'}`}>
                {formData.profilePic ? (
                  <img src={formData.profilePic} className="w-full h-full object-cover" alt="Profile" />
                ) : (
                  <User className="w-12 h-12 opacity-10 text-sky-900" />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>
              <button className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-lg border-2 border-white pointer-events-none">
                <Upload className="w-4 h-4" />
              </button>
            </div>
            <input 
              type="file" 
              ref={imageFileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleImageUpload} 
            />
            <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Tactical Identity Image</p>
          </div>

          {/* Basic Identity */}
          <div className="space-y-4">
             <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">Commander Designation</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30 text-sky-600" />
                <input 
                  type="text" 
                  className={inputClass}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">Daily Missions</label>
                <div className="relative">
                  <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30 text-sky-600" />
                  <input 
                    type="number" 
                    className={inputClass}
                    value={formData.dailyGoal}
                    onChange={(e) => setFormData({ ...formData, dailyGoal: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">Operational Sector</label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30 text-sky-600" />
                  <select 
                    className={`${inputClass} appearance-none pr-10`}
                    value={formData.timezone}
                    onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                  >
                    {allTimezones.map((tz: string) => <option key={tz} value={tz}>{tz.replace(/_/g, ' ')}</option>)}
                  </select>
                  <button onClick={detectTimezone} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-sky-500/10 rounded-xl transition-all group" title="Auto-Detect Sector">
                    <RefreshCcw className={`w-3.5 h-3.5 text-sky-500 ${isDetectingTz ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* STANDARD ALARM SIGNAL SECTION */}
          <div className="space-y-5">
            <div className="flex items-center justify-between px-1">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-50">Standard Alarm Signal</label>
              <Music className="w-3.5 h-3.5 opacity-20 text-sky-600" />
            </div>

            <div className="grid grid-cols-1 gap-2">
              {ALARM_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => setFormData({ ...formData, alarmSound: preset.url })}
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all group ${
                    formData.alarmSound === preset.url 
                      ? 'bg-sky-600 border-sky-600 text-white shadow-lg' 
                      : (theme === 'dark' ? 'bg-blue-950/40 border-blue-900 text-blue-300' : 'bg-slate-50 border-slate-100 text-slate-500')
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Volume2 className={`w-4 h-4 ${formData.alarmSound === preset.url ? 'text-white' : 'opacity-40'}`} />
                    <span className="text-xs font-black uppercase tracking-tight">{preset.name}</span>
                  </div>
                  <div 
                    onClick={(e) => { e.stopPropagation(); previewAlarm(preset.url); }}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                      playingPreview === preset.url ? 'bg-white text-sky-600 scale-110 shadow-lg' : 'bg-black/10 group-hover:bg-black/20'
                    }`}
                  >
                    {playingPreview === preset.url ? <Activity className="w-4 h-4" /> : <Play className="w-3 h-3 pl-0.5" />}
                  </div>
                </button>
              ))}

              {/* UPLOAD CUSTOM FREQUENCY BLOCK */}
              <div 
                className={`p-1 rounded-2xl border-2 border-dashed transition-all hover:border-sky-500/50 ${
                  isCustomSound ? 'border-sky-500 bg-sky-500/5' : 'border-sky-100/30'
                }`}
              >
                <button
                  onClick={() => audioFileInputRef.current?.click()}
                  className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${
                    isCustomSound ? 'text-sky-500' : 'text-sky-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Headphones className="w-4 h-4" />
                    <span className="text-xs font-black uppercase tracking-tight">
                      {isCustomSound ? 'Custom Frequency Loaded' : 'Upload Custom Signal'}
                    </span>
                  </div>
                  {isCustomSound ? (
                    <div className="flex items-center gap-2">
                       <button 
                        onClick={(e) => { e.stopPropagation(); previewAlarm(formData.alarmSound!); }}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${playingPreview === formData.alarmSound ? 'bg-sky-500 text-white shadow-lg' : 'bg-sky-100 text-sky-600'}`}
                      >
                         {playingPreview === formData.alarmSound ? <Activity className="w-3.5 h-3.5" /> : <Play className="w-3 h-3 pl-0.5" />}
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setFormData({ ...formData, alarmSound: ALARM_PRESETS[3].url }); }}
                        className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <Upload className="w-4 h-4 opacity-40" />
                  )}
                </button>
                <input 
                  type="file" 
                  ref={audioFileInputRef} 
                  className="hidden" 
                  accept="audio/*" 
                  onChange={handleAudioUpload} 
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">NEURAL COMMAND LANGUAGE</label>
            <div className="relative">
              <Languages className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30 text-sky-600 pointer-events-none" />
              <select 
                className={`${inputClass} appearance-none`}
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
              >
                {SUPPORTED_LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* NEURAL VOICE SIGNATURE LABORATORY */}
          <div className="space-y-5">
            <div className="flex items-center justify-between px-1">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-50">Neural Voice Signature</label>
              <div className="flex items-center gap-1.5 opacity-30">
                <Activity className="w-3 h-3 text-sky-500" />
                <span className="text-[8px] font-black uppercase tracking-widest">Lab v2.4</span>
              </div>
            </div>
            
            <div className="relative">
              <Mic className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30 text-sky-600 pointer-events-none" />
              <select 
                className={`${inputClass} appearance-none pr-12`}
                value={formData.voiceName}
                onChange={(e) => setFormData({ ...formData, voiceName: e.target.value })}
              >
                {GEMINI_VOICES.map(v => (
                  <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>
                ))}
              </select>
            </div>

            <div className={`p-4 rounded-3xl border transition-all ${theme === 'dark' ? 'bg-blue-950/40 border-blue-900' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center gap-2 mb-4 opacity-40">
                <Terminal className="w-3 h-3 text-sky-600" />
                <span className="text-[8px] font-black uppercase tracking-[0.3em]">Command Test Array</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {TACTICAL_TEST_COMMANDS.map((cmd, idx) => (
                  <button 
                    key={idx}
                    onClick={() => previewVoice(formData.voiceName || 'kore', cmd.text)}
                    disabled={isPreviewingVoice}
                    className={`flex flex-col items-center justify-center gap-2 py-4 rounded-2xl border transition-all active:scale-95 group ${
                      activeTestCommand === cmd.text 
                        ? 'bg-sky-600 border-sky-500 text-white shadow-lg' 
                        : (theme === 'dark' ? 'bg-blue-950 border-blue-900 hover:border-sky-500/50' : 'bg-white border-slate-200 hover:border-sky-300')
                    }`}
                  >
                    <Speaker className={`w-4 h-4 transition-transform group-hover:scale-110 ${activeTestCommand === cmd.text ? 'text-white' : 'text-sky-600 opacity-60'}`} />
                    <span className="text-[9px] font-black uppercase tracking-widest">{cmd.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">Interface Protocol</label>
            <button 
              onClick={toggleDarkMode}
              className={`w-full p-4 rounded-2xl border flex items-center justify-between ${
                theme === 'dark' ? 'bg-blue-950 border-blue-900' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                {formData.theme === 'light' ? <Sun className="w-5 h-5 text-orange-400" /> : <Moon className="w-5 h-5 text-sky-400" />}
                <span className="text-xs font-black uppercase tracking-widest">{formData.theme === 'light' ? 'Solar Mode' : 'Neural Mode'}</span>
              </div>
              <div className={`w-10 h-5 rounded-full relative ${formData.theme === 'dark' ? 'bg-sky-500' : 'bg-sky-200'}`}>
                <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${formData.theme === 'dark' ? 'right-1' : 'left-1'}`} />
              </div>
            </button>
          </div>

          <div className={`p-6 rounded-3xl border text-center ${theme === 'dark' ? 'bg-blue-950 border-blue-900' : 'bg-slate-50 border-slate-200'}`}>
            <ShieldCheck className={`w-8 h-8 mx-auto mb-3 text-sky-600`} />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1">Integrity Assurance</p>
            <p className="text-[9px] font-bold opacity-40 uppercase leading-relaxed">Identity modification requires terminal sync for protocol encryption.</p>
          </div>
        </div>

        <div className={`p-6 border-t flex gap-3 ${theme === 'dark' ? 'border-white/5' : 'border-sky-100'}`}>
          <button 
            onClick={() => onSave(formData)} 
            className={`flex-1 py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all bg-sky-600 text-white`}
          >
            <Save className="w-4 h-4" /> Sync Identity
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditModal;
