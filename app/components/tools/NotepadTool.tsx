'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import LanguageSwitcher from '@/app/components/LanguageSwitcher';
import ThemeToggle from '@/app/components/ThemeToggle';

const STORAGE_KEY = 'notepad_content';
const SAVE_DELAY = 1000;

export default function NotepadTool({ children }: { children?: React.ReactNode }) {
  const t = useTranslations('tools');
  const tc = useTranslations('common');

  const [content, setContent] = useState('');
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [lineCount, setLineCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setContent(saved);
      setLastSaved(new Date().toLocaleTimeString());
    }
  }, []);

  useEffect(() => {
    const chars = content.length;
    const words = content.trim() ? content.trim().split(/\s+/).filter(Boolean).length : 0;
    const lines = content ? content.split('\n').length : 0;
    setCharCount(chars);
    setWordCount(words);
    setLineCount(lines);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setIsSaving(true);
      localStorage.setItem(STORAGE_KEY, content);
      setLastSaved(new Date().toLocaleTimeString());
      setTimeout(() => setIsSaving(false), 300);
    }, SAVE_DELAY);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [content]);

  const clearAll = useCallback(() => {
    if (content && !confirm(t('efficiencyTools.notepadConfirmClear'))) return;
    setContent('');
    localStorage.removeItem(STORAGE_KEY);
    setLastSaved(null);
  }, [content, t]);

  const downloadTxt = useCallback(() => {
    if (!content) return;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notepad-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [content]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a1a] transition-colors">
      <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center space-x-4">
          <Link href="/tools" className="flex items-center text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            {tc('tools')}
          </Link>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">{t('efficiencyTools.notepad')}</span>
        </div>
        <div className="flex items-center space-x-3"><LanguageSwitcher /><ThemeToggle /></div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('efficiencyTools.notepad')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('efficiencyTools.notepadDesc')}</p>
        </div>

        <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-white/5 bg-white dark:bg-gray-900/50">
            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <span>{charCount} {t('efficiencyTools.chars')}</span>
              <span className="hidden sm:inline">|</span>
              <span className="hidden sm:inline">{wordCount} {t('efficiencyTools.words')}</span>
              <span>|</span>
              <span>{lineCount} {t('efficiencyTools.lines')}</span>
              {lastSaved && (
                <>
                  <span className="hidden md:inline">|</span>
                  <span className="hidden md:inline">{t('efficiencyTools.notepadLastSaved')}: {lastSaved}</span>
                </>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${isSaving ? 'bg-green-500 animate-pulse' : 'bg-gray-300 dark:bg-gray-600'}`} />
              <div className="flex gap-2">
                <button onClick={downloadTxt} disabled={!content} className="px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:border-violet-300 dark:hover:border-violet-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {t('efficiencyTools.download')}
                </button>
                <button onClick={clearAll} disabled={!content} className="px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-red-500 hover:border-red-300 dark:hover:border-red-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {t('efficiencyTools.clearAll')}
                </button>
              </div>
            </div>
          </div>
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t('efficiencyTools.notepadPlaceholder')}
            className="w-full min-h-[500px] bg-white dark:bg-gray-900 p-6 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none resize-none font-mono text-sm leading-relaxed"
            spellCheck={false}
          />
        </div>

        {children}
      </div>
    </div>
  );
}
