'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import LanguageSwitcher from '@/app/components/LanguageSwitcher';
import ThemeToggle from '@/app/components/ThemeToggle';

export default function DedupTool({ children }: { children?: React.ReactNode }) {
  const t = useTranslations('tools');
  const tc = useTranslations('common');

  const [text, setText] = useState('');
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [trimLines, setTrimLines] = useState(true);
  const [sortResult, setSortResult] = useState(false);

  const result = useMemo(() => {
    if (!text) return { lines: [], total: 0, unique: 0, removed: 0 };

    const rawLines = text.split('\n');
    const total = rawLines.length;
    const processed = trimLines ? rawLines.map(l => l.trim()) : rawLines;
    const seen = new Set<string>();
    const unique: string[] = [];

    for (const line of processed) {
      const key = ignoreCase ? line.toLowerCase() : line;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(line);
      }
    }

    const final = sortResult ? [...unique].sort((a, b) => {
      if (ignoreCase) return a.toLowerCase().localeCompare(b.toLowerCase());
      return a.localeCompare(b);
    }) : unique;

    return { lines: final, total, unique: unique.length, removed: total - unique.length };
  }, [text, ignoreCase, trimLines, sortResult]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a1a] transition-colors">
      <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center space-x-4">
          <Link href="/tools" className="flex items-center text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            {tc('tools')}
          </Link>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">{t('textTools.dedup')}</span>
        </div>
        <div className="flex items-center space-x-3"><LanguageSwitcher /><ThemeToggle /></div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('textTools.dedup')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('textTools.dedupDesc')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('textTools.options')}</h3>
              <div className="space-y-3">
                <label className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg cursor-pointer hover:border-violet-300 dark:hover:border-violet-500/50 transition-colors">
                  <input type="checkbox" checked={ignoreCase} onChange={(e) => setIgnoreCase(e.target.checked)} className="w-5 h-5 text-violet-500 border-gray-300 rounded focus:ring-violet-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{t('textTools.ignoreCase')}</span>
                </label>
                <label className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg cursor-pointer hover:border-violet-300 dark:hover:border-violet-500/50 transition-colors">
                  <input type="checkbox" checked={trimLines} onChange={(e) => setTrimLines(e.target.checked)} className="w-5 h-5 text-violet-500 border-gray-300 rounded focus:ring-violet-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{t('textTools.trimWhitespace')}</span>
                </label>
                <label className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg cursor-pointer hover:border-violet-300 dark:hover:border-violet-500/50 transition-colors">
                  <input type="checkbox" checked={sortResult} onChange={(e) => setSortResult(e.target.checked)} className="w-5 h-5 text-violet-500 border-gray-300 rounded focus:ring-violet-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{t('textTools.dedupSort')}</span>
                </label>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('textTools.stats')}</h3>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex justify-between"><span>{t('textTools.totalLines')}</span><span>{result.total}</span></div>
                <div className="flex justify-between"><span>{t('textTools.uniqueLines')}</span><span>{result.unique}</span></div>
                <div className="flex justify-between text-red-500"><span>{t('textTools.removedLines')}</span><span>{result.removed}</span></div>
              </div>
            </div>

            {result.removed > 0 && (
              <div className="p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl text-xs text-amber-700 dark:text-amber-400">
                ✨ {t('textTools.dedupRemoved').replace('{n}', String(result.removed))}
              </div>
            )}
          </div>

          <div className="lg:col-span-3 space-y-6">
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-white/10">
                <h3 className="font-semibold text-gray-900 dark:text-white">{t('textTools.inputText')}</h3>
              </div>
              <textarea value={text} onChange={(e) => setText(e.target.value)} className="w-full h-48 bg-white dark:bg-gray-900 p-4 text-gray-900 dark:text-white font-mono text-sm focus:outline-none resize-none" placeholder={t('textTools.inputPlaceholder')} />
            </div>

            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white">{t('textTools.result')}</h3>
                <button onClick={() => navigator.clipboard.writeText(result.lines.join('\n'))} className="px-4 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:border-violet-300 dark:hover:border-violet-500/50 transition-colors">{t('textTools.copy')}</button>
              </div>
              <textarea readOnly value={result.lines.join('\n')} className="w-full h-48 bg-white dark:bg-gray-900 p-4 text-gray-900 dark:text-white font-mono text-sm focus:outline-none resize-none" placeholder={t('textTools.resultPlaceholder')} />
            </div>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
