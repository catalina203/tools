'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import LanguageSwitcher from '@/app/components/LanguageSwitcher';
import ThemeToggle from '@/app/components/ThemeToggle';

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function generateGUID(): string {
  return '{' + generateUUID().toUpperCase() + '}';
}

function generateShortUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default function UuidTool({ children }: { children?: React.ReactNode }) {
  const t = useTranslations('tools');
  const tc = useTranslations('common');

  const [output, setOutput] = useState<string[]>([]);
  const [type, setType] = useState<'uuid' | 'guid' | 'short'>('uuid');
  const [count, setCount] = useState(1);

  const generate = useCallback(() => {
    const results: string[] = [];
    for (let i = 0; i < count; i++) {
      switch (type) {
        case 'uuid':
          results.push(generateUUID());
          break;
        case 'guid':
          results.push(generateGUID());
          break;
        case 'short':
          results.push(generateShortUUID());
          break;
      }
    }
    setOutput(results);
  }, [type, count]);

  const copyOutput = () => {
    if (output.length > 0) navigator.clipboard.writeText(output.join('\n'));
  };

  const clearAll = () => {
    setOutput([]);
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
          <span className="text-lg font-semibold text-gray-900 dark:text-white">{t('devTools.uuid')}</span>
        </div>
        <div className="flex items-center space-x-3"><LanguageSwitcher /><ThemeToggle /></div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="mb-8"><h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('devTools.uuid')}</h1><p className="text-gray-500 dark:text-gray-400">{t('devTools.uuidDesc')}</p></div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('devTools.options')}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('devTools.uuidType')}</label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg cursor-pointer hover:border-purple-300 dark:hover:border-purple-500/50 transition-colors">
                      <input type="radio" name="uuidType" value="uuid" checked={type === 'uuid'} onChange={() => setType('uuid')} className="w-5 h-5 text-purple-500 border-gray-300 focus:ring-purple-500" />
                      <span className="text-gray-700 dark:text-gray-300">{t('devTools.uuidStandard')}</span>
                    </label>
                    <label className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg cursor-pointer hover:border-purple-300 dark:hover:border-purple-500/50 transition-colors">
                      <input type="radio" name="uuidType" value="guid" checked={type === 'guid'} onChange={() => setType('guid')} className="w-5 h-5 text-purple-500 border-gray-300 focus:ring-purple-500" />
                      <span className="text-gray-700 dark:text-gray-300">{t('devTools.uuidGuid')}</span>
                    </label>
                    <label className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg cursor-pointer hover:border-purple-300 dark:hover:border-purple-500/50 transition-colors">
                      <input type="radio" name="uuidType" value="short" checked={type === 'short'} onChange={() => setType('short')} className="w-5 h-5 text-purple-500 border-gray-300 focus:ring-purple-500" />
                      <span className="text-gray-700 dark:text-gray-300">{t('devTools.uuidShort')}</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('devTools.count')}</label>
                  <input type="number" min="1" max="100" value={count} onChange={(e) => setCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))} className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <button onClick={generate} className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white rounded-xl font-medium transition-all shadow-lg shadow-purple-500/30 flex items-center justify-center"><svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>{t('devTools.generate')}</button>
              <button onClick={clearAll} disabled={output.length === 0} className="w-full py-3.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">{t('devTools.clearAll')}</button>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('devTools.output')}</h3>
                <button onClick={copyOutput} disabled={output.length === 0} className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:border-purple-300 dark:hover:border-purple-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 012-2h10a2 2 0 012 2v12a2 2 0 01-2 2h-10a2 2 0 01-2-2v-12a2 2 0 012-2z" /></svg>{t('devTools.copy')}</button>
              </div>
              <textarea value={output.join('\n')} readOnly className="w-full h-96 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none font-mono text-sm" placeholder={t('devTools.uuidOutputPlaceholder')} />
            </div>

            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6"><h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('devTools.tips')}</h3><ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400"><li className="flex items-start gap-2"><span className="text-purple-500">•</span>{t('devTools.uuidTip1')}</li><li className="flex items-start gap-2"><span className="text-purple-500">•</span>{t('devTools.uuidTip2')}</li><li className="flex items-start gap-2"><span className="text-purple-500">•</span>{t('devTools.uuidTip3')}</li></ul></div>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}