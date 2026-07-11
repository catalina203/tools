'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import LanguageSwitcher from '@/app/components/LanguageSwitcher';
import ThemeToggle from '@/app/components/ThemeToggle';

function parseYaml(yaml: string): any {
  const lines = yaml.split('\n');
  const result: any = {};
  const stack: { obj: any; indent: number }[] = [{ obj: result, indent: -1 }];
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    
    const indent = line.length - line.trimStart().length;
    const match = trimmed.match(/^([^:]+):\s*(.*)$/);
    if (!match) continue;
    
    const [, key, value] = match;
    const cleanKey = key.trim();
    const cleanValue = value.trim();
    
    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
      stack.pop();
    }
    
    const parent = stack[stack.length - 1].obj;
    
    if (cleanValue === '' || cleanValue === '~' || cleanValue === 'null') {
      parent[cleanKey] = null;
    } else if (cleanValue === 'true') {
      parent[cleanKey] = true;
    } else if (cleanValue === 'false') {
      parent[cleanKey] = false;
    } else if (/^\d+$/.test(cleanValue)) {
      parent[cleanKey] = parseInt(cleanValue, 10);
    } else if (/^\d+\.\d+$/.test(cleanValue)) {
      parent[cleanKey] = parseFloat(cleanValue);
    } else if (cleanValue.startsWith('"') && cleanValue.endsWith('"') || cleanValue.startsWith("'") && cleanValue.endsWith("'")) {
      parent[cleanKey] = cleanValue.slice(1, -1);
    } else {
      parent[cleanKey] = cleanValue;
    }
  }
  
  return result;
}

function jsonToYaml(obj: any, indentSize: number, currentIndent: number = 0): string {
  const indent = ' '.repeat(indentSize * currentIndent);
  let yaml = '';
  
  if (Array.isArray(obj)) {
    for (const item of obj) {
      yaml += `${indent}- ${jsonToYaml(item, indentSize, 0).trimStart()}\n`;
    }
    return yaml;
  }
  
  if (typeof obj === 'object' && obj !== null) {
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        yaml += `${indent}${key}:\n`;
        yaml += jsonToYaml(value, indentSize, currentIndent + 1);
      } else if (Array.isArray(value)) {
        yaml += `${indent}${key}:\n`;
        yaml += jsonToYaml(value, indentSize, currentIndent + 1);
      } else {
        let formattedValue: string;
        if (value === null) formattedValue = 'null';
        else if (typeof value === 'string') formattedValue = `"${value}"`;
        else if (typeof value === 'boolean') formattedValue = value ? 'true' : 'false';
        else formattedValue = String(value);
        yaml += `${indent}${key}: ${formattedValue}\n`;
      }
    }
  }
  
  return yaml;
}

export default function YamlToJsonTool({ children }: { children?: React.ReactNode }) {
  const t = useTranslations('tools');
  const tc = useTranslations('common');

  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'yaml2json' | 'json2yaml'>('yaml2json');
  const [indent, setIndent] = useState(2);
  const [error, setError] = useState('');

  const process = () => {
    setError('');
    if (!input.trim()) {
      setOutput('');
      return;
    }
    try {
      if (mode === 'yaml2json') {
        const parsed = parseYaml(input);
        setOutput(JSON.stringify(parsed, null, indent));
      } else {
        const parsed = JSON.parse(input);
        const yaml = jsonToYaml(parsed, indent);
        setOutput(yaml);
      }
    } catch (e) {
      setError(t('devTools.parseError'));
    }
  };

  const copyOutput = () => { if (output) navigator.clipboard.writeText(output); };
  const clearAll = () => { setInput(''); setOutput(''); setError(''); };
  const swap = () => { const temp = input; setInput(output); setOutput(temp); setMode(mode === 'yaml2json' ? 'json2yaml' : 'yaml2json'); };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a1a] transition-colors">
      <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center space-x-4">
          <Link href="/tools" className="flex items-center text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            {tc('tools')}
          </Link>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">{t('devTools.yamlToJson')}</span>
        </div>
        <div className="flex items-center space-x-3"><LanguageSwitcher /><ThemeToggle /></div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="mb-8"><h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('devTools.yamlToJson')}</h1><p className="text-gray-500 dark:text-gray-400">{t('devTools.yamlToJsonDesc')}</p></div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('devTools.input')}</h3>
              <textarea value={input} onChange={(e) => setInput(e.target.value)} className="w-full h-96 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none font-mono text-sm" placeholder={t('devTools.yamlInputPlaceholder')} spellCheck={false} />
            </div>

            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('devTools.options')}</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <label className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg cursor-pointer hover:border-purple-300 dark:hover:border-purple-500/50 transition-colors">
                    <input type="radio" name="mode" value="yaml2json" checked={mode === 'yaml2json'} onChange={() => setMode('yaml2json')} className="w-5 h-5 text-purple-500 border-gray-300 focus:ring-purple-500" />
                    <span className="text-gray-700 dark:text-gray-300">{t('devTools.yamlToJson')}</span>
                  </label>
                  <label className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg cursor-pointer hover:border-purple-300 dark:hover:border-purple-500/50 transition-colors">
                    <input type="radio" name="mode" value="json2yaml" checked={mode === 'json2yaml'} onChange={() => setMode('json2yaml')} className="w-5 h-5 text-purple-500 border-gray-300 focus:ring-purple-500" />
                    <span className="text-gray-700 dark:text-gray-300">{t('devTools.jsonToYaml')}</span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('devTools.indent')}</label>
                  <select value={indent} onChange={(e) => setIndent(Number(e.target.value))} className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                    <option value={2}>2 {t('devTools.spaces')}</option>
                    <option value={4}>4 {t('devTools.spaces')}</option>
                    <option value={1}>\t {t('devTools.tab')}</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <button onClick={process} disabled={!input} className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white rounded-xl font-medium transition-all shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"><svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>{t('devTools.convert')}</button>
              <button onClick={swap} disabled={!input && !output} className="w-full py-3.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white rounded-xl font-medium transition-all shadow-lg shadow-pink-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"><svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>{t('devTools.swap')}</button>
              <button onClick={clearAll} disabled={!input && !output} className="w-full py-3.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">{t('devTools.clearAll')}</button>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('devTools.output')}</h3>
                <button onClick={copyOutput} disabled={!output} className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:border-purple-300 dark:hover:border-purple-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 012-2h10a2 2 0 012 2v12a2 2 0 01-2 2h-10a2 2 0 01-2-2v-12a2 2 0 012-2z" /></svg>{t('devTools.copy')}</button>
              </div>
              <textarea value={output} readOnly className="w-full h-96 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none font-mono text-sm" placeholder={error ? error : t('devTools.outputPlaceholder')} />
              {error && <p className="mt-2 text-sm text-red-500 dark:text-red-400 flex items-center gap-2"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>{error}</p>}
            </div>

            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6"><h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('devTools.tips')}</h3><ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400"><li className="flex items-start gap-2"><span className="text-purple-500">•</span>{t('devTools.yamlJsonTip1')}</li><li className="flex items-start gap-2"><span className="text-purple-500">•</span>{t('devTools.yamlJsonTip2')}</li><li className="flex items-start gap-2"><span className="text-purple-500">•</span>{t('devTools.yamlJsonTip3')}</li></ul></div>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}