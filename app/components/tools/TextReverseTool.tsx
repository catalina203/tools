'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import LanguageSwitcher from '@/app/components/LanguageSwitcher';
import ThemeToggle from '@/app/components/ThemeToggle';

export default function TextReverseTool({ children }: { children?: React.ReactNode }) {
  const t = useTranslations('tools');
  const tc = useTranslations('common');

  const [text, setText] = useState('');
  const [result, setResult] = useState('');
  const [mode, setMode] = useState<'char' | 'word' | 'line'>('char');

  const reverseText = () => {
    let reversed = '';
    if (mode === 'char') {
      reversed = text.split('').reverse().join('');
    } else if (mode === 'word') {
      reversed = text.split(/\s+/).reverse().join(' ');
    } else if (mode === 'line') {
      reversed = text.split('\n').reverse().join('\n');
    }
    setResult(reversed);
  };

  const copyResult = () => {
    if (result) {
      navigator.clipboard.writeText(result);
    }
  };

  const clearAll = () => {
    setText('');
    setResult('');
  };

  const swapText = () => {
    setText(result);
    setResult(text);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a1a] transition-colors">
      <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center space-x-4">
          <Link
            href="/tools"
            className="flex items-center text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {tc('tools')}
          </Link>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('textTools.textReverse')}
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('textTools.textReverse')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('textTools.textReverseDesc')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('textTools.inputText')}</h3>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full h-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none font-mono text-sm"
                placeholder={t('textTools.inputPlaceholder')}
              />
            </div>

            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('textTools.reverseMode')}</h3>
              <div className="space-y-3">
                <label className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg cursor-pointer hover:border-amber-300 dark:hover:border-amber-500/50 transition-colors">
                  <input
                    type="radio"
                    name="mode"
                    value="char"
                    checked={mode === 'char'}
                    onChange={() => setMode('char')}
                    className="w-5 h-5 text-amber-500 border-gray-300 focus:ring-amber-500"
                  />
                  <span className="text-gray-700 dark:text-gray-300">{t('textTools.modeChar')}</span>
                </label>
                <label className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg cursor-pointer hover:border-amber-300 dark:hover:border-amber-500/50 transition-colors">
                  <input
                    type="radio"
                    name="mode"
                    value="word"
                    checked={mode === 'word'}
                    onChange={() => setMode('word')}
                    className="w-5 h-5 text-amber-500 border-gray-300 focus:ring-amber-500"
                  />
                  <span className="text-gray-700 dark:text-gray-300">{t('textTools.modeWord')}</span>
                </label>
                <label className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg cursor-pointer hover:border-amber-300 dark:hover:border-amber-500/50 transition-colors">
                  <input
                    type="radio"
                    name="mode"
                    value="line"
                    checked={mode === 'line'}
                    onChange={() => setMode('line')}
                    className="w-5 h-5 text-amber-500 border-gray-300 focus:ring-amber-500"
                  />
                  <span className="text-gray-700 dark:text-gray-300">{t('textTools.modeLine')}</span>
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={reverseText}
                disabled={!text}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white rounded-xl font-medium transition-all shadow-lg shadow-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {t('textTools.reverse')}
              </button>
              <button
                onClick={swapText}
                disabled={!text && !result}
                className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white rounded-xl font-medium transition-all shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                {t('textTools.swap')}
              </button>
              <button
                onClick={clearAll}
                disabled={!text && !result}
                className="w-full py-3.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('textTools.clearAll')}
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('textTools.result')}</h3>
                <button
                  onClick={copyResult}
                  disabled={!result}
                  className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:border-amber-300 dark:hover:border-amber-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 012-2h10a2 2 0 012 2v12a2 2 0 01-2 2h-10a2 2 0 01-2-2v-12a2 2 0 012-2z" />
                  </svg>
                  {t('textTools.copy')}
                </button>
              </div>
              <textarea
                value={result}
                readOnly
                className="w-full h-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none font-mono text-sm"
                placeholder={t('textTools.resultPlaceholder')}
              />
            </div>

            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('textTools.stats')}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-amber-500">{text.length}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('textTools.chars')}</div>
                </div>
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-amber-500">{text.replace(/\s/g, '').length}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('textTools.charsNoSpace')}</div>
                </div>
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-amber-500">{text.trim() ? text.trim().split(/\s+/).length : 0}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('textTools.words')}</div>
                </div>
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-amber-500">{text ? text.split('\n').length : 0}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('textTools.lines')}</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('textTools.tips')}</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-amber-500">•</span>
                  {t('textTools.tip1')}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500">•</span>
                  {t('textTools.tip2')}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500">•</span>
                  {t('textTools.tip3')}
                </li>
              </ul>
            </div>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}