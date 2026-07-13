'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import LanguageSwitcher from '@/app/components/LanguageSwitcher';
import ThemeToggle from '@/app/components/ThemeToggle';

export default function CountdownTool({ children }: { children?: React.ReactNode }) {
  const t = useTranslations('tools');
  const tc = useTranslations('common');

  const [title, setTitle] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [targetTime, setTargetTime] = useState('23:59');
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [initialTotal, setInitialTotal] = useState(0);
  const [events, setEvents] = useState<{ title: string; date: string }[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('countdown_events');
    if (saved) setEvents(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('countdown_events', JSON.stringify(events));
  }, [events]);

  const startCountdown = useCallback(() => {
    if (!targetDate) return;
    const dateTime = new Date(`${targetDate}T${targetTime}:00`);
    const now = new Date();
    const diff = Math.max(0, Math.floor((dateTime.getTime() - now.getTime()) / 1000));
    if (diff <= 0) return;
    setTotalSeconds(diff);
    setInitialTotal(diff);
    setIsRunning(true);
    setIsComplete(false);
  }, [targetDate, targetTime]);

  const stopCountdown = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(false);
  }, []);

  const resetCountdown = useCallback(() => {
    stopCountdown();
    setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    setTotalSeconds(0);
    setIsComplete(false);
  }, [stopCountdown]);

  const saveEvent = () => {
    if (!title || !targetDate) return;
    setEvents(prev => [{ title, date: `${targetDate} ${targetTime}` }, ...prev].slice(0, 20));
    setTitle('');
  };

  const deleteEvent = (idx: number) => {
    setEvents(prev => prev.filter((_, i) => i !== idx));
  };

  const playAlarm = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      [880, 880, 1100, 1100].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.2);
        gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.2);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.2 + 0.15);
        osc.start(ctx.currentTime + i * 0.2);
        osc.stop(ctx.currentTime + i * 0.2 + 0.15);
      });
    } catch {}
  };

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTotalSeconds(prev => {
          if (prev <= 1) {
            stopCountdown();
            setIsComplete(true);
            playAlarm();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, stopCountdown]);

  useEffect(() => {
    const d = Math.floor(totalSeconds / 86400);
    const h = Math.floor((totalSeconds % 86400) / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    setTimeLeft({ days: d, hours: h, minutes: m, seconds: s });
  }, [totalSeconds]);

  const progress = initialTotal > 0 ? (initialTotal - totalSeconds) / initialTotal : 0;

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a1a] transition-colors">
      <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center space-x-4">
          <Link href="/tools" className="flex items-center text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            {tc('tools')}
          </Link>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">{t('efficiencyTools.countdown')}</span>
        </div>
        <div className="flex items-center space-x-3"><LanguageSwitcher /><ThemeToggle /></div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('efficiencyTools.countdown')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('efficiencyTools.countdownDesc')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-8 flex flex-col items-center">
              {isComplete ? (
                <div className="text-center py-8">
                  <span className="text-7xl mb-4 block">🎉</span>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('efficiencyTools.countdownComplete')}</h2>
                  <button onClick={resetCountdown} className="px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-medium transition-all hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-500/30">{t('efficiencyTools.countdownReset')}</button>
                </div>
              ) : totalSeconds > 0 ? (
                <>
                  <div className="grid grid-cols-4 gap-4 mb-8">
                    {[
                      { label: t('efficiencyTools.days'), value: timeLeft.days },
                      { label: t('efficiencyTools.hours'), value: timeLeft.hours },
                      { label: t('efficiencyTools.minutes'), value: timeLeft.minutes },
                      { label: t('efficiencyTools.seconds'), value: timeLeft.seconds },
                    ].map((unit) => (
                      <div key={unit.label} className="text-center">
                        <div className="w-24 h-24 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl flex items-center justify-center shadow-lg">
                          <span className="text-4xl font-bold text-gray-900 dark:text-white tabular-nums">{String(unit.value).padStart(2, '0')}</span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{unit.label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="w-full max-w-md mb-6">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-1000 ease-linear" style={{ width: `${progress * 100}%` }} />
                    </div>
                  </div>
                  <button onClick={stopCountdown} className="px-8 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">{t('efficiencyTools.stop')}</button>
                </>
              ) : (
                <div className="w-full space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('efficiencyTools.countdownEventTitle')}</label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('efficiencyTools.countdownTitlePlaceholder')} className="w-full h-12 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl px-4 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('efficiencyTools.countdownDate')}</label>
                      <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} className="w-full h-12 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl px-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('efficiencyTools.countdownTime')}</label>
                      <input type="time" value={targetTime} onChange={(e) => setTargetTime(e.target.value)} className="w-full h-12 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl px-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500" />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={startCountdown} disabled={!targetDate} className="flex-1 py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-violet-500/30 disabled:opacity-50 disabled:cursor-not-allowed">{t('efficiencyTools.countdownStart')}</button>
                    <button onClick={saveEvent} disabled={!title || !targetDate} className="px-6 py-3.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap">{t('efficiencyTools.countdownSave')}</button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('efficiencyTools.countdownSavedEvents')}</h3>
              {events.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">{t('efficiencyTools.countdownNoEvents')}</p>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {events.map((ev, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{ev.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{ev.date}</p>
                      </div>
                      <button onClick={() => deleteEvent(i)} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
