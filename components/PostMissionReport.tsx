
import React, { useState } from 'react';
import { Check, ShieldCheck, Zap, MessageSquare, ArrowRight, XCircle } from 'lucide-react';
import { Difficulty, CompletionStatus } from '../types';

interface PostMissionReportProps {
  habitName: string;
  onConfirm: (difficulty: Difficulty, notes: string, status: CompletionStatus) => void;
  onCancel: () => void;
  theme: 'light' | 'dark' | 'cyber';
}

const PostMissionReport: React.FC<PostMissionReportProps> = ({ habitName, onConfirm, onCancel, theme }) => {
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.MEDIUM);
  const [notes, setNotes] = useState('');

  const themeStyles = {
    light: 'bg-white text-black border-slate-200',
    dark: 'bg-[#050b18]/95 text-white border-blue-900 shadow-3xl backdrop-blur-2xl',
    cyber: 'bg-black text-[#00ff41] border-[#00ff41]'
  }[theme];

  const diffColors = {
    [Difficulty.EASY]: 'bg-emerald-500',
    [Difficulty.MEDIUM]: 'bg-sky-500',
    [Difficulty.HARD]: 'bg-red-500'
  };

  const inputStyle = theme === 'dark' ? 'bg-blue-950 border-blue-900 text-white' : 'bg-slate-50 border-slate-200 text-black';

  return (
    <div className="fixed inset-0 z-[400] bg-sky-900/40 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className={`w-full max-w-sm rounded-[2.5rem] border-2 p-8 shadow-2xl ${themeStyles} animate-in zoom-in-95 duration-500`}>
        <div className="flex items-center gap-3 mb-6">
          <div className={`p-3 rounded-2xl ${theme === 'cyber' ? 'bg-[#00ff41]/20' : 'bg-sky-600/10'}`}>
            <ShieldCheck className="w-8 h-8 text-sky-600" />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight">Mission Debrief</h2>
            <p className="text-[10px] font-black opacity-50 uppercase tracking-[0.2em]">{habitName}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest opacity-50 pl-1">Protocol Difficulty</label>
            <div className="grid grid-cols-3 gap-2">
              {[Difficulty.EASY, Difficulty.MEDIUM, Difficulty.HARD].map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border-2 ${
                    difficulty === d 
                      ? `${diffColors[d]} border-transparent text-white shadow-lg` 
                      : `border-transparent ${theme === 'dark' ? 'bg-blue-950/40 text-blue-300' : 'bg-slate-100 text-slate-400'}`
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest opacity-50 pl-1">Field Notes / Reason</label>
            <div className="relative">
              <MessageSquare className="absolute top-4 left-4 w-4 h-4 opacity-30" />
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Log mission details..."
                className={`w-full rounded-2xl py-4 pl-12 pr-4 text-xs font-bold outline-none border-2 transition-all resize-none h-24 ${inputStyle}`}
              />
            </div>
          </div>

          <div className="pt-4 flex flex-col gap-3">
            <div className="flex gap-3">
              <button 
                onClick={() => onConfirm(difficulty, notes, CompletionStatus.SUCCESS)}
                className={`flex-[2] py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all ${
                  theme === 'cyber' ? 'bg-[#00ff41] text-black shadow-[#00ff41]/20' : 'bg-sky-600 text-white shadow-sky-500/20'
                }`}
              >
                <Check className="w-4 h-4" /> SECURE MISSION
              </button>
              <button 
                onClick={() => onConfirm(difficulty, notes || "Mission failed.", CompletionStatus.FAIL)}
                className="flex-1 py-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500/20 transition-all active:scale-95"
              >
                FAILED
              </button>
            </div>
            <button 
              onClick={onCancel}
              className={`w-full py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest opacity-40 hover:opacity-60 transition-opacity`}
            >
              Skip Reporting
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostMissionReport;
