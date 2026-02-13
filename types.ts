
export enum Difficulty {
  EASY = 'Easy',
  MEDIUM = 'Medium',
  HARD = 'Hard'
}

export enum CompletionStatus {
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL'
}

export type AppTheme = 'light' | 'dark' | 'cyber';
export type AlertFrequency = 'high' | 'standard' | 'minimal';
export type HabitAlertType = 'standard' | 'phone_call' | 'voice_ai';
export type NotificationStyle = 'silent' | 'banner' | 'persistent';

export interface Habit {
  id: string;
  name: string;
  category: string;
  time: string; // HH:mm
  duration?: number; // minutes
  frequency: 'daily' | 'weekly' | 'custom';
  recurrenceMode: 'fixed' | 'interval'; // Added for granular scheduling
  interval?: number; // Added for interval-based execution
  days: number[]; // 0-6 for Sunday-Saturday
  notes?: string;
  intention?: string;
  createdAt: number;
  streak: number;
  distractionBlocker?: boolean;
  alertType?: HabitAlertType;
  lastTriggered?: string; // Date string YYYY-MM-DD
}

export interface CompletionLog {
  id: string;
  habitId: string;
  timestamp: number;
  difficulty: Difficulty;
  status: CompletionStatus;
  notes?: string;
}

export interface FocusSession {
  id: string;
  startTime: number;
  duration: number; // minutes
  habitId?: string;
}

export interface UserProfile {
  name: string;
  age: number;
  timezone: string;
  dailyGoal: number;
  joinedAt: number;
  profilePic?: string;
  alarmSound?: string;
  voiceName?: string; // Added for tactical voice selection
  coachAvatar?: string; // Added for AI coach visual identity
  theme?: AppTheme;
  alertFrequency?: AlertFrequency;
  motivationScore: number;
  enableSound: boolean;
  enableVibration: boolean;
  notifStyle: NotificationStyle;
  language: string;
  hasCompletedTutorial?: boolean;
}

export interface AppState {
  habits: Habit[];
  logs: CompletionLog[];
  profile: UserProfile;
}
