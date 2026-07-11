'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import LanguageSwitcher from '@/app/components/LanguageSwitcher';
import ThemeToggle from '@/app/components/ThemeToggle';

const caseTypes = [
  { key: 'lowercase', label: 'lowercase', fn: (s: string) => s.toLowerCase() },
  { key: 'UPPERCASE', label: 'UPPERCASE', fn: (s: string) => s.toUpperCase() },
  { key: 'Capitalize', label: 'Capitalize', fn: (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() },
  { key: 'Title Case', label: 'Title Case', fn: (s: string) => s.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()) },
  { key: 'camelCase', label: 'camelCase', fn: (s: string) => s.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) => index === 0 ? match.toLowerCase() : match.toUpperCase()).replace(/\s+/g, '') },
  { key: 'PascalCase', label: 'PascalCase', fn: (s: string) => s.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match) => match.toUpperCase()).replace(/\s+/g, '') },
  { key: 'snake_case', label: 'snake_case', fn: (s: string) => s.replace(/\s+/g, '_').toLowerCase() },
  { key: 'kebab-case', label: 'kebab-case', fn: (s: string) => s.replace(/\s+/g, '-').toLowerCase() },
  { key: 'CONSTANT_CASE', label: 'CONSTANT_CASE', fn: (s: string) => s.replace(/\s+/g, '_').toUpperCase() },
];

export default function CaseConvertTool({ children }: { children?: React.ReactNode }) {
  const t = useTranslations('tools');
  const tc = useTranslations('common');

  const [text, setText] = useState('');
  const [results, setResults] = useState<Record<string, string>>({});

  const convertAll = () => {
    const converted: Record<string, string> = {};
    caseTypes.forEach(({ key, fn }) => {
      converted[key] = fn(text);
    });
    setResults(converted);
  };

  const copyToClipboard = (value: string) => {
    navigator.clipboard.writeText(value);
  };

  const clearAll = () => {
    setText('');
    setResults({});
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
            {t('textTools.caseConvert')}
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('textTools.caseConvert')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('textTools.caseConvertDesc')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('textTools.inputText')}</h3>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full h-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none font-mono text-sm"
                placeholder={t('textTools.inputPlaceholder')}
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={convertAll}
                disabled={!text}
                className="flex-1 py-3.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white rounded-xl font-medium transition-all shadow-lg shadow-teal-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                {t('textTools.convertAll')}
              </button>
              <button
                onClick={clearAll}
                disabled={!text && Object.keys(results).length === 0}
                className="px-6 py-3.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('textTools.clearAll')}
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('textTools.results')}</h3>
              {Object.keys(results).length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400">{t('textTools.noResults')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {caseTypes.map(({ key, label }) => (
                    <div key={key} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-teal-600 dark:text-teal-400">{label}</span>
                        <button
                          onClick={() => copyToClipboard(results[key])}
                          disabled={!results[key]}
                          className="px-3 py-1 text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg text-gray-700 dark:text-gray-300 hover:border-teal-300 dark:hover:border-teal-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {t('textTools.copy')}
                        </button>
                      </div>
                      <textarea
                        value={results[key]}
                        readOnly
                        className="w-full h-20 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none font-mono text-sm"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('textTools.tips')}</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-teal-500">•</span>
                  {t('textTools.tip1')}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-500">•</span>
                  {t('textTools.tip2')}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-500">•</span>
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