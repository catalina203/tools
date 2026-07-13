'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import LanguageSwitcher from '@/app/components/LanguageSwitcher';
import ThemeToggle from '@/app/components/ThemeToggle';

function formatDateToInput(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${day}T${h}:${min}`;
}

function getTimezoneString(): string {
  const offset = -new Date().getTimezoneOffset();
  const sign = offset >= 0 ? '+' : '-';
  const hours = Math.floor(Math.abs(offset) / 60);
  const mins = Math.abs(offset) % 60;
  return `UTC${sign}${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

function getRelativeTime(d: Date, locale: string): string {
  const now = Date.now();
  const diffMs = d.getTime() - now;
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const seconds = Math.round(diffMs / 1000);
  const minutes = Math.round(diffMs / 60000);
  const hours = Math.round(diffMs / 3600000);
  const days = Math.round(diffMs / 86400000);
  if (Math.abs(seconds) < 60) return rtf.format(seconds, 'second');
  if (Math.abs(minutes) < 60) return rtf.format(minutes, 'minute');
  if (Math.abs(hours) < 24) return rtf.format(hours, 'hour');
  if (Math.abs(days) < 30) return rtf.format(days, 'day');
  const months = Math.round(days / 30);
  if (Math.abs(months) < 12) return rtf.format(months, 'month');
  return rtf.format(Math.round(days / 365), 'year');
}

export default function TimestampTool({ children }: { children?: React.ReactNode }) {
  const t = useTranslations('tools');
  const tc = useTranslations('common');
  const locale = useLocale();

  const [tsText, setTsText] = useState('');
  const [dtText, setDtText] = useState('');
  const [isMs, setIsMsState] = useState(false);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [copiedKey, setCopiedKey] = useState('');

  useEffect(() => {
    const now = Math.floor(Date.now() / 1000);
    const d = new Date();
    setTsText(String(now));
    setDtText(formatDateToInput(d));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(k => k + 1);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const getDate = useCallback((): Date | null => {
    if (tsText) {
      const num = parseFloat(tsText);
      if (!isNaN(num) && isFinite(num)) {
        const ms = isMs ? num : num * 1000;
        const d = new Date(ms);
        if (!isNaN(d.getTime())) return d;
      }
    }
    if (dtText) {
      const d = new Date(dtText);
      if (!isNaN(d.getTime())) return d;
    }
    return null;
  }, [tsText, dtText, isMs]);

  const handleTsChange = (value: string) => {
    setTsText(value);
    if (value.trim() === '') {
      setError('');
      return;
    }
    const num = parseFloat(value);
    if (!isNaN(num) && isFinite(num)) {
      const ms = isMs ? num : num * 1000;
      const d = new Date(ms);
      if (!isNaN(d.getTime())) {
        setDtText(formatDateToInput(d));
        setError('');
      } else {
        setError('Invalid date');
      }
    } else {
      setError('Invalid number');
    }
  };

  const handleDtChange = (value: string) => {
    setDtText(value);
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        const ts = isMs ? d.getTime() : Math.floor(d.getTime() / 1000);
        setTsText(String(ts));
        setError('');
      }
    }
  };

  const toggleMs = (ms: boolean) => {
    if (isMs !== ms) {
      const num = parseFloat(tsText);
      if (!isNaN(num)) {
        const newVal = ms ? num * 1000 : Math.round(num / 1000);
        setTsText(String(newVal));
      }
      setIsMsState(ms);
    }
  };

  const insertNow = () => {
    const now = isMs ? Date.now() : Math.floor(Date.now() / 1000);
    setTsText(String(now));
    setDtText(formatDateToInput(new Date()));
    setError('');
  };

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(''), 2000);
    } catch {}
  };

  const date = getDate();
  const hasDate = date !== null;
  const isoString = hasDate ? date!.toISOString() : '';
  const localString = hasDate ? date!.toLocaleString() : '';
  const utcString = hasDate ? date!.toUTCString() : '';
  const relativeString = hasDate ? getRelativeTime(date!, locale) : '';
  const timezoneStr = getTimezoneString();

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a1a] transition-colors">
      <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center space-x-4">
          <Link href="/tools" className="flex items-center text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            {tc('tools')}
          </Link>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">{t('devTools.timestamp')}</span>
        </div>
        <div className="flex items-center space-x-3"><LanguageSwitcher /><ThemeToggle /></div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('devTools.timestamp')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('devTools.timestampDesc')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('devTools.timestampToDate')}</h3>
              <div className="flex items-center space-x-3 mb-4">
                <label className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg cursor-pointer hover:border-emerald-300 dark:hover:border-emerald-500/50 transition-colors">
                  <input type="radio" name="tsUnit" checked={!isMs} onChange={() => toggleMs(false)} className="w-5 h-5 text-emerald-500 border-gray-300 focus:ring-emerald-500" />
                  <span className="text-gray-700 dark:text-gray-300">{t('devTools.seconds')}</span>
                </label>
                <label className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg cursor-pointer hover:border-emerald-300 dark:hover:border-emerald-500/50 transition-colors">
                  <input type="radio" name="tsUnit" checked={isMs} onChange={() => toggleMs(true)} className="w-5 h-5 text-emerald-500 border-gray-300 focus:ring-emerald-500" />
                  <span className="text-gray-700 dark:text-gray-300">{t('devTools.milliseconds')}</span>
                </label>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('devTools.unixTimestamp')}</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={tsText}
                    onChange={(e) => handleTsChange(e.target.value)}
                    className="flex-1 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-sm"
                    placeholder={isMs ? '1720800000000' : '1720800000'}
                    spellCheck={false}
                  />
                  <button onClick={insertNow} className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-lg font-medium transition-all shadow-lg shadow-emerald-500/30 text-sm whitespace-nowrap">
                    {t('devTools.now')}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('devTools.dateTime')}</label>
                <input
                  type="datetime-local"
                  value={dtText}
                  onChange={(e) => handleDtChange(e.target.value)}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('devTools.timezone')}</h3>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400 text-sm">{t('devTools.currentOffset')}</span>
                <span className="text-gray-900 dark:text-white font-mono font-medium">{timezoneStr}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800/30 p-6">
                <p className="text-red-600 dark:text-red-400 flex items-center gap-2">{error}</p>
              </div>
            )}
            {!hasDate && !error && (
              <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
                <p className="text-gray-500 dark:text-gray-400 text-center py-12">{t('devTools.enterValue')}</p>
              </div>
            )}
            {hasDate && (
              <>
                <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('devTools.isoFormat')}</h3>
                    <button onClick={() => copyToClipboard(isoString, 'iso')} className="px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg text-xs text-gray-600 dark:text-gray-400 hover:border-emerald-300 dark:hover:border-emerald-500/50 transition-colors flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 012-2h10a2 2 0 012 2v12a2 2 0 01-2 2h-10a2 2 0 01-2-2v-12a2 2 0 012-2z" /></svg>
                      {copiedKey === 'iso' ? t('devTools.copied') : t('devTools.copy')}
                    </button>
                  </div>
                  <p className="text-gray-900 dark:text-white font-mono text-sm break-all">{isoString}</p>
                </div>

                <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('devTools.localFormat')}</h3>
                    <button onClick={() => copyToClipboard(localString, 'local')} className="px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg text-xs text-gray-600 dark:text-gray-400 hover:border-emerald-300 dark:hover:border-emerald-500/50 transition-colors flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 012-2h10a2 2 0 012 2v12a2 2 0 01-2 2h-10a2 2 0 01-2-2v-12a2 2 0 012-2z" /></svg>
                      {copiedKey === 'local' ? t('devTools.copied') : t('devTools.copy')}
                    </button>
                  </div>
                  <p className="text-gray-900 dark:text-white font-mono text-sm break-all">{localString}</p>
                </div>

                <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('devTools.utcFormat')}</h3>
                    <button onClick={() => copyToClipboard(utcString, 'utc')} className="px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg text-xs text-gray-600 dark:text-gray-400 hover:border-emerald-300 dark:hover:border-emerald-500/50 transition-colors flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 012-2h10a2 2 0 012 2v12a2 2 0 01-2 2h-10a2 2 0 01-2-2v-12a2 2 0 012-2z" /></svg>
                      {copiedKey === 'utc' ? t('devTools.copied') : t('devTools.copy')}
                    </button>
                  </div>
                  <p className="text-gray-900 dark:text-white font-mono text-sm break-all">{utcString}</p>
                </div>

                <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('devTools.relativeFormat')}</h3>
                    <button onClick={() => copyToClipboard(relativeString, 'relative')} className="px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg text-xs text-gray-600 dark:text-gray-400 hover:border-emerald-300 dark:hover:border-emerald-500/50 transition-colors flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 012-2h10a2 2 0 012 2v12a2 2 0 01-2 2h-10a2 2 0 01-2-2v-12a2 2 0 012-2z" /></svg>
                      {copiedKey === 'relative' ? t('devTools.copied') : t('devTools.copy')}
                    </button>
                  </div>
                  <p className="text-gray-900 dark:text-white font-mono text-sm">{relativeString}</p>
                </div>
              </>
            )}
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
