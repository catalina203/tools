'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import LanguageSwitcher from '@/app/components/LanguageSwitcher';
import ThemeToggle from '@/app/components/ThemeToggle';

const TIMEZONES = Intl.supportedValuesOf ? Intl.supportedValuesOf('timeZone') : [
  'Asia/Shanghai', 'Asia/Tokyo', 'Asia/Seoul', 'Asia/Singapore', 'Asia/Dubai',
  'Asia/Kolkata', 'Asia/Hong_Kong', 'Asia/Taipei', 'Asia/Bangkok', 'Asia/Kuala_Lumpur',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Moscow', 'Europe/Rome',
  'Europe/Madrid', 'Europe/Amsterdam', 'Europe/Stockholm',
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'America/Toronto', 'America/Vancouver', 'America/Sao_Paulo', 'America/Mexico_City',
  'Australia/Sydney', 'Australia/Melbourne', 'Australia/Perth',
  'Pacific/Auckland', 'Pacific/Honolulu', 'Africa/Cairo', 'Africa/Johannesburg',
];

const POPULAR_CITIES: Record<string, string> = {
  'Asia/Shanghai': 'beijing',
  'Asia/Tokyo': 'tokyo',
  'Asia/Seoul': 'seoul',
  'Asia/Singapore': 'singapore',
  'Asia/Dubai': 'dubai',
  'Europe/London': 'london',
  'Europe/Paris': 'paris',
  'Europe/Berlin': 'berlin',
  'Europe/Moscow': 'moscow',
  'America/New_York': 'newyork',
  'America/Chicago': 'chicago',
  'America/Los_Angeles': 'losangeles',
  'America/Toronto': 'toronto',
  'Australia/Sydney': 'sydney',
  'Pacific/Auckland': 'auckland',
};

export default function TimezoneTool({ children }: { children?: React.ReactNode }) {
  const t = useTranslations('tools');
  const tc = useTranslations('common');

  const [srcTz, setSrcTz] = useState('Asia/Shanghai');
  const [dstTz, setDstTz] = useState('America/New_York');
  const [dateStr, setDateStr] = useState(() => new Date().toISOString().slice(0, 10));
  const [timeStr, setTimeStr] = useState(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  });

  const sourceTime = useMemo(() => {
    const d = new Date(`${dateStr}T${timeStr}:00`);
    return { utc: d.toISOString().slice(11, 19), local: d.toLocaleTimeString('en-US', { timeZone: srcTz, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }) };
  }, [dateStr, timeStr, srcTz]);

  const convertedTime = useMemo(() => {
    const d = new Date(`${dateStr}T${timeStr}:00`);
    return {
      time: d.toLocaleTimeString('en-US', { timeZone: dstTz, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
      date: d.toLocaleDateString('en-US', { timeZone: dstTz, weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
    };
  }, [dateStr, timeStr, dstTz]);

  const srcOffset = useMemo(() => {
    const d = new Date(`${dateStr}T${timeStr}:00`);
    const utc = d.getTime() + d.getTimezoneOffset() * 60000;
    const local = new Date(utc).toLocaleString('en-US', { timeZone: srcTz });
    const diff = (new Date(local).getTime() - utc) / 3600000;
    return `UTC${diff >= 0 ? '+' : ''}${diff}`;
  }, [dateStr, timeStr, srcTz]);

  const dstOffset = useMemo(() => {
    const d = new Date(`${dateStr}T${timeStr}:00`);
    const utc = d.getTime() + d.getTimezoneOffset() * 60000;
    const local = new Date(utc).toLocaleString('en-US', { timeZone: dstTz });
    const diff = (new Date(local).getTime() - utc) / 3600000;
    return `UTC${diff >= 0 ? '+' : ''}${diff}`;
  }, [dateStr, timeStr, dstTz]);

  const swapTz = () => {
    setSrcTz(dstTz);
    setDstTz(srcTz);
  };

  const now = () => {
    const d = new Date();
    setDateStr(d.toISOString().slice(0, 10));
    setTimeStr(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a1a] transition-colors">
      <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center space-x-4">
          <Link href="/tools" className="flex items-center text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            {tc('tools')}
          </Link>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">{t('efficiencyTools.timezone')}</span>
        </div>
        <div className="flex items-center space-x-3"><LanguageSwitcher /><ThemeToggle /></div>
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('efficiencyTools.timezone')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('efficiencyTools.timezoneDesc')}</p>
        </div>

        <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('efficiencyTools.timezoneDate')}</label>
              <input type="date" value={dateStr} onChange={(e) => setDateStr(e.target.value)} className="w-full h-12 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl px-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('efficiencyTools.timezoneTime')}</label>
              <input type="time" value={timeStr} onChange={(e) => setTimeStr(e.target.value)} className="w-full h-12 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl px-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500" />
            </div>
            <button onClick={now} className="mt-6 px-4 h-12 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors whitespace-nowrap">{t('efficiencyTools.timezoneNow')}</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-4 items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('efficiencyTools.timezoneSource')}</label>
              <select value={srcTz} onChange={(e) => setSrcTz(e.target.value)} className="w-full h-12 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500">
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>{(POPULAR_CITIES[tz] ? t(`efficiencyTools.${POPULAR_CITIES[tz]}` as any) + ' - ' : '') + tz.replace(/_/g, ' ')}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{srcOffset}</p>
              <div className="mt-3 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('efficiencyTools.timezoneCurrent')}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{sourceTime.local}</p>
              </div>
            </div>

            <button onClick={swapTz} className="mt-6 w-12 h-12 rounded-full bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center hover:bg-violet-200 dark:hover:bg-violet-500/30 transition-colors shadow-lg mx-auto">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
            </button>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('efficiencyTools.timezoneTarget')}</label>
              <select value={dstTz} onChange={(e) => setDstTz(e.target.value)} className="w-full h-12 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500">
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>{(POPULAR_CITIES[tz] ? t(`efficiencyTools.${POPULAR_CITIES[tz]}` as any) + ' - ' : '') + tz.replace(/_/g, ' ')}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{dstOffset}</p>
              <div className="mt-3 p-4 bg-gradient-to-r from-violet-500/10 to-indigo-500/10 border border-violet-200 dark:border-violet-500/30 rounded-xl">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('efficiencyTools.timezoneConverted')}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{convertedTime.time}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{convertedTime.date}</p>
              </div>
            </div>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
