'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import LanguageSwitcher from '@/app/components/LanguageSwitcher';
import ThemeToggle from '@/app/components/ThemeToggle';

function diffLines(oldLines: string[], newLines: string[]): {type: 'same' | 'added' | 'removed', value: string}[] {
  const result: {type: 'same' | 'added' | 'removed', value: string}[] = [];
  let i = 0, j = 0;
  
  while (i < oldLines.length || j < newLines.length) {
    if (i < oldLines.length && j < newLines.length && oldLines[i] === newLines[j]) {
      result.push({type: 'same', value: oldLines[i]});
      i++; j++;
    } else if (j < newLines.length && (i >= oldLines.length || oldLines[i] !== newLines[j])) {
      result.push({type: 'added', value: newLines[j]});
      j++;
    } else if (i < oldLines.length) {
      result.push({type: 'removed', value: oldLines[i]});
      i++;
    }
  }
  return result;
}

export default function DiffTool({ children }: { children?: React.ReactNode }) {
  const t = useTranslations('tools');
  const tc = useTranslations('common');

  const [oldText, setOldText] = useState('');
  const [newText, setNewText] = useState('');
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);

  const diff = useMemo(() => {
    if (!oldText && !newText) return [];
    let oldLines = oldText.split('\n');
    let newLines = newText.split('\n');
    if (ignoreWhitespace) {
      oldLines = oldLines.map(l => l.trim());
      newLines = newLines.map(l => l.trim());
    }
    return diffLines(oldLines, newLines);
  }, [oldText, newText, ignoreWhitespace]);

  const stats = useMemo(() => ({
    added: diff.filter(d => d.type === 'added').length,
    removed: diff.filter(d => d.type === 'removed').length,
    unchanged: diff.filter(d => d.type === 'same').length,
  }), [diff]);

  const copyDiff = () => {
    const text = diff.map(d => {
      const prefix = d.type === 'added' ? '+ ' : d.type === 'removed' ? '- ' : '  ';
      return prefix + d.value;
    }).join('\n');
    navigator.clipboard.writeText(text);
  };

  const clearAll = () => { setOldText(''); setNewText(''); };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a1a] transition-colors">
      <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center space-x-4">
          <Link href="/tools" className="flex items-center text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            {tc('tools')}
          </Link>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">{t('textTools.diff')}</span>
        </div>
        <div className="flex items-center space-x-3"><LanguageSwitcher /><ThemeToggle /></div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="mb-8"><h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('textTools.diff')}</h1><p className="text-gray-500 dark:text-gray-400">{t('textTools.diffDesc')}</p></div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>{t('textTools.originalText')}</h3>
                <textarea value={oldText} onChange={(e)=>setOldText(e.target.value)} className="w-full h-96 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none font-mono text-sm" placeholder={t('textTools.originalPlaceholder')} spellCheck={false} />
              </div>
              <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>{t('textTools.newText')}</h3>
                <textarea value={newText} onChange={(e)=>setNewText(e.target.value)} className="w-full h-96 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none font-mono text-sm" placeholder={t('textTools.newPlaceholder')} spellCheck={false} />
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">{t('textTools.diffResult')}</h3>
              <div className="flex items-center gap-4 mb-4">
                <label className="flex items-center space-x-2 p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg cursor-pointer"><input type="checkbox" checked={showLineNumbers} onChange={(e)=>setShowLineNumbers(e.target.checked)} className="w-4 h-4 text-emerald-500 border-gray-300 rounded" /><span className="text-sm text-gray-700 dark:text-gray-300">{t('textTools.showLineNumbers')}</span></label>
                <label className="flex items-center space-x-2 p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg cursor-pointer"><input type="checkbox" checked={ignoreWhitespace} onChange={(e)=>setIgnoreWhitespace(e.target.checked)} className="w-4 h-4 text-emerald-500 border-gray-300 rounded" /><span className="text-sm text-gray-700 dark:text-gray-300">{t('textTools.ignoreWhitespace')}</span></label>
              </div>
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl p-4 max-h-96 overflow-auto font-mono text-sm">
                {diff.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">{t('textTools.noChanges')}</p>
                ) : (
                  <pre className="whitespace-pre-wrap">{diff.map((d, i) => (
                    <div key={i} className={`flex gap-2 ${d.type === 'added' ? 'bg-green-50 dark:bg-green-900/20' : d.type === 'removed' ? 'bg-red-50 dark:bg-red-900/20' : ''}`}>
                      {showLineNumbers && <span className="text-gray-400 w-8 text-right pr-2 select-none">{i + 1}</span>}
                      <span className={`${d.type === 'added' ? 'text-green-700 dark:text-green-400' : d.type === 'removed' ? 'text-red-700 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}`}>
                        {d.type === 'added' ? '+' : d.type === 'removed' ? '-' : ' '} {d.value}
                      </span>
                    </div>
                  ))}</pre>
                )}
              </div>
              <div className="flex items-center justify-end gap-4 mt-4">
                <button onClick={copyDiff} disabled={diff.length===0} className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:border-emerald-300 dark:hover:border-emerald-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 012-2h10a2 2 0 012 2v12a2 2 0 01-2 2h-10a2 2 0 01-2-2V5z"/></svg>{t('textTools.copyDiff')}</button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('textTools.actions')}</h3>
              <div className="space-y-4">
                <button onClick={clearAll} disabled={!oldText && !newText} className="w-full py-3.5 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"><svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>{t('textTools.compare')}</button>
                <button onClick={() => {const t=oldText; setOldText(newText); setNewText(t);}} disabled={!oldText && !newText} className="w-full py-3.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white rounded-xl font-medium transition-all shadow-lg shadow-pink-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"><svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>{t('textTools.swap')}</button>
                <button onClick={clearAll} disabled={!oldText && !newText} className="w-full py-3.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">{t('textTools.clearAll')}</button>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('textTools.stats')}</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg"><span className="flex items-center gap-2 text-green-700 dark:text-green-400 font-medium"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>{t('textTools.addedLines')}</span><span className="font-bold text-green-700 dark:text-green-400">{stats.added}</span></div>
                <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg"><span className="flex items-center gap-2 text-red-700 dark:text-red-400 font-medium"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4"/></svg>{t('textTools.removedLines')}</span><span className="font-bold text-red-700 dark:text-red-400">{stats.removed}</span></div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"><span className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium">{t('textTools.unchangedLines')}</span><span className="font-bold text-gray-700 dark:text-gray-300">{stats.unchanged}</span></div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6"><h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('textTools.tips')}</h3><ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400"><li className="flex items-start gap-2"><span className="text-emerald-500">•</span>{t('textTools.tip1')}</li><li className="flex items-start gap-2"><span className="text-emerald-500">•</span>{t('textTools.tip2')}</li><li className="flex items-start gap-2"><span className="text-emerald-500">•</span>{t('textTools.tip3')}</li></ul></div>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}