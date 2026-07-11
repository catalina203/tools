'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import LanguageSwitcher from '@/app/components/LanguageSwitcher';
import ThemeToggle from '@/app/components/ThemeToggle';

export default function TextCleanTool({ children }: { children?: React.ReactNode }) {
  const t = useTranslations('tools');
  const tc = useTranslations('common');

  const [text, setText] = useState('');
  const [result, setResult] = useState('');
  const [options, setOptions] = useState({
    trimWhitespace: true,
    removeEmptyLines: true,
    removeExtraSpaces: true,
    removeSpecialChars: false,
  });

  const processText = () => {
    let processed = text;
    
    if (options.trimWhitespace) {
      processed = processed.split('\n').map(line => line.trim()).join('\n');
    }
    
    if (options.removeEmptyLines) {
      processed = processed.split('\n').filter(line => line.trim() !== '').join('\n');
    }
    
    if (options.removeExtraSpaces) {
      processed = processed.replace(/[ \t]+/g, ' ');
    }
    
    if (options.removeSpecialChars) {
      processed = processed.replace(/[^\w\s\n\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]/g, '');
    }
    
    setResult(processed);
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
            {t('textTools.textClean')}
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('textTools.textClean')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('textTools.textCleanDesc')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('textTools.inputText')}</h3>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full h-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none font-mono text-sm"
                placeholder={t('textTools.inputPlaceholder')}
              />
            </div>

            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('textTools.options')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg cursor-pointer hover:border-pink-300 dark:hover:border-pink-500/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={options.trimWhitespace}
                    onChange={(e) => setOptions({...options, trimWhitespace: e.target.checked})}
                    className="w-5 h-5 text-pink-500 border-gray-300 rounded focus:ring-pink-500"
                  />
                  <span className="text-gray-700 dark:text-gray-300">{t('textTools.optTrimWhitespace')}</span>
                </label>
                <label className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg cursor-pointer hover:border-pink-300 dark:hover:border-pink-500/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={options.removeEmptyLines}
                    onChange={(e) => setOptions({...options, removeEmptyLines: e.target.checked})}
                    className="w-5 h-5 text-pink-500 border-gray-300 rounded focus:ring-pink-500"
                  />
                  <span className="text-gray-700 dark:text-gray-300">{t('textTools.optRemoveEmptyLines')}</span>
                </label>
                <label className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg cursor-pointer hover:border-pink-300 dark:hover:border-pink-500/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={options.removeExtraSpaces}
                    onChange={(e) => setOptions({...options, removeExtraSpaces: e.target.checked})}
                    className="w-5 h-5 text-pink-500 border-gray-300 rounded focus:ring-pink-500"
                  />
                  <span className="text-gray-700 dark:text-gray-300">{t('textTools.optRemoveExtraSpaces')}</span>
                </label>
                <label className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg cursor-pointer hover:border-pink-300 dark:hover:border-pink-500/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={options.removeSpecialChars}
                    onChange={(e) => setOptions({...options, removeSpecialChars: e.target.checked})}
                    className="w-5 h-5 text-pink-500 border-gray-300 rounded focus:ring-pink-500"
                  />
                  <span className="text-gray-700 dark:text-gray-300">{t('textTools.optRemoveSpecialChars')}</span>
                </label>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={processText}
                className="flex-1 py-3.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white rounded-xl font-medium transition-all shadow-lg shadow-pink-500/30 flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                {t('textTools.cleanText')}
              </button>
              <button
                onClick={clearAll}
                disabled={!text && !result}
                className="px-6 py-3.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('textTools.clearAll')}
              </button>
            </div>

            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('textTools.result')}</h3>
                <button
                  onClick={copyResult}
                  disabled={!result}
                  className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:border-pink-300 dark:hover:border-pink-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
                className="w-full h-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none font-mono text-sm"
                placeholder={t('textTools.resultPlaceholder')}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('textTools.stats')}</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">{t('textTools.chars')}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{text.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">{t('textTools.charsNoSpace')}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{text.replace(/\s/g, '').length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">{t('textTools.words')}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{text.trim() ? text.trim().split(/\s+/).length : 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">{t('textTools.lines')}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{text ? text.split('\n').length : 0}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('textTools.tips')}</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-pink-500">•</span>
                  {t('textTools.tip1')}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-500">•</span>
                  {t('textTools.tip2')}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-500">•</span>
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