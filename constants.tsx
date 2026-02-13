
import React from 'react';
import { Moon, Sun, Coffee, Dumbbell, Book, Brain, Code, Droplets, Smartphone, Heart, PenTool, Layout, GraduationCap, GlassWater, Zap } from 'lucide-react';

export const HABIT_TEMPLATES = [
  { name: 'Sleep Schedule', category: 'Health', icon: <Moon className="w-5 h-5 text-indigo-500" />, time: '22:30', duration: 480 },
  { name: 'Wake Up Routine', category: 'Health', icon: <Sun className="w-5 h-5 text-orange-500" />, time: '06:30', duration: 30 },
  { name: 'Yoga', category: 'Wellness', icon: <Zap className="w-5 h-5 text-amber-500" />, time: '07:00', duration: 20 },
  { name: 'Workout / Gym', category: 'Fitness', icon: <Dumbbell className="w-5 h-5 text-red-500" />, time: '17:30', duration: 60 },
  { name: 'Reading', category: 'Personal Growth', icon: <Book className="w-5 h-5 text-emerald-500" />, time: '21:00', duration: 30 },
  { name: 'Meditation', category: 'Wellness', icon: <Brain className="w-5 h-5 text-purple-500" />, time: '08:00', duration: 15 },
  { name: 'Study Session', category: 'Productivity', icon: <GraduationCap className="w-5 h-5 text-blue-600" />, time: '14:00', duration: 90 },
  { name: 'Writing / Journaling', category: 'Wellness', icon: <PenTool className="w-5 h-5 text-rose-500" />, time: '22:00', duration: 10 },
  { name: 'Water Intake', category: 'Health', icon: <GlassWater className="w-5 h-5 text-sky-500" />, time: '10:00', duration: 2 },
  { name: 'Screen-time Control', category: 'Discipline', icon: <Smartphone className="w-5 h-5 text-slate-500" />, time: '20:00', duration: 0 },
  { name: 'Gratitude Practice', category: 'Wellness', icon: <Heart className="w-5 h-5 text-pink-500" />, time: '08:30', duration: 5 },
  { name: 'Personal Project', category: 'Career', icon: <Layout className="w-5 h-5 text-indigo-600" />, time: '19:00', duration: 60 },
];
