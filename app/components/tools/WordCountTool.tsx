'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import LanguageSwitcher from '@/app/components/LanguageSwitcher';
import ThemeToggle from '@/app/components/ThemeToggle';

export default function WordCountTool({ children }: { children?: React.ReactNode }) {
  const t = useTranslations('tools');
  const tc = useTranslations('common');

  const [text, setText] = useState('');

  const stats = useMemo(() => {
    if (!text) return { chars: 0, charsNoSpace: 0, words: 0, lines: 0, paragraphs: 0, bytes: 0 };
    
    const chars = text.length;
    const charsNoSpace = text.replace(/\s/g, '').length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const lines = text.split('\n').length;
    const paragraphs = text.trim() ? text.trim().split(/\n\s*\n/).length : 0;
    const bytes = new Blob([text]).size;
    
    return { chars, charsNoSpace, words, lines, paragraphs, bytes };
  }, [text]);

  const clearText = () => {
    setText('');
  };

  const copyText = async () => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
  };

  const pasteText = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      setText(clipboardText);
    } catch (e) {
      console.error('Failed to read clipboard:', e);
    }
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
            {t('textTools.wordCount')}
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('textTools.wordCount')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('textTools.wordCountDesc')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden">
              <div className="p-5 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('textTools.inputText')}
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={pasteText}
                    className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    {t('textTools.paste')}
                  </button>
                  <button
                    onClick={clearText}
                    disabled={!text}
                    className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {t('textTools.clear')}
                  </button>
                </div>
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full h-[400px] p-5 resize-none bg-transparent border-none focus:outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 font-mono text-sm"
                placeholder={t('textTools.inputPlaceholder')}
                spellCheck={false}
              />
            </div>

            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('textTools.statistics')}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white dark:bg-gray-900 rounded-xl p-4 text-center border border-gray-200 dark:border-white/10">
                  <div className="text-3xl font-bold text-pink-500 dark:text-pink-400">{stats.chars.toLocaleString()}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('textTools.characters')}</div>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-xl p-4 text-center border border-gray-200 dark:border-white/10">
                  <div className="text-3xl font-bold text-violet-500 dark:text-violet-400">{stats.charsNoSpace.toLocaleString()}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('textTools.charactersNoSpace')}</div>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-xl p-4 text-center border border-gray-200 dark:border-white/10">
                  <div className="text-3xl font-bold text-amber-500 dark:text-amber-400">{stats.words.toLocaleString()}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('textTools.words')}</div>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-xl p-4 text-center border border-gray-200 dark:border-white/10">
                  <div className="text-3xl font-bold text-emerald-500 dark:text-emerald-400">{stats.lines.toLocaleString()}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('textTools.lines')}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-900 rounded-xl p-4 text-center border border-gray-200 dark:border-white/10">
                  <div className="text-3xl font-bold text-cyan-500 dark:text-cyan-400">{stats.paragraphs.toLocaleString()}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('textTools.paragraphs')}</div>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-xl p-4 text-center border border-gray-200 dark:border-white/10">
                  <div className="text-3xl font-bold text-orange-500 dark:text-orange-400">{(stats.bytes / 1024).toFixed(2)} KB</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('textTools.bytes')}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('textTools.quickActions')}
              </h3>
              <div className="space-y-3">
                <button
                  onClick={copyText}
                  disabled={!text}
                  className="w-full py-3.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white rounded-xl font-medium transition-all shadow-lg shadow-pink-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 012-2h10a2 2 0 012 2v12a2 2 0 01-2 2h-10a2 2 0 01-2-2V5z" />
                  </svg>
                  {t('textTools.copyAll')}
                </button>
                <button
                  onClick={clearText}
                  disabled={!text}
                  className="w-full py-3.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('textTools.clearAll')}
                </button>
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