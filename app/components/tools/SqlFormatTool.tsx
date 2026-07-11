'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import LanguageSwitcher from '@/app/components/LanguageSwitcher';
import ThemeToggle from '@/app/components/ThemeToggle';

function formatSql(sql: string, indent: number, upperCase: boolean): string {
  let formatted = sql.trim();
  
  const keywords = [
    'SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'OUTER JOIN',
    'ON', 'AND', 'OR', 'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET',
    'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE', 'TABLE',
    'ALTER', 'DROP', 'INDEX', 'VIEW', 'PROCEDURE', 'FUNCTION', 'TRIGGER',
    'UNION', 'EXCEPT', 'INTERSECT', 'DISTINCT', 'AS', 'IS', 'NULL', 'NOT',
    'IN', 'LIKE', 'BETWEEN', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
    'PRIMARY KEY', 'FOREIGN KEY', 'REFERENCES', 'UNIQUE', 'CHECK', 'DEFAULT',
    'AUTO_INCREMENT', 'IF NOT EXISTS', 'IF EXISTS'
  ];

  if (upperCase) {
    keywords.forEach(kw => {
      const regex = new RegExp(`\\b${kw}\\b`, 'gi');
      formatted = formatted.replace(regex, kw.toUpperCase());
    });
  }

  formatted = formatted.replace(/,\s*/g, ',\n' + ' '.repeat(indent));
  formatted = formatted.replace(/\s+AND\s+/gi, '\n' + ' '.repeat(indent) + 'AND ');
  formatted = formatted.replace(/\s+OR\s+/gi, '\n' + ' '.repeat(indent) + 'OR ');
  formatted = formatted.replace(/\s+JOIN\s+/gi, '\nJOIN ');
  formatted = formatted.replace(/\s+ON\s+/gi, '\n' + ' '.repeat(indent) + 'ON ');
  formatted = formatted.replace(/\s+WHERE\s+/gi, '\nWHERE ');
  formatted = formatted.replace(/\s+GROUP BY\s+/gi, '\nGROUP BY ');
  formatted = formatted.replace(/\s+ORDER BY\s+/gi, '\nORDER BY ');
  formatted = formatted.replace(/\s+HAVING\s+/gi, '\nHAVING ');
  formatted = formatted.replace(/\s+LIMIT\s+/gi, '\nLIMIT ');
  formatted = formatted.replace(/\(\s*/g, '(\n' + ' '.repeat(indent));
  formatted = formatted.replace(/\s*\)/g, '\n' + ' '.repeat(indent - 2) + ')');

  return formatted;
}

function minifySql(sql: string): string {
  return sql.replace(/\s+/g, ' ').replace(/\s*([,()])\s*/g, '$1').trim();
}

export default function SqlFormatTool({ children }: { children?: React.ReactNode }) {
  const t = useTranslations('tools');
  const tc = useTranslations('common');

  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [indent, setIndent] = useState(4);
  const [upperCase, setUpperCase] = useState(true);
  const [mode, setMode] = useState<'format' | 'minify'>('format');
  const [error, setError] = useState('');

  const process = () => {
    setError('');
    if (!input.trim()) {
      setOutput('');
      return;
    }
    try {
      if (mode === 'format') {
        setOutput(formatSql(input, indent, upperCase));
      } else {
        setOutput(minifySql(input));
      }
    } catch (e) {
      setError(t('devTools.sqlError'));
    }
  };

  const copyOutput = () => { if (output) navigator.clipboard.writeText(output); };
  const clearAll = () => { setInput(''); setOutput(''); setError(''); };
  const swap = () => { const temp = input; setInput(output); setOutput(temp); };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a1a] transition-colors">
      <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center space-x-4">
          <Link href="/tools" className="flex items-center text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            {tc('tools')}
          </Link>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">{t('devTools.sqlFormat')}</span>
        </div>
        <div className="flex items-center space-x-3"><LanguageSwitcher /><ThemeToggle /></div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="mb-8"><h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('devTools.sqlFormat')}</h1><p className="text-gray-500 dark:text-gray-400">{t('devTools.sqlFormatDesc')}</p></div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('devTools.inputSql')}</h3>
              <textarea value={input} onChange={(e) => setInput(e.target.value)} className="w-full h-96 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none font-mono text-sm" placeholder={t('devTools.sqlInputPlaceholder')} spellCheck={false} />
            </div>

            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('devTools.options')}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('devTools.indent')}</label>
                  <select value={indent} onChange={(e) => setIndent(Number(e.target.value))} className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500">
                    <option value={2}>2 {t('devTools.spaces')}</option>
                    <option value={4}>4 {t('devTools.spaces')}</option>
                    <option value={1}>\t {t('devTools.tab')}</option>
                  </select>
                </div>
                <label className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg cursor-pointer hover:border-orange-300 dark:hover:border-orange-500/50 transition-colors">
                  <input type="checkbox" checked={upperCase} onChange={(e) => setUpperCase(e.target.checked)} className="w-5 h-5 text-orange-500 border-gray-300 rounded focus:ring-orange-500" />
                  <span className="text-gray-700 dark:text-gray-300">{t('devTools.uppercaseKeywords')}</span>
                </label>
                <div className="flex items-center space-x-3">
                  <label className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg cursor-pointer hover:border-orange-300 dark:hover:border-orange-500/50 transition-colors">
                    <input type="radio" name="mode" value="format" checked={mode === 'format'} onChange={() => setMode('format')} className="w-5 h-5 text-orange-500 border-gray-300 focus:ring-orange-500" />
                    <span className="text-gray-700 dark:text-gray-300">{t('devTools.format')}</span>
                  </label>
                  <label className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg cursor-pointer hover:border-orange-300 dark:hover:border-orange-500/50 transition-colors">
                    <input type="radio" name="mode" value="minify" checked={mode === 'minify'} onChange={() => setMode('minify')} className="w-5 h-5 text-orange-500 border-gray-300 focus:ring-orange-500" />
                    <span className="text-gray-700 dark:text-gray-300">{t('devTools.minify')}</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <button onClick={process} disabled={!input} className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white rounded-xl font-medium transition-all shadow-lg shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"><svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>{mode === 'format' ? t('devTools.format') : t('devTools.minify')}</button>
              <button onClick={swap} disabled={!input && !output} className="w-full py-3.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white rounded-xl font-medium transition-all shadow-lg shadow-pink-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"><svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>{t('devTools.swap')}</button>
              <button onClick={clearAll} disabled={!input && !output} className="w-full py-3.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">{t('devTools.clearAll')}</button>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('devTools.output')}</h3>
                <button onClick={copyOutput} disabled={!output} className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:border-orange-300 dark:hover:border-orange-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 012-2h10a2 2 0 012 2v12a2 2 0 01-2 2h-10a2 2 0 01-2-2v-12a2 2 0 012-2z" /></svg>{t('devTools.copy')}</button>
              </div>
              <textarea value={output} readOnly className="w-full h-96 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none font-mono text-sm" placeholder={error ? error : t('devTools.sqlOutputPlaceholder')} />
              {error && <p className="mt-2 text-sm text-red-500 dark:text-red-400 flex items-center gap-2"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>{error}</p>}
            </div>

            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6"><h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('devTools.tips')}</h3><ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400"><li className="flex items-start gap-2"><span className="text-orange-500">•</span>{t('devTools.sqlFormatTip1')}</li><li className="flex items-start gap-2"><span className="text-orange-500">•</span>{t('devTools.sqlFormatTip2')}</li><li className="flex items-start gap-2"><span className="text-orange-500">•</span>{t('devTools.sqlFormatTip3')}</li></ul></div>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}