'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import LanguageSwitcher from '@/app/components/LanguageSwitcher';
import ThemeToggle from '@/app/components/ThemeToggle';

type Phase = 'work' | 'break';

export default function PomodoroTool({ children }: { children?: React.ReactNode }) {
  const t = useTranslations('tools');
  const tc = useTranslations('common');

  const [workMinutes, setWorkMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [phase, setPhase] = useState<Phase>('work');
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalSeconds = phase === 'work' ? workMinutes * 60 : breakMinutes * 60;
  const progress = 1 - secondsLeft / totalSeconds;
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference * (1 - progress);

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  }, []);

  const startTimer = useCallback(() => {
    setIsRunning(true);
  }, []);

  const resetTimer = useCallback(() => {
    stopTimer();
    if (phase === 'work') {
      setSecondsLeft(workMinutes * 60);
    } else {
      setSecondsLeft(breakMinutes * 60);
    }
  }, [phase, workMinutes, breakMinutes, stopTimer]);

  const toggleTimer = useCallback(() => {
    if (isRunning) {
      stopTimer();
    } else {
      startTimer();
    }
  }, [isRunning, stopTimer, startTimer]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            if (phase === 'work') {
              setSessions((s) => s + 1);
              setPhase('break');
              return breakMinutes * 60;
            } else {
              setPhase('work');
              return workMinutes * 60;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, phase, workMinutes, breakMinutes]);

  const changeWorkTime = (delta: number) => {
    const newVal = Math.max(1, Math.min(60, workMinutes + delta));
    setWorkMinutes(newVal);
    if (phase === 'work' && !isRunning) {
      setSecondsLeft(newVal * 60);
    }
  };

  const changeBreakTime = (delta: number) => {
    const newVal = Math.max(1, Math.min(30, breakMinutes + delta));
    setBreakMinutes(newVal);
    if (phase === 'break' && !isRunning) {
      setSecondsLeft(newVal * 60);
    }
  };

  const playNotification = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(660, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } catch {}
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a1a] transition-colors">
      <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center space-x-4">
          <Link href="/tools" className="flex items-center text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            {tc('tools')}
          </Link>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">{t('efficiencyTools.pomodoro')}</span>
        </div>
        <div className="flex items-center space-x-3"><LanguageSwitcher /><ThemeToggle /></div>
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('efficiencyTools.pomodoro')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('efficiencyTools.pomodoroDesc')}</p>
        </div>

        <div className="flex flex-col items-center">
          <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-8 mb-6 w-full max-w-md">
            <div className="flex justify-center gap-4 mb-8">
              <button
                onClick={() => { setPhase('work'); setSecondsLeft(workMinutes * 60); stopTimer(); }}
                className={`px-6 py-2 rounded-xl font-medium transition-all ${phase === 'work' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
              >
                {t('efficiencyTools.pomodoroWork')}
              </button>
              <button
                onClick={() => { setPhase('break'); setSecondsLeft(breakMinutes * 60); stopTimer(); }}
                className={`px-6 py-2 rounded-xl font-medium transition-all ${phase === 'break' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
              >
                {t('efficiencyTools.pomodoroBreak')}
              </button>
            </div>

            <div className="relative w-64 h-64 mx-auto mb-8">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 260 260">
                <circle cx="130" cy="130" r="120" fill="none" stroke={phase === 'work' ? '#fecdd3' : '#d1fae5'} strokeWidth="8" className="dark:opacity-30" />
                <circle
                  cx="130" cy="130" r="120" fill="none"
                  stroke={phase === 'work' ? '#f43f5e' : '#10b981'}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-6xl font-bold text-gray-900 dark:text-white tabular-nums">
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </span>
                <span className={`text-sm mt-2 font-medium ${phase === 'work' ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {phase === 'work' ? t('efficiencyTools.pomodoroWork') : t('efficiencyTools.pomodoroBreak')}
                </span>
              </div>
            </div>

            <div className="flex justify-center gap-4 mb-6">
              <button
                onClick={toggleTimer}
                className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105 ${
                  isRunning
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 shadow-gray-500/20'
                    : 'bg-gradient-to-r from-rose-500 to-red-500 text-white shadow-rose-500/30'
                }`}
              >
                {isRunning ? (
                  <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /></svg>
                ) : (
                  <svg className="w-7 h-7 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                )}
              </button>
              <button onClick={resetTimer} className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-all shadow-lg">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              </button>
            </div>

            <div className="text-center">
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {t('efficiencyTools.pomodoroSessions')}: <span className="font-semibold text-gray-900 dark:text-white">{sessions}</span>
              </p>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">{t('efficiencyTools.options')}</h3>
            <div className="flex justify-center gap-8">
              <div className="text-center">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('efficiencyTools.pomodoroWork')}</label>
                <div className="flex items-center gap-3">
                  <button onClick={() => changeWorkTime(-1)} className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center">-</button>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white w-12 text-center">{workMinutes}</span>
                  <button onClick={() => changeWorkTime(1)} className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center">+</button>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('efficiencyTools.pomodoroMinutes')}</span>
              </div>
              <div className="text-center">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('efficiencyTools.pomodoroBreak')}</label>
                <div className="flex items-center gap-3">
                  <button onClick={() => changeBreakTime(-1)} className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center">-</button>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white w-12 text-center">{breakMinutes}</span>
                  <button onClick={() => changeBreakTime(1)} className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center">+</button>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('efficiencyTools.pomodoroMinutes')}</span>
              </div>
            </div>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
