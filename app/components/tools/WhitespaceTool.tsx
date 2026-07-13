'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import LanguageSwitcher from '@/app/components/LanguageSwitcher';
import ThemeToggle from '@/app/components/ThemeToggle';

export default function WhitespaceTool({ children }: { children?: React.ReactNode }) {
  const t = useTranslations('tools');
  const tc = useTranslations('common');

  const [text, setText] = useState('');
  const [trimStart, setTrimStart] = useState(true);
  const [trimEnd, setTrimEnd] = useState(true);
  const [compressSpaces, setCompressSpaces] = useState(false);
  const [removeEmptyLines, setRemoveEmptyLines] = useState(false);
  const [removeAllSpaces, setRemoveAllSpaces] = useState(false);

  const processed = useMemo(() => {
    let result = text;
    if (removeAllSpaces) {
      result = result.replace(/\s+/g, '');
      return result;
    }
    if (trimStart) result = result.replace(/^\s+/gm, '');
    if (trimEnd) result = result.replace(/\s+$/gm, '');
    if (compressSpaces) result = result.replace(/[ \t]+/g, ' ');
    if (removeEmptyLines) result = result.replace(/^\s*[\n\r]/gm, '');
    return result;
  }, [text, trimStart, trimEnd, compressSpaces, removeEmptyLines, removeAllSpaces]);

  const stats = useMemo(() => ({
    original: { chars: text.length, lines: text ? text.split('\n').length : 0 },
    result: { chars: processed.length, lines: processed ? processed.split('\n').length : 0 },
  }), [text, processed]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a1a] transition-colors">
      <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center space-x-4">
          <Link href="/tools" className="flex items-center text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            {tc('tools')}
          </Link>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">{t('textTools.whitespace')}</span>
        </div>
        <div className="flex items-center space-x-3"><LanguageSwitcher /><ThemeToggle /></div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('textTools.whitespace')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('textTools.whitespaceDesc')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('textTools.options')}</h3>
              <div className="space-y-3">
                <label className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg cursor-pointer hover:border-violet-300 dark:hover:border-violet-500/50 transition-colors">
                  <input type="checkbox" checked={trimStart} onChange={(e) => { setTrimStart(e.target.checked); setRemoveAllSpaces(false); }} className="w-5 h-5 text-violet-500 border-gray-300 rounded focus:ring-violet-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{t('textTools.whitespaceTrimStart')}</span>
                </label>
                <label className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg cursor-pointer hover:border-violet-300 dark:hover:border-violet-500/50 transition-colors">
                  <input type="checkbox" checked={trimEnd} onChange={(e) => { setTrimEnd(e.target.checked); setRemoveAllSpaces(false); }} className="w-5 h-5 text-violet-500 border-gray-300 rounded focus:ring-violet-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{t('textTools.whitespaceTrimEnd')}</span>
                </label>
                <label className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg cursor-pointer hover:border-violet-300 dark:hover:border-violet-500/50 transition-colors">
                  <input type="checkbox" checked={compressSpaces} onChange={(e) => { setCompressSpaces(e.target.checked); setRemoveAllSpaces(false); }} className="w-5 h-5 text-violet-500 border-gray-300 rounded focus:ring-violet-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{t('textTools.whitespaceCompress')}</span>
                </label>
                <label className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg cursor-pointer hover:border-violet-300 dark:hover:border-violet-500/50 transition-colors">
                  <input type="checkbox" checked={removeEmptyLines} onChange={(e) => { setRemoveEmptyLines(e.target.checked); setRemoveAllSpaces(false); }} className="w-5 h-5 text-violet-500 border-gray-300 rounded focus:ring-violet-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{t('textTools.whitespaceRemoveEmpty')}</span>
                </label>
                <label className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg cursor-pointer hover:border-red-300 transition-colors">
                  <input type="checkbox" checked={removeAllSpaces} onChange={(e) => setRemoveAllSpaces(e.target.checked)} className="w-5 h-5 text-red-500 border-gray-300 rounded focus:ring-red-500" />
                  <span className="text-sm text-red-500">{t('textTools.whitespaceRemoveAll')}</span>
                </label>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('textTools.stats')}</h3>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex justify-between"><span>{t('textTools.chars')}</span><span>{stats.original.chars} → {stats.result.chars}</span></div>
                <div className="flex justify-between"><span>{t('textTools.lines')}</span><span>{stats.original.lines} → {stats.result.lines}</span></div>
              </div>
            </div>
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
                <button onClick={() => navigator.clipboard.writeText(processed)} className="px-4 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:border-violet-300 dark:hover:border-violet-500/50 transition-colors">{t('textTools.copy')}</button>
              </div>
              <textarea readOnly value={processed} className="w-full h-48 bg-white dark:bg-gray-900 p-4 text-gray-900 dark:text-white font-mono text-sm focus:outline-none resize-none" placeholder={t('textTools.resultPlaceholder')} />
            </div>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
