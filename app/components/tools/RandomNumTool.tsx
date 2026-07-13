'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import LanguageSwitcher from '@/app/components/LanguageSwitcher';
import ThemeToggle from '@/app/components/ThemeToggle';

export default function RandomNumTool({ children }: { children?: React.ReactNode }) {
  const t = useTranslations('tools');
  const tc = useTranslations('common');

  const [min, setMin] = useState('1');
  const [max, setMax] = useState('100');
  const [count, setCount] = useState('1');
  const [allowDuplicates, setAllowDuplicates] = useState(true);
  const [results, setResults] = useState<number[]>([]);
  const [history, setHistory] = useState<number[][]>([]);

  const generate = useCallback(() => {
    const minNum = parseInt(min);
    const maxNum = parseInt(max);
    const countNum = parseInt(count);

    if (isNaN(minNum) || isNaN(maxNum) || isNaN(countNum)) return;
    if (minNum > maxNum) return;
    if (!allowDuplicates && (maxNum - minNum + 1) < countNum) return;

    const nums: number[] = [];
    const pool = !allowDuplicates ? Array.from({ length: maxNum - minNum + 1 }, (_, i) => i + minNum) : null;

    for (let i = 0; i < countNum; i++) {
      if (pool && pool.length === 0) break;
      if (pool) {
        const idx = Math.floor(Math.random() * pool.length);
        nums.push(pool[idx]);
        pool.splice(idx, 1);
      } else {
        nums.push(Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum);
      }
    }

    setResults(nums);
    setHistory(prev => [nums, ...prev].slice(0, 20));
  }, [min, max, count, allowDuplicates]);

  const copyResults = () => {
    if (results.length === 0) return;
    navigator.clipboard.writeText(results.join(', '));
  };

  const clearHistory = () => {
    setHistory([]);
    setResults([]);
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
          <span className="text-lg font-semibold text-gray-900 dark:text-white">{t('efficiencyTools.randomNum')}</span>
        </div>
        <div className="flex items-center space-x-3"><LanguageSwitcher /><ThemeToggle /></div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('efficiencyTools.randomNum')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('efficiencyTools.randomNumDesc')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('efficiencyTools.randomNumOptions')}</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('efficiencyTools.randomNumMin')}</label>
                    <input type="number" value={min} onChange={(e) => setMin(e.target.value)} className="w-full h-12 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl px-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('efficiencyTools.randomNumMax')}</label>
                    <input type="number" value={max} onChange={(e) => setMax(e.target.value)} className="w-full h-12 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl px-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('efficiencyTools.randomNumCount')}</label>
                  <input type="number" min="1" max="1000" value={count} onChange={(e) => setCount(e.target.value)} className="w-full h-12 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl px-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500" />
                </div>
                <label className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg cursor-pointer hover:border-violet-300 dark:hover:border-violet-500/50 transition-colors">
                  <input type="checkbox" checked={allowDuplicates} onChange={(e) => setAllowDuplicates(e.target.checked)} className="w-5 h-5 text-violet-500 border-gray-300 rounded focus:ring-violet-500" />
                  <span className="text-gray-700 dark:text-gray-300 text-sm">{t('efficiencyTools.randomNumDuplicates')}</span>
                </label>
                <button onClick={generate} className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-violet-500/30">
                  {t('efficiencyTools.randomNumGenerate')}
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {results.length > 0 && (
              <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('efficiencyTools.results')}</h3>
                  <div className="flex gap-2">
                    <button onClick={copyResults} className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:border-violet-300 dark:hover:border-violet-500/50 transition-colors">{t('efficiencyTools.copy')}</button>
                    <button onClick={clearHistory} className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-red-500 hover:border-red-300 dark:hover:border-red-500/50 transition-colors">{t('efficiencyTools.clearAll')}</button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {results.map((num, i) => (
                    <span key={i} className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl text-lg font-bold text-gray-900 dark:text-white tabular-nums">
                      {num}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {history.length > 0 && (
              <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('efficiencyTools.randomNumHistory')}</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {history.map((nums, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-white dark:bg-gray-900 rounded-xl text-sm text-gray-600 dark:text-gray-400">
                      <span className="text-xs text-gray-400 w-6">#{history.length - i}</span>
                      <span className="font-mono">{nums.join(', ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {results.length === 0 && history.length === 0 && (
              <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-12 text-center">
                <span className="text-6xl mb-4 block">🎲</span>
                <p className="text-gray-500 dark:text-gray-400">{t('efficiencyTools.randomNumEmpty')}</p>
              </div>
            )}
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
