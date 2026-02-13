
import React, { useState } from 'react';
import { X, Save, Clock, ShieldCheck, Info, Bell, Mic, Phone, Trash2, CalendarDays, Repeat, ShieldAlert } from 'lucide-react';
import { Habit, HabitAlertType } from '../types.ts';

interface HabitFormModalProps {
  habit?: Habit;
  onSave: (habit: Partial<Habit>) => void;
  onDelete?: (habitId: string) => void;
  onCancel: () => void;
  theme: 'light' | 'dark' | 'cyber';
}

const HabitFormModal: React.FC<HabitFormModalProps> = ({ habit, onSave, onDelete, onCancel, theme }) => {
  const [formData, setFormData] = useState<Partial<Habit>>(habit || {
    name: '',
    category: 'Personal',
    time: '09:00',
    duration: 30,
    days: [0, 1, 2, 3, 4, 5, 6],
    frequency: 'daily',
    recurrenceMode: 'fixed',
    interval: 1,
    distractionBlocker: true,
    alertType: 'standard',
    intention: ''
  });

  const themeStyles = {
    light: 'bg-white text-black border-slate-200',
    dark: 'bg-[#050b18]/95 text-white border-blue-900 shadow-2xl backdrop-blur-3xl',
    cyber: 'bg-black text-[#00ff41] border-[#00ff41]'
  }[theme];

  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const toggleDay = (dayIdx: number) => {
    const newDays = formData.days?.includes(dayIdx)
      ? formData.days.filter(d => d !== dayIdx)
      : [...(formData.days || []), dayIdx];
    setFormData({ ...formData, days: newDays });
  };

  const alertProtocols: { id: HabitAlertType; label: string; icon: any }[] = [
    { id: 'standard', label: 'STANDARD ALERT', icon: Bell },
    { id: 'voice_ai', label: 'NEURAL VOICE', icon: Mic },
    { id: 'phone_call', label: 'PHONE CALL', icon: Phone },
  ];

  const inputStyle = theme === 'dark' ? 'bg-blue-950 border-blue-900 text-white' : 'bg-slate-50 border-slate-200 text-black';

  return (
    <div className="fixed inset-0 z-[500] bg-sky-900/20 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className={`w-full max-w-sm rounded-[2.5rem] border-2 flex flex-col max-h-[90vh] shadow-2xl ${themeStyles} animate-in zoom-in-95 duration-500 overflow-hidden`}>
        <div className={`p-6 border-b flex justify-between items-center ${theme === 'dark' ? 'border-blue-900/50' : 'border-slate-100'}`}>
          <h2 className="text-xl font-black uppercase tracking-tight">
            {habit ? 'Edit Protocol' : 'Deploy Protocol'}
          </h2>
          <button onClick={onCancel} className="p-2 opacity-50 hover:opacity-100 transition-opacity"><X className="w-5 h-5 text-sky-600" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">Protocol Designation</label>
            <input 
              type="text" 
              placeholder="e.g., Morning Run"
              className={`w-full rounded-2xl py-4 px-6 text-sm font-bold outline-none border-2 transition-all ${inputStyle}`}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">Execution Time</label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30 text-sky-600" />
                <input 
                  type="time" 
                  className={`w-full rounded-2xl py-4 pl-12 pr-4 text-sm font-bold outline-none border-2 transition-all ${inputStyle}`}
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">Duration (Min)</label>
              <input 
                type="number" 
                className={`w-full rounded-2xl py-4 px-6 text-sm font-bold outline-none border-2 transition-all ${inputStyle}`}
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">Recurrence Protocol</label>
            <div className={`flex p-1 rounded-2xl ${theme === 'dark' ? 'bg-blue-950 border border-blue-900' : 'bg-slate-50 border border-slate-200'}`}>
              <button 
                onClick={() => setFormData({ ...formData, recurrenceMode: 'fixed' })}
                className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase transition-all ${formData.recurrenceMode === 'fixed' ? 'bg-sky-600 text-white shadow-lg' : 'text-sky-400'}`}
              >
                <CalendarDays className="w-3.5 h-3.5" /> Fixed Cycle
              </button>
              <button 
                onClick={() => setFormData({ ...formData, recurrenceMode: 'interval' })}
                className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase transition-all ${formData.recurrenceMode === 'interval' ? 'bg-sky-600 text-white shadow-lg' : 'text-sky-400'}`}
              >
                <Repeat className="w-3.5 h-3.5" /> Interval
              </button>
            </div>
          </div>

          {formData.recurrenceMode === 'fixed' ? (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">Active Cycles</label>
              <div className="flex justify-between gap-1">
                {DAYS.map((day, idx) => (
                  <button
                    key={day}
                    onClick={() => toggleDay(idx)}
                    className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase transition-all border-2 ${
                      formData.days?.includes(idx)
                        ? 'bg-sky-600 border-sky-600 text-white shadow-lg'
                        : `border-transparent ${theme === 'dark' ? 'bg-blue-900/20 text-blue-300' : 'bg-slate-100 text-slate-400'}`
                    }`}
                  >
                    {day[0]}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-50">Neural Pulse Frequency</label>
                <span className="text-xs font-black text-sky-600">Every {formData.interval} Days</span>
              </div>
              <input 
                type="range"
                min="1"
                max="30"
                step="1"
                className="w-full h-2 bg-sky-100 rounded-lg appearance-none cursor-pointer accent-sky-600"
                value={formData.interval}
                onChange={(e) => setFormData({ ...formData, interval: parseInt(e.target.value) })}
              />
            </div>
          )}

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">Alert Protocols</label>
            <div className="grid grid-cols-1 gap-2">
              {alertProtocols.map((protocol) => {
                const Icon = protocol.icon;
                const isActive = formData.alertType === protocol.id;
                return (
                  <button
                    key={protocol.id}
                    onClick={() => setFormData({ ...formData, alertType: protocol.id })}
                    className={`flex items-center gap-4 px-5 py-4 rounded-2xl border-2 transition-all ${
                      isActive 
                        ? 'bg-sky-600 border-sky-600 text-white shadow-xl scale-[1.02]' 
                        : `border-transparent ${theme === 'dark' ? 'bg-blue-950/40 text-blue-300 hover:bg-blue-950/60' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'opacity-40'}`} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{protocol.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">Integrity Features</label>
            <button 
              onClick={() => setFormData({ ...formData, distractionBlocker: !formData.distractionBlocker })}
              className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${
                formData.distractionBlocker 
                  ? 'bg-red-500/10 border-red-500 text-red-500 shadow-lg' 
                  : (theme === 'dark' ? 'bg-blue-950/40 border-blue-900 text-blue-300' : 'bg-slate-50 border-slate-200 text-slate-400')
              }`}
            >
              <div className="flex items-center gap-3">
                <ShieldAlert className={`w-5 h-5 ${formData.distractionBlocker ? 'text-red-500' : 'opacity-40'}`} />
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase tracking-widest leading-none">Focus Protocol</p>
                  <p className="text-[8px] font-black uppercase opacity-60 tracking-widest mt-1">Warns on switch. >3 breaches degrades streak.</p>
                </div>
              </div>
              <div className={`w-10 h-5 rounded-full relative transition-colors ${formData.distractionBlocker ? 'bg-red-500' : 'bg-slate-300'}`}>
                <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${formData.distractionBlocker ? 'right-1' : 'left-1'}`} />
              </div>
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">Strategic Intention</label>
            <textarea 
              placeholder="Why is this mission critical?"
              className={`w-full rounded-2xl py-4 px-6 text-sm font-bold outline-none border-2 transition-all resize-none h-20 ${inputStyle}`}
              value={formData.intention}
              onChange={(e) => setFormData({ ...formData, intention: e.target.value })}
            />
          </div>
        </div>

        <div className={`p-6 border-t flex flex-col gap-3 ${theme === 'dark' ? 'border-blue-900/50' : 'border-slate-100'}`}>
          <button 
            onClick={() => onSave(formData)}
            className="w-full py-4 bg-sky-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all"
          >
            <Save className="w-4 h-4" /> Save Protocol
          </button>
          {habit && (
            <button 
              onClick={() => onDelete?.(habit.id)}
              className="w-full py-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <Trash2 className="w-4 h-4" /> Delete Habit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default HabitFormModal;
