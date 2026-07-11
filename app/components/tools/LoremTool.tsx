'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import LanguageSwitcher from '@/app/components/LanguageSwitcher';
import ThemeToggle from '@/app/components/ThemeToggle';

const loremParagraphs = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
  'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.',
  'Totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.',
  'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos.',
  'Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.',
];

const loremWords = loremParagraphs.join(' ').split(/\s+/);

export default function LoremTool({ children }: { children?: React.ReactNode }) {
  const t = useTranslations('tools');
  const tc = useTranslations('common');

  const [result, setResult] = useState('');
  const [type, setType] = useState<'paragraphs' | 'words' | 'bytes'>('paragraphs');
  const [count, setCount] = useState(3);
  const [startWithLorem, setStartWithLorem] = useState(true);

  const generate = () => {
    let text = '';
    if (type === 'paragraphs') {
      const paras = [];
      for (let i = 0; i < count; i++) {
        let para = loremParagraphs[i % loremParagraphs.length];
        if (i === 0 && !startWithLorem) {
          para = para.replace('Lorem ipsum', 'Dolor sit');
        }
        paras.push(para);
      }
      text = paras.join('\n\n');
    } else if (type === 'words') {
      const words = [];
      for (let i = 0; i < count; i++) {
        words.push(loremWords[i % loremWords.length]);
      }
      text = words.join(' ');
      if (startWithLorem && count > 0) {
        text = 'Lorem ' + text;
      }
    } else {
      let text = '';
      while (new Blob([text]).size < count) {
        text += loremParagraphs[Math.floor(Math.random() * loremParagraphs.length)] + ' ';
      }
      text = text.slice(0, count);
      setResult(text);
      return;
    }
    setResult(text);
  };

  const copyResult = () => { if (result) navigator.clipboard.writeText(result); };
  const clearAll = () => { setResult(''); };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a1a] transition-colors">
      <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center space-x-4">
          <Link href="/tools" className="flex items-center text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            {tc('tools')}
          </Link>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">{t('textTools.lorem')}</span>
        </div>
        <div className="flex items-center space-x-3"><LanguageSwitcher /><ThemeToggle /></div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="mb-8"><h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('textTools.lorem')}</h1><p className="text-gray-500 dark:text-gray-400">{t('textTools.loremDesc')}</p></div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('textTools.generatorOptions')}</h3>
              <div className="space-y-4">
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('textTools.generateType')}</label><select value={type} onChange={(e)=>setType(e.target.value as 'paragraphs' | 'words' | 'bytes')} className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-500"><option value="paragraphs">{t('textTools.paragraphs')}</option><option value="words">{t('textTools.words')}</option><option value="bytes">{t('textTools.bytes')}</option></select></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{type === 'paragraphs' ? t('textTools.paragraphCount') : type === 'words' ? t('textTools.wordCount') : t('textTools.byteCount')}</label><input type="number" value={count} onChange={(e)=>setCount(Math.max(1, Math.min(10000, parseInt(e.target.value)||1)))} className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-500" min="1" max="10000" /></div>
                <label className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg cursor-pointer hover:border-gray-300 dark:hover:border-gray-500/50 transition-colors"><input type="checkbox" checked={startWithLorem} onChange={(e)=>setStartWithLorem(e.target.checked)} className="w-5 h-5 text-gray-500 border-gray-300 rounded focus:ring-gray-500" /><span className="text-gray-700 dark:text-gray-300">{t('textTools.startWithLorem')}</span></label>
              </div>
            </div>
            <div className="space-y-4">
              <button onClick={generate} className="w-full py-3.5 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-400 hover:to-gray-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-gray-500/30 flex items-center justify-center"><svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>{t('textTools.generate')}</button>
              <button onClick={clearAll} disabled={!result} className="w-full py-3.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">{t('textTools.clear')}</button>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('textTools.result')}</h3><button onClick={copyResult} disabled={!result} className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 012-2h10a2 2 0 012 2v12a2 2 0 01-2 2h-10a2 2 0 01-2-2V5z"/></svg>{t('textTools.copy')}</button></div>
              <textarea value={result} readOnly className="w-full h-96 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 resize-none font-mono text-sm" placeholder={t('textTools.resultPlaceholder')} />
            </div>

            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('textTools.stats')}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-center"><div className="text-2xl font-bold text-gray-500">{result.length}</div><div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('textTools.chars')}</div></div>
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-center"><div className="text-2xl font-bold text-gray-500">{result.trim() ? result.trim().split(/\s+/).length : 0}</div><div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('textTools.words')}</div></div>
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-center"><div className="text-2xl font-bold text-gray-500">{result ? result.split('\n').length : 0}</div><div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('textTools.lines')}</div></div>
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-center"><div className="text-2xl font-bold text-gray-500">{(new Blob([result]).size / 1024).toFixed(2)} KB</div><div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('textTools.bytes')}</div></div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6"><h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('textTools.tips')}</h3><ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400"><li className="flex items-start gap-2"><span className="text-gray-500">•</span>{t('textTools.tip1')}</li><li className="flex items-start gap-2"><span className="text-gray-500">•</span>{t('textTools.tip2')}</li><li className="flex items-start gap-2"><span className="text-gray-500">•</span>{t('textTools.tip3')}</li></ul></div>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}