'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import LanguageSwitcher from '@/app/components/LanguageSwitcher';
import ThemeToggle from '@/app/components/ThemeToggle';

const DEFAULT_CITIES = [
  { name: 'beijing', tz: 'Asia/Shanghai', flag: '🇨🇳' },
  { name: 'tokyo', tz: 'Asia/Tokyo', flag: '🇯🇵' },
  { name: 'seoul', tz: 'Asia/Seoul', flag: '🇰🇷' },
  { name: 'singapore', tz: 'Asia/Singapore', flag: '🇸🇬' },
  { name: 'dubai', tz: 'Asia/Dubai', flag: '🇦🇪' },
  { name: 'london', tz: 'Europe/London', flag: '🇬🇧' },
  { name: 'paris', tz: 'Europe/Paris', flag: '🇫🇷' },
  { name: 'berlin', tz: 'Europe/Berlin', flag: '🇩🇪' },
  { name: 'moscow', tz: 'Europe/Moscow', flag: '🇷🇺' },
  { name: 'newyork', tz: 'America/New_York', flag: '🇺🇸' },
  { name: 'chicago', tz: 'America/Chicago', flag: '🇺🇸' },
  { name: 'losangeles', tz: 'America/Los_Angeles', flag: '🇺🇸' },
  { name: 'toronto', tz: 'America/Toronto', flag: '🇨🇦' },
  { name: 'sydney', tz: 'Australia/Sydney', flag: '🇦🇺' },
  { name: 'auckland', tz: 'Pacific/Auckland', flag: '🇳🇿' },
];

const ALL_TIMEZONES = Intl.supportedValuesOf ? Intl.supportedValuesOf('timeZone') : [];

export default function WorldClockTool({ children }: { children?: React.ReactNode }) {
  const t = useTranslations('tools');
  const tc = useTranslations('common');

  const [now, setNow] = useState(new Date());
  const [customCities, setCustomCities] = useState<{ name: string; tz: string; flag: string }[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('worldclock_custom');
    if (saved) setCustomCities(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('worldclock_custom', JSON.stringify(customCities));
  }, [customCities]);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date, tz: string) => {
    return date.toLocaleTimeString('en-US', { timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  };

  const formatDate = (date: Date, tz: string) => {
    return date.toLocaleDateString('en-US', { timeZone: tz, weekday: 'short', month: 'short', day: 'numeric' });
  };

  const getOffset = (tz: string) => {
    const d = new Date();
    const utc = d.getTime() + d.getTimezoneOffset() * 60000;
    const local = new Date(utc).toLocaleString('en-US', { timeZone: tz });
    const diff = new Date(local).getTime() - utc;
    const hours = diff / 3600000;
    const sign = hours >= 0 ? '+' : '';
    return `UTC${sign}${hours}`;
  };

  const allCities = [...DEFAULT_CITIES, ...customCities];

  const [searchTz, setSearchTz] = useState('');
  const [showPicker, setShowPicker] = useState(false);

  const filteredTzs = ALL_TIMEZONES.filter(z => z.toLowerCase().includes(searchTz.toLowerCase()));

  const addCity = (tz: string) => {
    if (customCities.find(c => c.tz === tz)) return;
    const parts = tz.split('/');
    const name = parts[parts.length - 1].replace(/_/g, ' ');
    setCustomCities(prev => [...prev, { name, tz, flag: '🌍' }]);
    setShowPicker(false);
    setSearchTz('');
  };

  const removeCity = (idx: number) => {
    setCustomCities(prev => prev.filter((_, i) => i !== idx));
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
          <span className="text-lg font-semibold text-gray-900 dark:text-white">{t('efficiencyTools.worldClock')}</span>
        </div>
        <div className="flex items-center space-x-3"><LanguageSwitcher /><ThemeToggle /></div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('efficiencyTools.worldClock')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('efficiencyTools.worldClockDesc')}</p>
        </div>

        <div className="mb-6 flex justify-end">
          <div className="relative">
            <button onClick={() => setShowPicker(!showPicker)} className="px-5 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-medium transition-all hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-500/30">
              + {t('efficiencyTools.worldClockAdd')}
            </button>
            {showPicker && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl shadow-xl z-50 p-4">
                <input
                  type="text"
                  value={searchTz}
                  onChange={(e) => setSearchTz(e.target.value)}
                  placeholder={t('efficiencyTools.worldClockSearch')}
                  className="w-full h-10 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl px-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 mb-2"
                  autoFocus
                />
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {filteredTzs.slice(0, 30).map((tz) => (
                    <button key={tz} onClick={() => addCity(tz)} className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                      {tz.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allCities.map((city, i) => (
            <div key={`${city.tz}-${i}`} className="relative bg-gray-50 dark:bg-[#1a1a2e] border border-gray-200 dark:border-white/10 rounded-2xl p-6 hover:border-violet-500/30 transition-all duration-300 group">
              {i >= DEFAULT_CITIES.length && (
                <button onClick={() => removeCity(i - DEFAULT_CITIES.length)} className="absolute top-3 right-3 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              )}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{city.flag}</span>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t(`efficiencyTools.${city.name}` as any)}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{getOffset(city.tz)}</p>
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white tabular-nums tracking-wider font-mono">
                {formatTime(now, city.tz)}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{formatDate(now, city.tz)}</p>
            </div>
          ))}
        </div>

        {children}
      </div>
    </div>
  );
}
