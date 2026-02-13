
import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Globe, Phone, ShieldCheck, Fingerprint, Eye, EyeOff, Check, ShieldAlert, Key, RotateCcw } from 'lucide-react';
import { UserProfile } from '../types';

interface AuthProps {
  onLogin: (profile: UserProfile) => void;
}

type AuthMode = 'login' | 'signup' | 'phone' | 'forgot';

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [phoneStep, setPhoneStep] = useState<'number' | 'otp'>('number');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [recoverySent, setRecoverySent] = useState(false);

  const createMockProfile = (source: string, customName?: string): UserProfile => {
    return {
      name: customName || 'COMMANDER',
      age: 25,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      dailyGoal: 5,
      joinedAt: Date.now(),
      motivationScore: 100,
      enableSound: true,
      enableVibration: true,
      notifStyle: 'banner' as const,
      language: 'en-US',
      theme: 'light',
      alarmSound: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
      voiceName: 'Charon'
    };
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading('email');
    setTimeout(() => {
      onLogin(createMockProfile('email', 'COMMANDER'));
      setLoading(null);
    }, 1500);
  };

  const handleRecoverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading('recovery');
    setTimeout(() => {
      setRecoverySent(true);
      setLoading(null);
    }, 1800);
  };

  const handleGoogleLogin = () => {
    setLoading('google');
    setTimeout(() => {
      onLogin(createMockProfile('google', 'COMMANDER'));
      setLoading(null);
    }, 1200);
  };

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneStep === 'number') {
      setLoading('phone');
      setTimeout(() => {
        setPhoneStep('otp');
        setLoading(null);
      }, 1000);
    } else {
      setLoading('otp');
      setTimeout(() => {
        onLogin(createMockProfile('phone', 'COMMANDER'));
        setLoading(null);
      }, 1200);
    }
  };

  const resetAuthStates = () => {
    setMode('login');
    setRecoverySent(false);
    setPhoneStep('number');
    setLoading(null);
  };

  return (
    <div className="min-h-screen bg-sky-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-sky-200/40 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-300/30 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-sky-600 rounded-[2.5rem] shadow-2xl shadow-sky-500/30 mb-6 rotate-3">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-black text-sky-950 tracking-tighter mb-2 italic uppercase">MINDPILOT</h1>
          <p className="text-sky-600 font-bold uppercase tracking-[0.3em] text-[10px]">Elite Tactical Command</p>
        </div>

        <div className="bg-white/90 backdrop-blur-2xl border border-sky-100 rounded-[2.5rem] p-8 shadow-[0_32px_64px_-12px_rgba(14,165,233,0.15)]">
          {(mode === 'login' || mode === 'signup') && (
            <div className="flex gap-4 mb-8">
              <button 
                onClick={() => setMode('login')}
                className={`flex-1 pb-4 text-sm font-black uppercase tracking-widest transition-all border-b-2 ${mode === 'login' ? 'border-sky-500 text-sky-950' : 'border-transparent text-sky-300'}`}
              >
                Login
              </button>
              <button 
                onClick={() => setMode('signup')}
                className={`flex-1 pb-4 text-sm font-black uppercase tracking-widest transition-all border-b-2 ${mode === 'signup' ? 'border-sky-500 text-sky-950' : 'border-transparent text-sky-300'}`}
              >
                Sign Up
              </button>
            </div>
          )}

          {mode === 'forgot' ? (
            <div className="animate-in fade-in zoom-in-95 duration-300">
              {!recoverySent ? (
                <form onSubmit={handleRecoverySubmit} className="space-y-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-sky-500" />
                      <h3 className="text-sky-950 font-black uppercase text-xs tracking-widest">Secure Recovery</h3>
                    </div>
                    <button 
                      type="button" 
                      onClick={resetAuthStates}
                      className="text-sky-400 text-[9px] font-black uppercase tracking-widest hover:text-sky-600 transition-colors"
                    >
                      Abort
                    </button>
                  </div>
                  <p className="text-[10px] text-sky-600 font-bold uppercase tracking-widest leading-relaxed">
                    Initiating override. Enter dispatch email for recovery protocol.
                  </p>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-sky-300 group-focus-within:text-sky-500">
                      <Mail className="w-5 h-5" />
                    </div>
                    <input 
                      type="email" 
                      required
                      placeholder="Email Address"
                      className="w-full bg-sky-50/50 border border-sky-100 rounded-2xl py-4 pl-12 pr-4 text-sky-950 focus:outline-none focus:border-sky-500 transition-all font-medium"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={!!loading}
                    className="w-full bg-sky-600 hover:bg-sky-500 text-white font-black py-5 rounded-2xl shadow-xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-50 mt-2 uppercase tracking-widest text-sm shadow-sky-600/20"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        Initiate Recovery Protocol
                        <Key className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="text-center py-4 space-y-6">
                  <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-emerald-500" />
                  </div>
                  <div>
                    <h4 className="text-sky-950 font-black uppercase text-sm tracking-widest mb-2">Protocol Dispatched</h4>
                    <p className="text-[10px] text-sky-600 font-bold uppercase tracking-widest leading-relaxed">
                      Recovery handshake initiated. check {email} for verification link.
                    </p>
                  </div>
                  <button 
                    onClick={resetAuthStates}
                    className="w-full bg-sky-50 border border-sky-100 text-sky-600 font-black py-4 rounded-2xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all uppercase tracking-widest text-xs"
                  >
                    <RotateCcw className="w-4 h-4" /> Return to Command
                  </button>
                </div>
              )}
            </div>
          ) : mode === 'phone' ? (
            <form onSubmit={handlePhoneSubmit} className="space-y-5 animate-in fade-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sky-950 font-black uppercase text-xs tracking-widest">Phone Verification</h3>
                <button 
                  type="button" 
                  onClick={resetAuthStates}
                  className="text-sky-500 text-[10px] font-black uppercase tracking-widest"
                >
                  Go Back
                </button>
              </div>
              {phoneStep === 'number' ? (
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-sky-300 group-focus-within:text-sky-500">
                    <Phone className="w-5 h-5" />
                  </div>
                  <input 
                    type="tel" 
                    required
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-sky-50/50 border border-sky-100 rounded-2xl py-4 pl-12 pr-4 text-sky-950 placeholder:text-sky-200 focus:outline-none focus:border-sky-500 transition-all font-medium"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-[10px] text-sky-600 font-bold uppercase tracking-widest text-center">Enter terminal code</p>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-sky-300 group-focus-within:text-sky-500">
                      <Fingerprint className="w-5 h-5" />
                    </div>
                    <input 
                      type="text" 
                      required
                      maxLength={6}
                      placeholder="0 0 0 0 0 0"
                      className="w-full bg-sky-50/50 border border-sky-100 rounded-2xl py-4 pl-12 pr-4 text-sky-950 text-center tracking-[0.5em] text-xl font-black placeholder:text-sky-200 focus:outline-none focus:border-sky-500 transition-all"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>
                </div>
              )}
              <button 
                type="submit" 
                disabled={!!loading}
                className="w-full bg-sky-600 hover:bg-sky-500 text-white font-black py-5 rounded-2xl shadow-xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-50 mt-2 uppercase tracking-widest text-sm shadow-sky-600/20"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    {phoneStep === 'number' ? 'Send Access Code' : 'Verify Identity'}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleEmailSubmit} className="space-y-5">
              {mode === 'signup' && (
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-sky-300 group-focus-within:text-sky-500">
                    <User className="w-5 h-5" />
                  </div>
                  <input 
                    type="text" 
                    required
                    placeholder="Full Name"
                    className="w-full bg-sky-50/50 border border-sky-100 rounded-2xl py-4 pl-12 pr-4 text-sky-950 placeholder:text-sky-200 focus:outline-none focus:border-sky-500 transition-all font-medium"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              )}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-sky-300 group-focus-within:text-sky-500">
                  <Mail className="w-5 h-5" />
                </div>
                <input 
                  type="email" 
                  required
                  placeholder="Email Address"
                  className="w-full bg-sky-50/50 border border-sky-100 rounded-2xl py-4 pl-12 pr-4 text-sky-950 placeholder:text-sky-200 focus:outline-none focus:border-sky-500 transition-all font-medium"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-sky-300 group-focus-within:text-sky-500">
                  <Lock className="w-5 h-5" />
                </div>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  required
                  placeholder="Secure Password"
                  className="w-full bg-sky-50/50 border border-sky-100 rounded-2xl py-4 pl-12 pr-12 text-sky-950 placeholder:text-sky-200 focus:outline-none focus:border-sky-500 transition-all font-medium"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-sky-300 hover:text-sky-500 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {mode === 'login' && (
                <div className="text-right">
                  <button 
                    type="button" 
                    onClick={() => setMode('forgot')}
                    className="text-xs font-bold text-sky-400 hover:text-sky-600 transition-colors uppercase tracking-widest"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}
              <button 
                type="submit" 
                disabled={!!loading}
                className="w-full bg-sky-600 hover:bg-sky-500 text-white font-black py-5 rounded-2xl shadow-xl shadow-sky-600/20 flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-50 mt-2 uppercase tracking-widest text-sm"
              >
                {loading === 'email' ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    {mode === 'login' ? 'Authorize Command' : 'Initialize Profile'}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          )}

          {mode !== 'forgot' && (
            <>
              <div className="flex items-center my-8">
                <div className="flex-1 h-px bg-sky-100"></div>
                <span className="px-4 text-[10px] font-black text-sky-300 uppercase tracking-[0.3em]">External Sync</span>
                <div className="flex-1 h-px bg-sky-100"></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  type="button"
                  disabled={!!loading}
                  className="flex items-center justify-center gap-3 bg-sky-50/50 border border-sky-100 rounded-2xl py-4 text-sky-950 hover:bg-sky-100 transition-all active:scale-95 disabled:opacity-50"
                  onClick={handleGoogleLogin}
                >
                  {loading === 'google' ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Globe className="w-5 h-5 text-sky-500" />
                      <span className="text-xs font-black uppercase tracking-widest">Google</span>
                    </>
                  )}
                </button>
                <button 
                  type="button"
                  disabled={!!loading}
                  className="flex items-center justify-center gap-3 bg-sky-50/50 border border-sky-100 rounded-2xl py-4 text-sky-950 hover:bg-sky-100 transition-all active:scale-95 disabled:opacity-50"
                  onClick={() => setMode('phone')}
                >
                  <Phone className="w-5 h-5 text-sky-500" />
                  <span className="text-xs font-black uppercase tracking-widest">Phone</span>
                </button>
              </div>
            </>
          )}
        </div>
        <p className="text-center mt-10 text-sky-400 text-xs font-medium leading-relaxed">
          Operational access implies agreement with <span className="text-sky-600 font-bold underline cursor-pointer">Protocol Terms</span>.
        </p>
      </div>
    </div>
  );
};

export default Auth;
