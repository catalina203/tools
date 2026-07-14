'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import LanguageSwitcher from '@/app/components/LanguageSwitcher';
import ThemeToggle from '@/app/components/ThemeToggle';

function calcStats(nums: number[]) {
  if (nums.length === 0) return null;
  const sorted = [...nums].sort((a, b) => a - b);
  const n = nums.length;
  const sum = nums.reduce((s, v) => s + v, 0);
  const mean = sum / n;
  const median = n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[Math.floor(n / 2)];
  const min = sorted[0];
  const max = sorted[n - 1];
  const range = max - min;

  const freq: Record<number, number> = {};
  let mode: number | null = null;
  let maxFreq = 0;
  for (const v of nums) {
    freq[v] = (freq[v] || 0) + 1;
    if (freq[v] > maxFreq) {
      maxFreq = freq[v];
      mode = v;
    }
  }
  const isAllSame = maxFreq === n;

  const variance = nums.reduce((s, v) => s + (v - mean) ** 2, 0) / n;
  const stdDev = Math.sqrt(variance);

  return { n, sum, mean, median, mode: isAllSame ? mode : null, min, max, range, variance, stdDev };
}

export default function StatisticsTool({ children }: { children?: React.ReactNode }) {
  const t = useTranslations('tools');
  const tc = useTranslations('common');
  const [input, setInput] = useState('');

  const nums = useMemo(() => {
    return input
      .split(/[\n,，\s]+/)
      .map(s => s.trim())
      .filter(s => s !== '' && !isNaN(Number(s)))
      .map(Number)
      .filter(n => isFinite(n));
  }, [input]);

  const stats = useMemo(() => calcStats(nums), [nums]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a1a] transition-colors">
      <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center space-x-4">
          <Link href="/tools" className="flex items-center text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            {tc('tools')}
          </Link>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">{t('dataTools.statistics')}</span>
        </div>
        <div className="flex items-center space-x-3">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('dataTools.statistics')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('dataTools.statisticsDesc')}</p>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('dataTools.statPlaceholder')}
              className="w-full h-40 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-mono text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-y"
            />
            <p className="text-sm text-gray-500 mt-2">{t('dataTools.statCount')}: {nums.length}</p>
          </div>

          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label={t('dataTools.statCount')} value={stats.n} color="violet" />
              <StatCard label={t('dataTools.statSum')} value={stats.sum.toFixed(4)} color="blue" />
              <StatCard label={t('dataTools.statMean')} value={stats.mean.toFixed(4)} color="emerald" />
              <StatCard label={t('dataTools.statMedian')} value={stats.median.toFixed(4)} color="amber" />
              <StatCard label={t('dataTools.statMode')} value={stats.mode !== null ? stats.mode.toFixed(4) : '-'} color="pink" />
              <StatCard label={t('dataTools.statMin')} value={stats.min.toFixed(4)} color="cyan" />
              <StatCard label={t('dataTools.statMax')} value={stats.max.toFixed(4)} color="orange" />
              <StatCard label={t('dataTools.statRange')} value={stats.range.toFixed(4)} color="purple" />
              <StatCard label={t('dataTools.statVariance')} value={stats.variance.toFixed(4)} color="indigo" />
              <StatCard label={t('dataTools.statStdDev')} value={stats.stdDev.toFixed(4)} color="rose" />
              <StatCard label={t('dataTools.statQ1')} value={calcQ1(nums).toFixed(4)} color="teal" />
              <StatCard label={t('dataTools.statQ3')} value={calcQ3(nums).toFixed(4)} color="fuchsia" />
            </div>
          )}
        </div>

        {children}
      </div>
    </div>
  );
}

function calcQ1(nums: number[]): number {
  const sorted = [...nums].sort((a, b) => a - b);
  const n = sorted.length;
  const half = Math.floor(n / 2);
  const lower = sorted.slice(0, half);
  if (lower.length === 0) return sorted[0];
  const m = lower.length;
  return m % 2 === 0 ? (lower[m / 2 - 1] + lower[m / 2]) / 2 : lower[Math.floor(m / 2)];
}

function calcQ3(nums: number[]): number {
  const sorted = [...nums].sort((a, b) => a - b);
  const n = sorted.length;
  const half = Math.floor(n / 2);
  const upper = n % 2 === 0 ? sorted.slice(half) : sorted.slice(half + 1);
  if (upper.length === 0) return sorted[n - 1];
  const m = upper.length;
  return m % 2 === 0 ? (upper[m / 2 - 1] + upper[m / 2]) / 2 : upper[Math.floor(m / 2)];
}

function StatCard({ label, value, color }: { label: string; value: number | string; color: string }) {
  const colorMap: Record<string, { bg: string; text: string }> = {
    violet: { bg: 'bg-violet-100 dark:bg-violet-500/20', text: 'text-violet-600 dark:text-violet-400' },
    blue: { bg: 'bg-blue-100 dark:bg-blue-500/20', text: 'text-blue-600 dark:text-blue-400' },
    emerald: { bg: 'bg-emerald-100 dark:bg-emerald-500/20', text: 'text-emerald-600 dark:text-emerald-400' },
    amber: { bg: 'bg-amber-100 dark:bg-amber-500/20', text: 'text-amber-600 dark:text-amber-400' },
    pink: { bg: 'bg-pink-100 dark:bg-pink-500/20', text: 'text-pink-600 dark:text-pink-400' },
    cyan: { bg: 'bg-cyan-100 dark:bg-cyan-500/20', text: 'text-cyan-600 dark:text-cyan-400' },
    orange: { bg: 'bg-orange-100 dark:bg-orange-500/20', text: 'text-orange-600 dark:text-orange-400' },
    purple: { bg: 'bg-purple-100 dark:bg-purple-500/20', text: 'text-purple-600 dark:text-purple-400' },
    indigo: { bg: 'bg-indigo-100 dark:bg-indigo-500/20', text: 'text-indigo-600 dark:text-indigo-400' },
    rose: { bg: 'bg-rose-100 dark:bg-rose-500/20', text: 'text-rose-600 dark:text-rose-400' },
    teal: { bg: 'bg-teal-100 dark:bg-teal-500/20', text: 'text-teal-600 dark:text-teal-400' },
    fuchsia: { bg: 'bg-fuchsia-100 dark:bg-fuchsia-500/20', text: 'text-fuchsia-600 dark:text-fuchsia-400' },
  };
  const cc = colorMap[color] || colorMap.violet;

  return (
    <div className="bg-gray-50 dark:bg-[#1a1a2e] border border-gray-200 dark:border-white/10 rounded-xl p-5">
      <p className={`text-xs font-medium ${cc.text} uppercase tracking-wider mb-1`}>{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white font-mono">{typeof value === 'number' ? value.toFixed(4) : value}</p>
    </div>
  );
}
