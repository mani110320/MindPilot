
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  LayoutDashboard, Library, BarChart3, User, Plus, Flame, Bot, X,
  ChevronRight, Clock, BellRing, LogOut, Edit3, Check, Save, Palette,
  Activity, Zap, Volume2, Target, ChevronLeft,
  CheckCircle2, MessageSquare, Mic, MicOff,
  UserCog, Smartphone, BellOff, Bell, Play,
  Cpu, Shield, Layers, Radio, Send,
  Skull, Music, Twitter, Instagram, Globe, RefreshCcw, Crosshair,
  Terminal, ShieldCheck, Sparkles, Hash, Database, Share2, Users, Star,
  Trophy, VolumeX, Volume2 as VolumeIcon, CalendarDays, ChevronDown
} from 'lucide-react';

import { Habit, CompletionLog, UserProfile, Difficulty, AppTheme, HabitAlertType, CompletionStatus } from './types.ts';
import { HABIT_TEMPLATES } from './constants.tsx';
import { translations } from './translations.ts';
import HabitCard from './components/HabitCard.tsx';
import AlarmOverlay from './components/AlarmOverlay.tsx';
import FocusProtocol from './components/FocusProtocol.tsx';
import CoachIntervention from './components/CoachIntervention.tsx';
import HabitFormModal from './components/HabitFormModal.tsx';
import CalendarModule from './components/CalendarModule.tsx';
import StatisticsModule from './components/StatisticsModule.tsx';
import AchievementsModule from './components/AchievementsModule.tsx';
import HistoryModule from './components/HistoryModule.tsx'; 
import ProfileEditModal from './components/ProfileEditModal.tsx';
import Auth from './components/Auth.tsx';
import TutorialOverlay from './components/TutorialOverlay.tsx';
import PostMissionReport from './components/PostMissionReport.tsx';
import NotificationGuideModal from './components/NotificationGuideModal.tsx';
import RateUsModal from './components/RateUsModal.tsx'; 
import { GeminiCoach } from './services/geminiService.ts';
import { NotificationService } from './services/notificationService.ts';

const coach = new GeminiCoach();
const notifications = NotificationService.getInstance();

export const ALARM_PRESETS = [
  { id: 'crisp', name: 'Crisp Ring', url: 'https://assets.mixkit.co/active_storage/sfx/2361/2361-preview.mp3' },
  { id: 'early', name: 'Early in the morning', url: 'https://assets.mixkit.co/active_storage/sfx/2324/2324-preview.mp3' },
  { id: 'moments', name: 'Moments', url: 'https://assets.mixkit.co/active_storage/sfx/1017/1017-preview.mp3' },
  { id: 'default_tactical', name: 'Default Tactical', url: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3' }
];

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

// --- NEURAL CORE VISUAL COMPONENT ---
const NeuralCore = ({ active = true, theme = 'light' }) => {
  const accent = theme === 'cyber' ? '#00ff41' : '#0ea5e9';
  
  return (
    <div className="relative w-full h-full flex items-center justify-center scale-75 lg:scale-100">
      <div className={`absolute inset-0 rounded-full blur-[60px] opacity-20 transition-all duration-1000 ${active ? 'scale-110' : 'scale-90'}`} style={{ backgroundColor: accent }} />
      <div className={`absolute w-[120%] h-[120%] border border-dashed rounded-full animate-[spin_8s_linear_infinite] opacity-20`} style={{ borderColor: accent }} />
      <div className={`absolute w-[140%] h-[140%] border-2 border-dotted rounded-full animate-[spin_12s_linear_infinite_reverse] opacity-10`} style={{ borderColor: accent }} />
      <div className="relative z-10 w-32 h-32 flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_20px_rgba(14,165,233,0.5)]">
          <path d="M50 10 L90 50 L50 90 L10 50 Z" fill="none" stroke={accent} strokeWidth="2" className="animate-[pulse_2s_infinite]" />
          <path d="M50 20 L80 50 L50 80 L20 50 Z" fill="none" stroke={accent} strokeWidth="1.5" className="animate-[pulse_2s_infinite_1s]" />
          <circle cx="50" cy="50" r="12" fill={accent} className="opacity-40 animate-pulse" />
          <circle cx="50" cy="50" r="4" fill="#fff" className="animate-pulse" />
        </svg>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="absolute w-1 h-1 rounded-full animate-ping" style={{ backgroundColor: accent, top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, animationDelay: `${i * 0.4}s`, animationDuration: `${1.5 + Math.random()}s` }} />
        ))}
      </div>
    </div>
  );
};

interface ChatMessage {
  role: 'coach' | 'user';
  text: string;
  timestamp: number;
}

