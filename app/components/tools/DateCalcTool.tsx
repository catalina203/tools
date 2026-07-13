'use client';

import { useState, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import LanguageSwitcher from '@/app/components/LanguageSwitcher';
import ThemeToggle from '@/app/components/ThemeToggle';

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseDate(str: string): Date {
  const parts = str.split('-');
  return new Date(+parts[0], +parts[1] - 1, +parts[2]);
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function addMonthsSafe(d: Date, months: number): Date {
  const totalMonths = d.getFullYear() * 12 + d.getMonth() + months;
  const y = Math.floor(totalMonths / 12);
  const m = totalMonths % 12;
  const maxDay = daysInMonth(y, m + 1);
  const day = Math.min(d.getDate(), maxDay);
  return new Date(y, m, day);
}

interface DateDiffResult {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  totalWeeks: number;
  totalHours: number;
  totalMinutes: number;
}

function calcDiff(a: Date, b: Date): DateDiffResult {
  const ms = Math.abs(b.getTime() - a.getTime());
  const totalDays = Math.floor(ms / 86400000);
  const totalWeeks = totalDays / 7;
  const totalHours = totalDays * 24;
  const totalMinutes = totalHours * 60;

  const start = a <= b ? new Date(a) : new Date(b);
  const end = a <= b ? new Date(b) : new Date(a);

  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();

  if (days < 0) {
    months--;
    const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  return { years, months, days, totalDays, totalWeeks, totalHours, totalMinutes };
}

export default function DateCalcTool({ children }: { children?: React.ReactNode }) {
  const t = useTranslations('tools');
  const tc = useTranslations('common');

  const [mode, setMode] = useState<'diff' | 'addsub'>('diff');
  const [startDate, setStartDate] = useState(formatDate(new Date()));
  const [endDate, setEndDate] = useState(formatDate(new Date()));
  const [addYears, setAddYears] = useState(0);
  const [addMonths, setAddMonths] = useState(0);
  const [addDays, setAddDays] = useState(0);
  const [addMode, setAddMode] = useState<'add' | 'subtract'>('add');
  const [copied, setCopied] = useState(false);

  const diffResult = useMemo(() => {
    const a = parseDate(startDate);
    const b = parseDate(endDate);
    return calcDiff(a, b);
  }, [startDate, endDate]);

  const addResult = useMemo(() => {
    const base = parseDate(startDate);
    const op = addMode === 'add' ? 1 : -1;
    const d = addMonthsSafe(base, addYears * 12 * op);
    const d2 = addMonthsSafe(d, addMonths * op);
    d2.setDate(d2.getDate() + addDays * op);
    return d2;
  }, [startDate, addYears, addMonths, addDays, addMode]);

  const setToday = (which: 'start' | 'end') => {
    const today = formatDate(new Date());
    if (which === 'start') setStartDate(today);
    else setEndDate(today);
  };

  const copyResult = useCallback(() => {
    let text = '';
    if (mode === 'diff') {
      const r = diffResult;
      text = `${r.years} ${t('devTools.years')}, ${r.months} ${t('devTools.months')}, ${r.days} ${t('devTools.days')}\n${t('devTools.totalDays')}: ${r.totalDays}\n${t('devTools.totalWeeks')}: ${r.totalWeeks.toFixed(1)}\n${t('devTools.totalHours')}: ${r.totalHours.toLocaleString()}\n${t('devTools.totalMinutes')}: ${r.totalMinutes.toLocaleString()}`;
    } else {
      text = t('devTools.result') + ': ' + formatDate(addResult);
    }
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [mode, diffResult, addResult, t]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a1a] transition-colors">
      <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center space-x-4">
          <Link href="/tools" className="flex items-center text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            {tc('tools')}
          </Link>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">{t('devTools.dateCalc')}</span>
        </div>
        <div className="flex items-center space-x-3"><LanguageSwitcher /><ThemeToggle /></div>
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('devTools.dateCalc')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('devTools.dateCalcDesc')}</p>
        </div>

        <div className="flex space-x-1 mb-8 p-1 bg-gray-100 dark:bg-gray-800/50 rounded-2xl w-fit">
          <button
            onClick={() => setMode('diff')}
            className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${mode === 'diff' ? 'bg-white dark:bg-[#1a1a2e] text-gray-900 dark:text-white shadow-sm border border-gray-200 dark:border-white/10' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            {t('devTools.dateDifference')}
          </button>
          <button
            onClick={() => setMode('addsub')}
            className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${mode === 'addsub' ? 'bg-white dark:bg-[#1a1a2e] text-gray-900 dark:text-white shadow-sm border border-gray-200 dark:border-white/10' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            {t('devTools.addSubtract')}
          </button>
        </div>

        {mode === 'diff' ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('devTools.startDate')}</label>
                <div className="flex space-x-2">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all duration-300"
                  />
                  <button
                    onClick={() => setToday('start')}
                    className="px-4 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-sm font-medium rounded-xl hover:opacity-90 transition-all duration-300 whitespace-nowrap"
                  >
                    {t('devTools.today')}
                  </button>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('devTools.endDate')}</label>
                <div className="flex space-x-2">
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all duration-300"
                  />
                  <button
                    onClick={() => setToday('end')}
                    className="px-4 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-sm font-medium rounded-xl hover:opacity-90 transition-all duration-300 whitespace-nowrap"
                  >
                    {t('devTools.today')}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('devTools.result')}</h3>
                <button
                  onClick={copyResult}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-300"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  {copied ? t('devTools.copied') : t('devTools.copy')}
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-white/10 p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{diffResult.years}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('devTools.years')}</div>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-white/10 p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{diffResult.months}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('devTools.months')}</div>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-white/10 p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{diffResult.days}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('devTools.days')}</div>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-white/10 p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{diffResult.totalDays.toLocaleString()}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('devTools.totalDays')}</div>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-white/10 p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{diffResult.totalWeeks.toFixed(1)}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('devTools.totalWeeks')}</div>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-white/10 p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{diffResult.totalHours.toLocaleString()}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('devTools.totalHours')}</div>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-white/10 p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{diffResult.totalMinutes.toLocaleString()}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('devTools.totalMinutes')}</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('devTools.startDate')}</label>
              <div className="flex space-x-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all duration-300"
                />
                <button
                  onClick={() => setToday('start')}
                  className="px-4 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-sm font-medium rounded-xl hover:opacity-90 transition-all duration-300 whitespace-nowrap"
                >
                  {t('devTools.today')}
                </button>
              </div>
            </div>

            <div className="flex space-x-1 p-1 bg-gray-100 dark:bg-gray-800/50 rounded-2xl w-fit">
              <button
                onClick={() => setAddMode('add')}
                className={`px-5 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${addMode === 'add' ? 'bg-white dark:bg-[#1a1a2e] text-gray-900 dark:text-white shadow-sm border border-gray-200 dark:border-white/10' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
              >
                {t('devTools.add')}
              </button>
              <button
                onClick={() => setAddMode('subtract')}
                className={`px-5 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${addMode === 'subtract' ? 'bg-white dark:bg-[#1a1a2e] text-gray-900 dark:text-white shadow-sm border border-gray-200 dark:border-white/10' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
              >
                {t('devTools.subtract')}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('devTools.years')}</label>
                <input
                  type="number"
                  min={0}
                  value={addYears}
                  onChange={(e) => setAddYears(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all duration-300"
                />
              </div>
              <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('devTools.months')}</label>
                <input
                  type="number"
                  min={0}
                  value={addMonths}
                  onChange={(e) => setAddMonths(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all duration-300"
                />
              </div>
              <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('devTools.days')}</label>
                <input
                  type="number"
                  min={0}
                  value={addDays}
                  onChange={(e) => setAddDays(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all duration-300"
                />
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('devTools.resultDate')}</h3>
                <button
                  onClick={copyResult}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-300"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  {copied ? t('devTools.copied') : t('devTools.copy')}
                </button>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-white/10 p-6 text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent">
                  {formatDate(addResult)}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  {addResult.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>
            </div>
          </div>
        )}

        {children}
      </div>
    </div>
  );
}
