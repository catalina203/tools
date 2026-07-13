'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import LanguageSwitcher from '@/app/components/LanguageSwitcher';
import ThemeToggle from '@/app/components/ThemeToggle';

const COLORS = [
  { name: 'yellow', bg: 'bg-yellow-100 dark:bg-yellow-500/10', border: 'border-yellow-300 dark:border-yellow-500/30', text: 'text-yellow-800 dark:text-yellow-200' },
  { name: 'blue', bg: 'bg-blue-100 dark:bg-blue-500/10', border: 'border-blue-300 dark:border-blue-500/30', text: 'text-blue-800 dark:text-blue-200' },
  { name: 'green', bg: 'bg-green-100 dark:bg-green-500/10', border: 'border-green-300 dark:border-green-500/30', text: 'text-green-800 dark:text-green-200' },
  { name: 'pink', bg: 'bg-pink-100 dark:bg-pink-500/10', border: 'border-pink-300 dark:border-pink-500/30', text: 'text-pink-800 dark:text-pink-200' },
  { name: 'purple', bg: 'bg-purple-100 dark:bg-purple-500/10', border: 'border-purple-300 dark:border-purple-500/30', text: 'text-purple-800 dark:text-purple-200' },
];

const STORAGE_KEY = 'stickyNote_content';
const COLOR_KEY = 'stickyNote_color';

export default function StickyNoteTool({ children }: { children?: React.ReactNode }) {
  const t = useTranslations('tools');
  const tc = useTranslations('common');

  const [content, setContent] = useState('');
  const [colorIdx, setColorIdx] = useState(0);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setContent(saved);
    const savedColor = localStorage.getItem(COLOR_KEY);
    if (savedColor) setColorIdx(parseInt(savedColor));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, content);
    setLastSaved(new Date().toLocaleTimeString());
  }, [content]);

  useEffect(() => {
    localStorage.setItem(COLOR_KEY, String(colorIdx));
  }, [colorIdx]);

  const clearNote = () => {
    if (content && !confirm(t('efficiencyTools.stickyConfirmClear'))) return;
    setContent('');
    localStorage.removeItem(STORAGE_KEY);
    setLastSaved(null);
  };

  const currentColor = COLORS[colorIdx];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a1a] transition-colors">
      <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center space-x-4">
          <Link href="/tools" className="flex items-center text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            {tc('tools')}
          </Link>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">{t('efficiencyTools.stickyNote')}</span>
        </div>
        <div className="flex items-center space-x-3"><LanguageSwitcher /><ThemeToggle /></div>
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('efficiencyTools.stickyNote')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('efficiencyTools.stickyNoteDesc')}</p>
        </div>

        <div className={`${currentColor.bg} ${currentColor.border} border-2 rounded-2xl overflow-hidden shadow-lg transition-all duration-300`}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-inherit bg-inherit">
            <div className="flex items-center gap-2">
              {COLORS.map((c, i) => (
                <button
                  key={c.name}
                  onClick={() => setColorIdx(i)}
                  className={`w-7 h-7 rounded-full ${c.bg} ${c.border} border-2 transition-all ${i === colorIdx ? 'ring-2 ring-offset-2 ring-violet-500 dark:ring-offset-gray-900 scale-110' : 'hover:scale-110'}`}
                />
              ))}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {lastSaved && `${t('efficiencyTools.notepadLastSaved')}: ${lastSaved}`}
              </span>
              <button onClick={clearNote} disabled={!content} className="px-3 py-1.5 bg-white/70 dark:bg-gray-900/70 rounded-lg text-sm text-red-500 hover:bg-white dark:hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm">
                {t('efficiencyTools.clearAll')}
              </button>
            </div>
          </div>
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t('efficiencyTools.stickyPlaceholder')}
            className={`w-full min-h-[400px] p-6 ${currentColor.text} placeholder-gray-400 focus:outline-none resize-none text-lg leading-relaxed bg-transparent`}
            spellCheck={false}
          />
          <div className={`px-6 py-3 border-t border-inherit ${currentColor.text} text-sm flex justify-between`}>
            <span>{content.length} {t('efficiencyTools.chars')}</span>
            <span>{content ? content.split('\n').length : 0} {t('efficiencyTools.lines')}</span>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
