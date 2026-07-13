'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import LanguageSwitcher from '@/app/components/LanguageSwitcher';
import ThemeToggle from '@/app/components/ThemeToggle';

export default function StopwatchTool({ children }: { children?: React.ReactNode }) {
  const t = useTranslations('tools');
  const tc = useTranslations('common');

  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const [lastLapTime, setLastLapTime] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const millis = Math.floor((ms % 1000) / 10);
    if (hours > 0) return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(millis).padStart(2, '0')}`;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(millis).padStart(2, '0')}`;
  };

  const startTimer = useCallback(() => {
    setIsRunning(true);
    startTimeRef.current = Date.now() - time;
  }, [time]);

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  }, []);

  const resetTimer = useCallback(() => {
    stopTimer();
    setTime(0);
    setLaps([]);
    setLastLapTime(0);
  }, [stopTimer]);

  const recordLap = useCallback(() => {
    const lapTime = time - lastLapTime;
    setLaps(prev => [lapTime, ...prev]);
    setLastLapTime(time);
  }, [time, lastLapTime]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime(Date.now() - startTimeRef.current);
      }, 10);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning]);

  const bestLap = laps.length > 0 ? Math.min(...laps) : 0;
  const worstLap = laps.length > 0 ? Math.max(...laps) : 0;

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a1a] transition-colors">
      <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center space-x-4">
          <Link href="/tools" className="flex items-center text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            {tc('tools')}
          </Link>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">{t('efficiencyTools.stopwatch')}</span>
        </div>
        <div className="flex items-center space-x-3"><LanguageSwitcher /><ThemeToggle /></div>
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('efficiencyTools.stopwatch')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('efficiencyTools.stopwatchDesc')}</p>
        </div>

        <div className="flex flex-col items-center">
          <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-8 mb-6 w-full max-w-md">
            <div className="text-center mb-8">
              <div className="text-6xl font-bold text-gray-900 dark:text-white tabular-nums tracking-wider font-mono">
                {formatTime(time)}
              </div>
            </div>

            <div className="flex justify-center gap-4 mb-6">
              {!isRunning ? (
                <button onClick={startTimer} className="w-16 h-16 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-violet-500/30 hover:scale-105 transition-all">
                  <svg className="w-7 h-7 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                </button>
              ) : (
                <button onClick={stopTimer} className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center justify-center shadow-lg hover:scale-105 transition-all">
                  <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /></svg>
                </button>
              )}
              <button onClick={recordLap} disabled={!isRunning} className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-all shadow-lg disabled:opacity-30 disabled:cursor-not-allowed">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </button>
              <button onClick={resetTimer} className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-all shadow-lg">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              </button>
            </div>

            {laps.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('efficiencyTools.stopwatchLaps')} ({laps.length})</h3>
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {laps.map((lap, i) => (
                    <div key={i} className={`flex items-center justify-between px-4 py-2 rounded-xl text-sm ${
                      lap === bestLap ? 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-300' :
                      lap === worstLap ? 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300' :
                      'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300'
                    }`}>
                      <span>{t('efficiencyTools.stopwatchLap')} {laps.length - i}</span>
                      <span className="font-mono tabular-nums">{formatTime(lap)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
