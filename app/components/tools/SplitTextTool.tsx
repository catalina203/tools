'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import LanguageSwitcher from '@/app/components/LanguageSwitcher';
import ThemeToggle from '@/app/components/ThemeToggle';

export default function SplitTextTool({ children }: { children?: React.ReactNode }) {
  const t = useTranslations('tools');
  const tc = useTranslations('common');

  const [text, setText] = useState('');
  const [delimiter, setDelimiter] = useState(',');
  const [removeEmpty, setRemoveEmpty] = useState(true);
  const [trimParts, setTrimParts] = useState(true);

  const parts = useMemo(() => {
    if (!text) return [];
    let parts = text.split(delimiter);
    if (trimParts) parts = parts.map(p => p.trim());
    if (removeEmpty) parts = parts.filter(p => p);
    return parts;
  }, [text, delimiter, trimParts, removeEmpty]);

  const copyAll = () => { if (parts.length) navigator.clipboard.writeText(parts.join('\n')); };
  const clearAll = () => { setText(''); };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a1a] transition-colors">
      <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center space-x-4"><Link href="/tools" className="flex items-center text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"><svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>{tc('tools')}</Link><span className="text-gray-300 dark:text-gray-600">/</span><span className="text-lg font-semibold text-gray-900 dark:text-white">{t('textTools.splitText')}</span></div>
        <div className="flex items-center space-x-3"><LanguageSwitcher /><ThemeToggle /></div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="mb-8"><h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('textTools.splitText')}</h1><p className="text-gray-500 dark:text-gray-400">{t('textTools.splitTextDesc')}</p></div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6"><h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('textTools.inputText')}</h3><textarea value={text} onChange={(e)=>setText(e.target.value)} className="w-full h-96 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none font-mono text-sm" placeholder={t('textTools.inputPlaceholder')} spellCheck={false} /></div>

            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6"><h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('textTools.options')}</h3><div className="space-y-4"><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('textTools.delimiter')}</label><input type="text" value={delimiter} onChange={(e)=>setDelimiter(e.target.value)} className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono" placeholder=","/></div><label className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg cursor-pointer hover:border-purple-300 dark:hover:border-purple-500/50 transition-colors"><input type="checkbox" checked={removeEmpty} onChange={(e)=>setRemoveEmpty(e.target.checked)} className="w-5 h-5 text-purple-500 border-gray-300 rounded focus:ring-purple-500" /><span className="text-gray-700 dark:text-gray-300">{t('textTools.removeEmptyParts')}</span></label><label className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg cursor-pointer hover:border-purple-300 dark:hover:border-purple-500/50 transition-colors"><input type="checkbox" checked={trimParts} onChange={(e)=>setTrimParts(e.target.checked)} className="w-5 h-5 text-purple-500 border-gray-300 rounded focus:ring-purple-500" /><span className="text-gray-700 dark:text-gray-300">{t('textTools.trimEachPart')}</span></label></div></div>

            <div className="space-y-4"><button onClick={copyAll} disabled={parts.length===0} className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-400 hover:to-violet-400 text-white rounded-xl font-medium transition-all shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"><svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 012-2h10a2 2 0 012 2v12a2 2 0 01-2 2h-10a2 2 0 01-2-2V5z"/></svg>{t('textTools.copyAllParts')}</button><button onClick={clearAll} disabled={!text} className="w-full py-3.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">{t('textTools.clearAll')}</button></div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6"><h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center justify-between">{t('textTools.parts')} <span className="text-purple-500 font-mono">{parts.length}</span></h3><textarea value={parts.join('\n')} readOnly className="w-full h-96 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none font-mono text-sm" placeholder={t('textTools.resultPlaceholder')}/></div>

            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6"><h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('textTools.tips')}</h3><ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400"><li className="flex items-start gap-2"><span className="text-purple-500">•</span>{t('textTools.tip1')}</li><li className="flex items-start gap-2"><span className="text-purple-500">•</span>{t('textTools.tip2')}</li><li className="flex items-start gap-2"><span className="text-purple-500">•</span>{t('textTools.tip3')}</li></ul></div>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}