const DEFAULT_PROFILE: UserProfile = {
  name: 'OPERATOR', age: 25, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  dailyGoal: 5, joinedAt: Date.now(), motivationScore: 100, 
  enableSound: true, enableVibration: true, notifStyle: 'banner', 
  language: 'en-US', theme: 'light', alarmSound: ALARM_PRESETS[3].url,
  voiceName: 'Charon', coachAvatar: 'tactical', hasCompletedTutorial: false
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try { return localStorage.getItem('hq_auth') === 'true'; } catch { return false; }
  });

  const [activeTab, setActiveTab] = useState<'home' | 'library' | 'stats' | 'ai' | 'profile'>('home');
  const [statsSubTab, setStatsSubTab] = useState<'calendar' | 'achievements' | 'statistics' | 'history'>('calendar'); 
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [isRateModalOpen, setIsRateModalOpen] = useState(false); 
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [showNotificationGuide, setShowNotificationGuide] = useState(false);
  
  const [activeAlarm, setActiveAlarm] = useState<Habit | null>(null);
  const [activeFocus, setActiveFocus] = useState<Habit | null>(null);
  const [pendingReport, setPendingReport] = useState<Habit | null>(null);
  const [interventionMessage, setInterventionMessage] = useState<string | null>(null);
  
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  // Sector View Logic (Today vs Tomorrow)
  const [viewDateOffset, setViewDateOffset] = useState<0 | 1>(0);
  
  const [habits, setHabits] = useState<Habit[]>(() => {
    try {
      const saved = localStorage.getItem('hq_habits');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [logs, setLogs] = useState<CompletionLog[]>(() => {
    try {
      const saved = localStorage.getItem('hq_logs');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('hq_profile');
      return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
    } catch { return DEFAULT_PROFILE; }
  });

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('hq_chat');
      return saved ? JSON.parse(saved) : [{
        role: 'coach', text: "System online. Neural core activated. Ready for synchronization.", timestamp: Date.now()
      }];
    } catch { return []; }
  });

  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const ttsAudioContextRef = useRef<AudioContext | null>(null);

  const t = useMemo(() => {
    const lang = profile.language || 'en-US';
    return translations[lang] || translations['en-US'];
  }, [profile.language]);

  const QUICK_COMMANDS = useMemo(() => [
    { label: 'Perform Deep Audit', prompt: '', isAudit: true, icon: Database },
    { label: 'Get Motivation', prompt: 'I need immediate tactical motivation to stay on mission.' , icon: Flame },
    { label: 'Plan Tomorrow', prompt: 'Perform a predictive analysis and help me plan tomorrow\'s operations based on my history.', icon: Clock },
    { label: 'Analyze Streaks', prompt: 'Scan my current protocol streaks and identify volatility risks.', icon: Activity }
  ], []);

  useEffect(() => {
    if (!isAuthenticated || isLoggingOut) return;
    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const todayStr = now.toLocaleDateString();
      const currentDayIdx = now.getDay();

      const triggerable = habits.find(h => {
        const timeMatch = h.time === currentTime && h.lastTriggered !== todayStr;
        if (!timeMatch) return false;
        if (h.recurrenceMode === 'interval' && h.interval) {
          const start = new Date(h.createdAt);
          start.setHours(0, 0, 0, 0);
          const current = new Date(now);
          current.setHours(0, 0, 0, 0);
          const diffDays = Math.floor((current.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
          return diffDays % h.interval === 0;
        }
        return (h.days.length === 0 || h.days.includes(currentDayIdx));
      });

      if (triggerable && !activeAlarm && !activeFocus && !pendingReport) {
        setHabits(prev => prev.map(h => h.id === triggerable.id ? { ...h, lastTriggered: todayStr } : h));
        triggerAlarm(triggerable);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [habits, activeAlarm, activeFocus, pendingReport, isAuthenticated, isLoggingOut]);

  const triggerAlarm = async (habit: Habit) => {
    setActiveAlarm(habit);
    notifications.scheduleAlarm(habit.name, habit.intention || 'Mission starting.', habit.id, profile.notifStyle, habit.alertType || 'standard');
  };

  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem('hq_habits', JSON.stringify(habits));
      localStorage.setItem('hq_logs', JSON.stringify(logs));
      localStorage.setItem('hq_profile', JSON.stringify(profile));
      localStorage.setItem('hq_chat', JSON.stringify(chatHistory));
      localStorage.setItem('hq_auth', 'true');
    }
  }, [habits, logs, profile, chatHistory, isAuthenticated]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = profile.language;
      recognition.onstart = () => setIsRecording(true);
      recognition.onend = () => setIsRecording(false);
      recognition.onerror = () => setIsRecording(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (chatInputRef.current) chatInputRef.current.value = transcript;
      };
      recognitionRef.current = recognition;
    }
  }, [profile.language]);

  const toggleSpeech = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition not supported in this terminal.");
      return;
    }
    if (isRecording) recognitionRef.current.stop();
    else recognitionRef.current.start();
  };

  const playVoiceResponse = async (text: string) => {
    if (!profile.enableSound) return;
    try {
      const base64Audio = await coach.generateSpeech(text, profile.voiceName || 'charon');
      if (base64Audio) {
        if (ttsAudioContextRef.current) ttsAudioContextRef.current.close();
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        ttsAudioContextRef.current = audioCtx;
        
        const audioBuffer = await decodeAudioData(decode(base64Audio), audioCtx, 24000, 1);
        const source = audioCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioCtx.destination);
        source.onended = () => setIsAiSpeaking(false);
        setIsAiSpeaking(true);
        source.start(0);
      }
    } catch (err) {
      console.warn("TTS Error:", err);
      setIsAiSpeaking(false);
    }
  };

  const askCoach = async (text: string, isTacticalAudit: boolean = false) => {
    const promptText = isTacticalAudit ? "REQUEST: PERFORM FULL AUDIT AND PERFORMANCE REVIEW." : text;
    if (!promptText.trim()) return;
    
    setChatHistory(prev => [...prev, { role: 'user', text: promptText, timestamp: Date.now() }]);
    setIsAiLoading(true);
    
    try {
      const todayStr = new Date().toLocaleDateString();
      const last10Days = Array.from({ length: 10 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toLocaleDateString();
      });

      const temporalStats = { morning: { s: 0, f: 0 }, afternoon: { s: 0, f: 0 }, evening: { s: 0, f: 0 } };
      logs.forEach(l => {
        const hour = new Date(l.timestamp).getHours();
        const target = hour < 12 ? 'morning' : (hour < 17 ? 'afternoon' : 'evening');
        if (l.status === CompletionStatus.SUCCESS) temporalStats[target as keyof typeof temporalStats].s++;
        else temporalStats[target as keyof typeof temporalStats].f++;
      });

      const context = JSON.stringify({ 
        operatorName: profile.name,
        motivationScore: profile.motivationScore,
        joinedAt: new Date(profile.joinedAt).toLocaleDateString(),
        isDeepAuditRequested: isTacticalAudit,
        currentOperations: habits.map(h => {
          const habitLogs = logs.filter(l => l.habitId === h.id);
          const historyMap = last10Days.map(date => {
            const entry = habitLogs.find(l => new Date(l.timestamp).toLocaleDateString() === date);
            return entry ? (entry.status === CompletionStatus.SUCCESS ? 1 : 0) : -1;
          });
          return { name: h.name, streak: h.streak, category: h.category, scheduledTime: h.time, executionHistory10Days: historyMap, totalSuccessCount: habitLogs.filter(l => l.status === CompletionStatus.SUCCESS).length, totalFailureCount: habitLogs.filter(l => l.status === CompletionStatus.FAIL).length };
        }), 
        temporalHeatmap: temporalStats,
        globalMetrics: { adherenceRate: logs.length > 0 ? ((logs.filter(l => l.status === CompletionStatus.SUCCESS).length / logs.length) * 100).toFixed(1) + '%' : 'N/A', volatilityScore: habits.reduce((acc, h) => acc + (h.streak === 0 ? 1 : 0), 0) }
      });

      const response = await coach.chatWithCoach(promptText, context);
      setChatHistory(prev => [...prev, { role: 'coach', text: response, timestamp: Date.now() }]);
      playVoiceResponse(response);
    } catch (e) {
      setChatHistory(prev => [...prev, { role: 'coach', text: "Signal interference detected.", timestamp: Date.now() }]);
    } finally { setIsAiLoading(false); }
  };

  const finalizeMission = (difficulty: Difficulty, notes: string, status: CompletionStatus, habitOverride?: Habit, violations: number = 0) => {
    const targetHabit = habitOverride || pendingReport;
    if (!targetHabit) return;
    const newLog: CompletionLog = { id: Math.random().toString(36).substr(2,9), habitId: targetHabit.id, timestamp: Date.now(), difficulty, status, notes: violations > 0 ? `${notes} [Breaches Detected: ${violations}]` : notes };
    setLogs(prev => [...prev, newLog]);
    setHabits(prev => prev.map(h => {
      if (h.id === targetHabit.id) {
        let newStreak = h.streak;
        if (status === CompletionStatus.SUCCESS) {
          if (violations > 3) newStreak = Math.max(0, h.streak - 1);
          else newStreak = h.streak + 1;
        } else newStreak = 0;
        return { ...h, streak: newStreak };
      }
      return h;
    }));
    setProfile(p => ({ ...p, motivationScore: status === CompletionStatus.SUCCESS ? p.motivationScore + (difficulty === Difficulty.HARD ? 25 : 15) - (violations * 5) : Math.max(0, p.motivationScore - 10) }));
    if (!habitOverride) setPendingReport(null);
    const outcomeMsg = violations > 3 ? `Mission Degraded. Protocol ${targetHabit.name} secured, but integrity breaches (>3) resulted in streak reduction.` : status === CompletionStatus.SUCCESS ? `Mission Secured. Protocol ${targetHabit.name} successfully logged.` : `Protocol Failure Logged. System integrity at risk.`;
    setInterventionMessage(outcomeMsg);
  };

  const groupedHabits = useMemo(() => {
    const viewDate = new Date();
    viewDate.setDate(viewDate.getDate() + viewDateOffset);
    const viewDayIdx = viewDate.getDay();

    const filtered = habits.filter(h => {
      if (h.recurrenceMode === 'interval' && h.interval) {
        const start = new Date(h.createdAt);
        start.setHours(0, 0, 0, 0);
        const current = new Date(viewDate);
        current.setHours(0, 0, 0, 0);
        const diffDays = Math.floor((current.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays % h.interval === 0;
      }
      return h.days.includes(viewDayIdx);
    });

    const sorted = [...filtered].sort((a, b) => a.time.localeCompare(b.time));
    return {
      morning: sorted.filter(h => { const hour = parseInt(h.time.split(':')[0]); return hour >= 4 && hour < 12; }),
      afternoon: sorted.filter(h => { const hour = parseInt(h.time.split(':')[0]); return hour >= 12 && hour < 17; }),
      night: sorted.filter(h => { const hour = parseInt(h.time.split(':')[0]); return hour >= 17 || hour < 4; })
    };
  }, [habits, viewDateOffset]);

  const nextOperation = useMemo(() => {
    if (habits.length === 0) return null;
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const future = habits.filter(h => h.time > currentTime).sort((a, b) => a.time.localeCompare(b.time))[0];
    return future || habits.sort((a, b) => a.time.localeCompare(b.time))[0];
  }, [habits]);

  useEffect(() => { if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' }); }, [chatHistory]);

  const theme = profile.theme || 'light';
  const themeStyles = {
    light: { bg: 'bg-white', text: 'text-black', textMuted: 'text-slate-500', card: 'bg-white border-slate-100 shadow-xl backdrop-blur-xl', border: 'border-slate-100', headerBg: 'bg-white/80 backdrop-blur-2xl', navBg: 'bg-white/90 backdrop-blur-2xl', navActive: 'text-sky-600', navInactive: 'text-slate-300', accent: 'bg-sky-500', heading: 'text-black', subnav: 'bg-slate-50', accentHex: '#0ea5e9' },
    dark: { bg: 'bg-[#050b18]', text: 'text-white', textMuted: 'text-blue-500', card: 'bg-blue-950/40 border-blue-900 shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-xl', border: 'border-blue-900', headerBg: 'bg-[#050b18]/80 backdrop-blur-2xl', navBg: 'bg-[#050b18]/90 backdrop-blur-2xl', navActive: 'text-sky-400', navInactive: 'text-blue-900', accent: 'bg-blue-600', heading: 'text-white', subnav: 'bg-blue-900/30', accentHex: '#38bdf8' },
    cyber: { bg: 'bg-[#020d24]', text: 'text-cyan-400', textMuted: 'text-blue-400/40', card: 'bg-black/60 border-cyan-500/30', border: 'border-cyan-500/20', headerBg: 'bg-black/80 backdrop-blur-md', navBg: 'bg-black/90 backdrop-blur-md', navActive: 'text-cyan-400', navInactive: 'text-blue-900', accent: 'bg-black', heading: 'text-cyan-400', subnav: 'bg-cyan-500/10', accentHex: '#22d3ee' }
  }[theme];

  const handleLogin = (newProfile: UserProfile) => { setProfile(newProfile); setIsAuthenticated(true); localStorage.setItem('hq_auth', 'true'); };
  const handleLogout = () => { setIsLogoutConfirmOpen(false); setIsLoggingOut(true); setTimeout(() => { setIsAuthenticated(false); localStorage.setItem('hq_auth', 'false'); setActiveTab('home'); setIsLoggingOut(false); }, 1200); };

  if (!isAuthenticated) return <Auth onLogin={handleLogin} />;

  return (
    <div className={`flex flex-col h-screen max-w-md mx-auto relative overflow-hidden ${themeStyles.bg} ${themeStyles.text} transition-all duration-500`}>
      <div className="scanline" />
      <div className="crt-flicker" />

      {!profile.hasCompletedTutorial && <TutorialOverlay theme={theme} onComplete={() => setProfile(p => ({ ...p, hasCompletedTutorial: true }))} onTabChange={(tab) => setActiveTab(tab)} />}

      {activeAlarm && <AlarmOverlay habit={activeAlarm} onDismiss={() => setActiveAlarm(null)} onComplete={() => { setActiveAlarm(null); setActiveFocus(activeAlarm); }} alarmSound={profile.alarmSound} coachAvatar={profile.coachAvatar} voiceName={profile.voiceName} />}
      {activeFocus && <FocusProtocol durationMinutes={activeFocus.duration || 5} habitName={activeFocus.name} onComplete={(violations) => { const h = activeFocus; setActiveFocus(null); if (h) finalizeMission(Difficulty.MEDIUM, "Automated terminal completion", CompletionStatus.SUCCESS, h, violations); }} onEmergencyStop={(reason) => { const h = activeFocus; setActiveFocus(null); if (h) finalizeMission(Difficulty.HARD, reason, CompletionStatus.FAIL, h); }} onViolation={(penalty) => setProfile(p => ({ ...p, motivationScore: Math.max(0, p.motivationScore - penalty) }))} theme={theme} blockDistractions={activeFocus.distractionBlocker} getAiViolationMessage={coach.getViolationBriefing} />}
      {pendingReport && <PostMissionReport habitName={pendingReport.name} onConfirm={(diff, notes, status) => finalizeMission(diff, notes, status)} onCancel={() => setPendingReport(null)} theme={theme} />}
      {showNotificationGuide && <NotificationGuideModal theme={theme} onClose={() => setShowNotificationGuide(false)} />}
      {interventionMessage && <CoachIntervention message={interventionMessage} onDismiss={() => setInterventionMessage(null)} theme={theme} coachAvatar={profile.coachAvatar} />}
      {isRateModalOpen && <RateUsModal onClose={() => setIsRateModalOpen(false)} theme={theme} />}

      {isHabitModalOpen && <HabitFormModal habit={editingHabit || undefined} onSave={(h) => { if (editingHabit) setHabits(prev => prev.map(old => old.id === editingHabit.id ? { ...old, ...h } : old)); else setHabits(prev => [...prev, { frequency: 'daily', recurrenceMode: 'fixed', interval: 1, ...h, id: Math.random().toString(36).substr(2,9), createdAt: Date.now(), streak: 0 } as Habit]); setIsHabitModalOpen(false); setEditingHabit(null); }} onDelete={(id) => { setHabits(prev => prev.filter(p => p.id !== id)); setIsHabitModalOpen(false); setEditingHabit(null); }} onCancel={() => { setIsHabitModalOpen(false); setEditingHabit(null); }} theme={theme} />}
      {isEditingProfile && <ProfileEditModal profile={profile} onSave={(p) => { setProfile(p); setIsEditingProfile(false); }} onCancel={() => setIsEditingProfile(false)} theme={theme} />}

      {isLogoutConfirmOpen && (
        <div className="fixed inset-0 z-[1500] bg-sky-900/40 backdrop-blur-xl flex items-center justify-center p-8">
          <div className={`${themeStyles.card} border-2 border-red-500/40 p-10 rounded-[2.5rem] text-center max-w-xs animate-in zoom-in-95 duration-300`}>
            <Skull className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h2 className={`text-xl font-black uppercase tracking-tighter mb-8 ${themeStyles.heading}`}>Terminate Uplink?</h2>
            <div className="space-y-3">
              <button onClick={handleLogout} className="w-full py-4 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all shadow-lg">DEAUTH COMMAND</button>
              <button onClick={() => setIsLogoutConfirmOpen(false)} className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all border ${theme === 'dark' ? 'bg-blue-900/40 border-blue-800 text-white' : 'bg-slate-50 text-black border-slate-200'}`}>ABORT</button>
            </div>
          </div>
        </div>
      )}

      <header className={`px-6 pt-14 pb-8 ${themeStyles.headerBg} border-b ${themeStyles.border} flex justify-between items-end shrink-0 z-40 transition-all duration-300`}>
        <div className="flex flex-col">
          <h1 className={`text-2xl font-black tracking-tight uppercase italic leading-none flex items-center gap-2 ${themeStyles.heading}`}>
            COMMANDER
            <div className={`w-2.5 h-2.5 rounded-full ${theme === 'cyber' ? 'bg-[#00ff41]' : 'bg-sky-600'} animate-pulse shadow-[0_0_10px_currentColor]`} />
          </h1>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowNotificationGuide(true)} className={`w-10 h-10 rounded-xl border ${themeStyles.border} ${themeStyles.card} flex items-center justify-center text-sky-400 active:scale-90 transition-all hover:bg-sky-500/10`}>
             {notifications.hasPermission ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4 text-red-400" />}
          </button>
          <button onClick={() => setIsLogoutConfirmOpen(true)} className={`w-10 h-10 rounded-xl border ${themeStyles.border} flex items-center justify-center text-red-500/60 active:scale-90 transition-all hover:bg-red-500/10`}><LogOut className="w-4 h-4" /></button>
          <button onClick={() => setActiveTab('profile')} className={`w-10 h-10 rounded-xl ${themeStyles.card} overflow-hidden active:scale-95 transition-all flex items-center justify-center border ${themeStyles.border}`}>
            {profile.profilePic ? <img src={profile.profilePic} className="w-full h-full object-cover" /> : <User className="w-4 h-4 opacity-40" />}
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar transition-all relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(14,165,233,0.05),transparent_70%)] pointer-events-none" />
        <div className={`px-6 py-8 pb-32 ${activeTab === 'ai' ? 'h-full !px-0 !py-0' : ''}`}>
          {activeTab === 'home' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
              <div className={`p-8 ${theme === 'cyber' ? 'bg-cyan-500/5 border-2 border-cyan-500' : (theme === 'dark' ? 'bg-blue-900/20 border border-blue-800 shadow-2xl' : 'bg-white border border-slate-100 shadow-2xl')} rounded-[2.5rem] relative overflow-hidden group`}>
                 <div className="absolute -top-10 -right-10 w-48 h-48 opacity-20 pointer-events-none"><NeuralCore active={true} theme={theme} /></div>
                 <div className="flex items-center justify-between relative z-10 mb-8">
                   <div className="flex items-center gap-4">
                     <div className={`w-14 h-14 rounded-2xl ${theme === 'cyber' ? 'bg-cyan-500/20 text-cyan-400' : (theme === 'dark' ? 'bg-sky-500/20 text-sky-400' : 'bg-sky-500/10 text-sky-600')} flex items-center justify-center`}><Flame className="w-7 h-7 fill-current" /></div>
                     <div><p className={`text-[10px] font-black opacity-40 uppercase tracking-widest mb-0.5 ${theme === 'dark' ? 'text-sky-100' : 'text-slate-400'}`}>{t.home.motivationScore}</p><p className={`text-3xl font-black font-mono-tactical tracking-tighter ${themeStyles.heading}`}>{profile.motivationScore}</p></div>
                   </div>
                   <div className="text-right">
                     <p className={`text-3xl font-black font-mono-tactical tracking-tighter ${themeStyles.heading}`}>{habits.length > 0 ? Math.max(...habits.map(h => h.streak)) : 0}</p>
                     <p className={`text-[10px] font-black opacity-40 uppercase tracking-widest ${theme === 'dark' ? 'text-sky-100' : 'text-slate-400'}`}>Max Streak</p>
                   </div>
                 </div>
                 {nextOperation && (
                   <div className={`mb-6 flex items-center gap-3 p-3 rounded-2xl border relative z-10 ${theme === 'dark' ? 'bg-blue-900/40 border-blue-800' : 'bg-slate-50 border-slate-100'}`}>
                      <div className="w-8 h-8 rounded-lg bg-sky-600/10 flex items-center justify-center"><Crosshair className="w-4 h-4 text-sky-600" /></div>
                      <div>
                        <p className={`text-[8px] font-black uppercase tracking-widest opacity-40 ${theme === 'dark' ? 'text-sky-100' : 'text-slate-400'}`}>Next Objective</p>
                        <p className={`text-[10px] font-black uppercase truncate max-w-[150px] ${theme === 'dark' ? 'text-sky-200' : 'text-black'}`}>{nextOperation.name} @ {nextOperation.time}</p>
                      </div>
                   </div>
                 )}
                 <div className={`w-full h-1 rounded-full overflow-hidden relative z-10 ${theme === 'dark' ? 'bg-blue-950' : 'bg-slate-100'}`}>
                    <div className={`h-full ${theme === 'cyber' ? 'bg-cyan-400' : 'bg-sky-500'} w-[65%] shadow-[0_0_10px_rgba(14,165,233,0.3)]`} />
                 </div>
              </div>
              
              <section className="space-y-12">
                <div className="flex justify-between items-center px-1">
                  <div className="space-y-1">
                    <h2 className="text-sm font-black uppercase tracking-[0.3em] opacity-40">Operational Phases</h2>
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => setViewDateOffset(0)}
                        className={`text-[10px] font-black uppercase tracking-widest transition-all pb-1 border-b-2 ${viewDateOffset === 0 ? 'text-sky-600 border-sky-600' : 'text-slate-400 border-transparent'}`}
                      >
                        Today
                      </button>
                      <button 
                        onClick={() => setViewDateOffset(1)}
                        className={`text-[10px] font-black uppercase tracking-widest transition-all pb-1 border-b-2 ${viewDateOffset === 1 ? 'text-sky-600 border-sky-600' : 'text-slate-400 border-transparent'}`}
                      >
                        Tomorrow
                      </button>
                    </div>
                  </div>
                  <button onClick={() => setIsHabitModalOpen(true)} className={`w-10 h-10 rounded-xl border ${themeStyles.border} ${themeStyles.card} flex items-center justify-center active:scale-95 transition-all hover:bg-slate-50 shadow-sm`}><Plus className="w-5 h-5 text-sky-600" /></button>
                </div>
                
                {habits.length > 0 ? (
                  <div className="space-y-12 animate-in fade-in duration-300">
                    {(groupedHabits.morning.length === 0 && groupedHabits.afternoon.length === 0 && groupedHabits.night.length === 0) ? (
                       <div className="py-24 text-center opacity-20">
                         <CalendarDays className="w-12 h-12 mx-auto mb-4 text-sky-900" />
                         <p className="text-[10px] font-black uppercase tracking-[0.4em] text-sky-900">
                           No missions active in this temporal sector.
                         </p>
                       </div>
                    ) : (
                      <>
                        {groupedHabits.morning.length > 0 && (
                          <div className="space-y-5">
                            <div className="flex items-center gap-3 px-1">
                              <Zap className="w-4 h-4 text-amber-500" />
                              <h3 className={`text-[10px] font-black uppercase tracking-[0.4em] ${theme === 'dark' ? 'text-sky-200' : 'text-black'}`}>Phase I</h3>
                              <div className={`flex-1 h-px opacity-50 ${theme === 'dark' ? 'bg-blue-900' : 'bg-slate-100'}`} />
                            </div>
                            <div className="space-y-4">
                              {groupedHabits.morning.map(h => <HabitCard key={h.id} habit={h} logs={logs} onToggle={() => triggerAlarm(h)} onEdit={(h) => { setEditingHabit(h); setIsHabitModalOpen(true); }} onDelete={(id) => setHabits(prev => prev.filter(p => p.id !== id))} theme={theme} />)}
                            </div>
                          </div>
                        )}
                        {groupedHabits.afternoon.length > 0 && (
                          <div className="space-y-5">
                            <div className="flex items-center gap-3 px-1">
                              <Activity className="w-4 h-4 text-sky-500" />
                              <h3 className={`text-[10px] font-black uppercase tracking-[0.4em] ${theme === 'dark' ? 'text-sky-200' : 'text-black'}`}>Phase II</h3>
                              <div className={`flex-1 h-px opacity-50 ${theme === 'dark' ? 'bg-blue-900' : 'bg-slate-100'}`} />
                            </div>
                            <div className="space-y-4">
                              {groupedHabits.afternoon.map(h => <HabitCard key={h.id} habit={h} logs={logs} onToggle={() => triggerAlarm(h)} onEdit={(h) => { setEditingHabit(h); setIsHabitModalOpen(true); }} onDelete={(id) => setHabits(prev => prev.filter(p => p.id !== id))} theme={theme} />)}
                            </div>
                          </div>
                        )}
                        {groupedHabits.night.length > 0 && (
                          <div className="space-y-5">
                            <div className="flex items-center gap-3 px-1">
                              <Radio className="w-4 h-4 text-sky-600" />
                              <h3 className={`text-[10px] font-black uppercase tracking-[0.4em] ${theme === 'dark' ? 'text-sky-200' : 'text-black'}`}>Phase III</h3>
                              <div className={`flex-1 h-px opacity-50 ${theme === 'dark' ? 'bg-blue-900' : 'bg-slate-100'}`} />
                            </div>
                            <div className="space-y-4">
                              {groupedHabits.night.map(h => <HabitCard key={h.id} habit={h} logs={logs} onToggle={() => triggerAlarm(h)} onEdit={(h) => { setEditingHabit(h); setIsHabitModalOpen(true); }} onDelete={(id) => setHabits(prev => prev.filter(p => p.id !== id))} theme={theme} />)}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <div className="py-24 text-center opacity-20"><Layers className="w-12 h-12 mx-auto mb-4 text-sky-900" /><p className="text-[10px] font-black uppercase tracking-[0.4em] text-sky-900">{t.home.noProtocols}</p></div>
                )}
              </section>
            </div>
          )}

          {activeTab === 'library' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
              <div className="space-y-6">
                <h2 className={`text-3xl font-black uppercase tracking-tighter leading-none ${themeStyles.heading}`}>{t.vault.title}</h2>
                <button onClick={() => setIsHabitModalOpen(true)} className="w-full flex items-center p-6 bg-sky-600 text-white rounded-[2rem] shadow-xl group active:scale-[0.98] transition-all hover:bg-sky-500">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center"><Plus className="w-6 h-6" /></div>
                  <div className="ml-5 text-left"><h4 className="font-black text-sm uppercase tracking-tight">{t.vault.deployCustom}</h4><p className="text-[10px] font-black uppercase opacity-60 tracking-widest mt-0.5 text-sky-100">Manual Input</p></div>
                </button>
                <div className="grid grid-cols-1 gap-4">
                  {HABIT_TEMPLATES.map((tmp, i) => (
                    <button key={i} onClick={() => { const { icon, ...templateData } = tmp; setHabits(prev => [...prev, { ...templateData, id: Math.random().toString(36).substr(2,9), frequency: 'daily', recurrenceMode: 'fixed', interval: 1, days: [0,1,2,3,4,5,6], createdAt: Date.now(), streak: 0 } as Habit]); setActiveTab('home'); }} className={`flex items-center p-5 ${themeStyles.card} border ${themeStyles.border} rounded-[1.5rem] group active:scale-[0.98] transition-all hover:border-sky-400/30`}><div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center">{tmp.icon}</div><div className="ml-5 flex-1 text-left"><h4 className={`font-black text-sm uppercase tracking-tight ${themeStyles.heading}`}>{tmp.name}</h4><p className="text-[10px] font-black opacity-30 uppercase tracking-widest mt-0.5">{tmp.category}</p></div><Plus className="w-4 h-4 opacity-10 group-hover:opacity-40 transition-opacity" /></button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className={`flex flex-col h-full animate-in fade-in duration-500 ${theme === 'dark' ? 'bg-[#050b18]' : 'bg-white'}`}>
              <div className={`pt-4 pb-3 px-4 border-b ${themeStyles.border} ${theme === 'dark' ? 'bg-[#050b18]/80' : 'bg-white/80'} backdrop-blur-xl flex flex-col items-center relative overflow-hidden shrink-0`}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(14,165,233,0.1),transparent_70%)] pointer-events-none" />
                <div className="relative mb-3 w-20 h-20"><NeuralCore active={true} theme={theme} /></div>
                <h2 className={`text-lg font-black uppercase tracking-tighter italic ${themeStyles.heading}`}>Tactical Command</h2>
                <div className="flex items-center gap-4 mt-2 w-full max-w-xs px-4">
                  <div className="flex-1 flex flex-col gap-1">
                    <div className="flex justify-between items-center text-[7px] font-black uppercase tracking-widest opacity-40"><span>Neural Synapse</span><span>{profile.motivationScore}% Sync</span></div>
                    <div className={`h-1 rounded-full w-full overflow-hidden ${theme === 'dark' ? 'bg-blue-900/30' : 'bg-slate-100'}`}><div className="h-full bg-sky-500 transition-all duration-1000 shadow-[0_0_8px_rgba(14,165,233,0.5)]" style={{ width: `${profile.motivationScore}%` }} /></div>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar pb-52 relative">
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(rgba(14,165,233,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.1)_1px,transparent_1px)] bg-[size:20px_20px]" />
                {chatHistory.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} relative z-10 animate-in fade-in slide-in-from-bottom-2`}>
                    <div className={`max-w-[85%] p-4 text-[13px] font-bold leading-relaxed shadow-lg border-2 ${msg.role === 'user' ? (theme === 'cyber' ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400 rounded-2xl rounded-tr-none' : (theme === 'dark' ? 'bg-blue-900/20 border-blue-800 text-white rounded-2xl rounded-tr-none' : 'bg-sky-50 border-sky-100 text-black rounded-2xl rounded-tr-none')) : (theme === 'cyber' ? 'bg-black border-cyan-500 text-cyan-400 rounded-2xl rounded-tl-none' : (theme === 'dark' ? 'bg-blue-600 border-blue-500 text-white rounded-2xl rounded-tl-none shadow-blue-500/20' : 'bg-white border-slate-200 text-black rounded-2xl rounded-tl-none'))}`}>
                      <div className="flex items-center gap-2 mb-2 opacity-40">{msg.role === 'coach' ? <Hash className="w-3 h-3" /> : <Terminal className="w-3 h-3" />}<span className="text-[8px] font-black uppercase tracking-widest">{msg.role === 'coach' ? 'Link Response' : 'Outgoing Packet'}</span></div>
                      {msg.text}
                      <div className="mt-3 text-[7px] font-black uppercase tracking-[0.2em] opacity-30 text-right">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </div>
                ))}
                {(isAiLoading || isAiSpeaking) && (
                  <div className="flex justify-start relative z-10">
                    <div className={`${theme === 'dark' ? 'bg-blue-900/50' : 'bg-slate-100/50'} p-4 rounded-2xl flex gap-1.5 items-center`}>
                      <div className={`w-1.5 h-1.5 rounded-full animate-bounce ${isAiSpeaking ? 'bg-emerald-400' : 'bg-sky-500'}`} />
                      <div className={`w-1.5 h-1.5 rounded-full animate-bounce ${isAiSpeaking ? 'bg-emerald-400' : 'bg-sky-500'}`} style={{ animationDelay: '0.2s' }} />
                      <div className={`w-1.5 h-1.5 rounded-full animate-bounce ${isAiSpeaking ? 'bg-emerald-400' : 'bg-sky-500'}`} style={{ animationDelay: '0.4s' }} />
                      {isAiSpeaking && <VolumeIcon className="w-3 h-3 ml-2 text-emerald-400" />}
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              
              <div className={`p-4 border-t ${themeStyles.border} ${theme === 'dark' ? 'bg-[#050b18]/95' : 'bg-white/95'} backdrop-blur-3xl fixed bottom-24 left-0 right-0 max-w-md mx-auto z-50`}>
                <div className="flex flex-col gap-4">
                  <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar -mx-4 px-4">
                    {QUICK_COMMANDS.map((cmd, idx) => (
                      <button key={idx} onClick={() => cmd.isAudit ? askCoach("", true) : askCoach(cmd.prompt)} className={`shrink-0 flex items-center gap-2 px-4 py-2.5 border rounded-xl text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all whitespace-nowrap shadow-sm ${theme === 'dark' ? 'bg-blue-950 border-blue-900 text-sky-400 hover:bg-blue-900' : 'bg-white border-slate-100 text-sky-600 hover:bg-slate-50'}`}><cmd.icon className="w-3 h-3" /> {cmd.label}</button>
                    ))}
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between px-1"><div className="flex items-center gap-2 opacity-40"><Terminal className="w-3 h-3" /><span className="text-[8px] font-black uppercase tracking-[0.2em]">Ready for input...</span></div></div>
                    <div className="relative flex gap-2">
                      <div className={`flex-1 flex items-center border rounded-2xl overflow-hidden transition-all duration-300 ${theme === 'dark' ? 'bg-blue-950/50 border-blue-900 focus-within:border-sky-500' : 'bg-slate-50 border-slate-200 focus-within:border-sky-500'}`}>
                        <input ref={chatInputRef} type="text" placeholder="Execute command..." className="flex-1 bg-transparent py-4 px-5 text-sm font-bold outline-none placeholder:opacity-30" onKeyDown={(e) => { if (e.key === 'Enter') { askCoach(e.currentTarget.value); e.currentTarget.value = ''; } }} />
                        <button onClick={toggleSpeech} className={`w-12 h-12 flex items-center justify-center transition-all shrink-0 ${isRecording ? 'text-red-500 scale-110' : 'text-sky-600 opacity-60 hover:opacity-100'}`}>{isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}</button>
                      </div>
                      <button onClick={() => { if (chatInputRef.current?.value) { askCoach(chatInputRef.current.value); chatInputRef.current.value = ''; } }} className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white active:scale-90 transition-all shadow-xl ${theme === 'cyber' ? 'bg-cyan-500 shadow-cyan-500/30' : 'bg-sky-600 shadow-sky-600/30'}`}><Send className="w-6 h-6" /></button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
              <div className="flex flex-col items-center py-12">
                <div className="relative mb-8 group">
                  <div className="absolute inset-0 bg-sky-500 blur-3xl opacity-10 group-hover:opacity-30 transition-opacity" />
                  <div className={`w-40 h-40 rounded-[3rem] border-4 flex items-center justify-center overflow-hidden relative shadow-3xl ${theme === 'dark' ? 'bg-blue-950 border-blue-900' : 'bg-white border-slate-100'}`}>{profile.profilePic ? <img src={profile.profilePic} className="w-full h-full object-cover" /> : <User className="w-20 h-20 opacity-10 text-sky-900" />}</div>
                  <button onClick={() => setIsEditingProfile(true)} className="absolute -bottom-2 -right-2 w-12 h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center shadow-2xl border-4 border-transparent active:scale-90 transition-all"><UserCog className="w-5 h-5" /></button>
                </div>
                <h3 className={`text-3xl font-black uppercase tracking-tighter leading-none mb-2 ${themeStyles.heading}`}>{profile.name}</h3>
                <p className="text-[10px] font-black uppercase tracking-[0.6em] opacity-40 text-sky-900">Operator</p>
              </div>
              <div className="grid grid-cols-1 gap-4">
                 <button onClick={() => setIsEditingProfile(true)} className={`p-6 ${themeStyles.card} border ${themeStyles.border} rounded-[1.5rem] flex items-center justify-between group active:scale-[0.98] transition-all hover:border-sky-300`}><div className="flex items-center gap-5"><div className={`w-12 h-12 rounded-xl flex items-center justify-center ${theme === 'dark' ? 'bg-blue-900 text-sky-400' : 'bg-slate-50 text-sky-600'}`}><UserCog className="w-5 h-5" /></div><div><p className={`text-sm font-black uppercase tracking-tight ${themeStyles.heading}`}>{t.profile.modify}</p></div></div><ChevronRight className="w-4 h-4 opacity-20" /></button>
                 <button onClick={() => { if (navigator.share) navigator.share({ title: 'COMMANDER Tactical Progress', text: `Tactical Progress: Momentum at ${profile.motivationScore}.` }); }} className={`p-6 ${themeStyles.card} border ${themeStyles.border} rounded-[1.5rem] flex items-center justify-between group active:scale-[0.98] transition-all hover:border-emerald-300`}><div className="flex items-center gap-5"><div className={`w-12 h-12 rounded-xl flex items-center justify-center ${theme === 'dark' ? 'bg-emerald-900/40 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}><Share2 className="w-5 h-5" /></div><div><p className={`text-sm font-black uppercase tracking-tight ${themeStyles.heading}`}>{t.profile.share}</p></div></div><Users className="w-4 h-4 opacity-20" /></button>
                 <button onClick={() => setIsRateModalOpen(true)} className={`p-6 ${themeStyles.card} border ${themeStyles.border} rounded-[1.5rem] flex items-center justify-between group active:scale-[0.98] transition-all hover:border-sky-300`}><div className="flex items-center gap-5"><div className={`w-12 h-12 rounded-xl flex items-center justify-center ${theme === 'dark' ? 'bg-sky-900/40 text-sky-400' : 'bg-sky-50 text-sky-600'}`}><Star className="w-5 h-5" /></div><div><p className={`text-sm font-black uppercase tracking-tight ${themeStyles.heading}`}>{t.profile.rate}</p></div></div><ChevronRight className="w-4 h-4 opacity-20" /></button>
              </div>
              
              {/* SOCIAL HUD LINKS */}
              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-3 px-2 opacity-30">
                  <span className="text-[8px] font-black uppercase tracking-[0.4em]">Follow Command HQ</span>
                  <div className="flex-1 h-px bg-current" />
                </div>
                <div className="flex justify-center gap-6">
                  <a href="https://x.com/maind_pilothq" target="_blank" rel="noopener noreferrer" className={`p-5 rounded-2xl border transition-all active:scale-90 shadow-sm flex items-center justify-center ${themeStyles.card} ${themeStyles.border} text-sky-400 hover:text-sky-500 hover:border-sky-400/50`}>
                    <Twitter className="w-6 h-6" />
                  </a>
                  <a href="https://www.instagram.com/mind_pilothq?igsh=MXhqb2NxcWd0aHpwMw==" target="_blank" rel="noopener noreferrer" className={`p-5 rounded-2xl border transition-all active:scale-90 shadow-sm flex items-center justify-center ${themeStyles.card} ${themeStyles.border} text-pink-500 hover:text-pink-600 hover:border-pink-500/50`}>
                    <Instagram className="w-6 h-6" />
                  </a>
                </div>
                <p className="text-[7px] font-black uppercase tracking-widest text-center opacity-20">Secure Social Protocols Established</p>
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
               <div className={`flex p-1 rounded-2xl ${themeStyles.subnav}`}>
                  {['calendar', 'achievements', 'statistics', 'history'].map((s: any) => (<button key={s} onClick={() => setStatsSubTab(s)} className={`flex-1 py-3 text-[10px] font-black uppercase rounded-xl transition-all ${statsSubTab === s ? (theme === 'cyber' ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20' : (theme === 'dark' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-sky-600 text-white shadow-lg shadow-sky-600/20')) : 'text-sky-400 hover:text-sky-600'}`}>{s}</button>))}
               </div>
               {statsSubTab === 'calendar' && <CalendarModule habits={habits} logs={logs} theme={theme} onAddProtocol={() => { setEditingHabit(null); setIsHabitModalOpen(true); }} />}
               {statsSubTab === 'statistics' && <StatisticsModule habits={habits} logs={logs} theme={theme} />}
               {statsSubTab === 'achievements' && <AchievementsModule habits={habits} logs={logs} theme={theme} />}
               {statsSubTab === 'history' && <HistoryModule habits={habits} logs={logs} theme={theme} />}
            </div>
          )}
        </div>
      </main>

      <nav className={`shrink-0 h-24 ${themeStyles.navBg} border-t ${themeStyles.border} px-8 flex items-center justify-between z-50 relative`}>
        {[
          { id: 'home', icon: LayoutDashboard, label: t.nav.home },
          { id: 'library', icon: Library, label: t.nav.library },
          { id: 'stats', icon: BarChart3, label: t.nav.stats },
          { id: 'ai', icon: Bot, label: t.nav.ai }
        ].map((item) => (
          <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`flex flex-col items-center justify-center gap-1.5 transition-all group relative px-4 py-2 ${activeTab === item.id ? themeStyles.navActive : themeStyles.navInactive}`}>
            {activeTab === item.id && <div className={`absolute inset-0 rounded-2xl ${themeStyles.subnav} opacity-30 scale-110 blur-sm`} />}
            <item.icon className={`w-6 h-6 transition-transform ${activeTab === item.id ? 'scale-110 drop-shadow-[0_0_8px_rgba(14,165,233,0.3)]' : 'group-hover:scale-110 opacity-60'}`} />
            <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;
