'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import LanguageSwitcher from '@/app/components/LanguageSwitcher';
import ThemeToggle from '@/app/components/ThemeToggle';

const HTML_ENTITIES: Record<string, string> = {
  '&': '\u0026amp;',
  '<': '\u0026lt;',
  '>': '\u0026gt;',
  '"': '\u0026quot;',
  "'": '\u0026#39;',
  '/': '&#x2F;',
};

const HTML_ENTITIES_REVERSE: Record<string, string> = {
  '\u0026amp;': '&',
  '\u0026lt;': '<',
  '\u0026gt;': '>',
  '\u0026quot;': '"',
  '\u0026#39;': "'",
  '&#x2F;': '/',
};

const JS_ESCAPES: Record<string, string> = {
  '\\': '\\\\',
  "'": "\\'",
  '"': '\\"',
  '\n': '\\n',
  '\r': '\\r',
  '\t': '\\t',
  '\b': '\\b',
  '\f': '\\f',
};

const JS_UNESCAPES: Record<string, string> = {
  '\\\\': '\\',
  "\\'": "'",
  '\\"': '"',
  '\\n': '\n',
  '\\r': '\r',
  '\\t': '\t',
  '\\b': '\b',
  '\\f': '\f',
};

function processText(text: string, map: Record<string, string>): string {
  return text.replace(/[&<>"'/\n\r\t\b\f\\]/g, (char) => map[char] || char);
}

function processTextReverse(text: string, map: Record<string, string>): string {
  let result = text;
  Object.entries(map).forEach(([escaped, original]) => {
    const regex = new RegExp(escaped.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    result = result.replace(regex, original);
  });
  return result;
}

export default function EscapeTool({ children }: { children?: React.ReactNode }) {
  const t = useTranslations('tools');
  const tc = useTranslations('common');

  const [text, setText] = useState('');
  const [result, setResult] = useState('');
  const [type, setType] = useState<'html' | 'js'>('html');
  const [mode, setMode] = useState<'escape' | 'unescape'>('escape');

  const convert = () => {
    if (!text) {
      setResult('');
      return;
    }
    let converted = '';
    if (type === 'html') {
      if (mode === 'escape') {
        converted = processText(text, HTML_ENTITIES);
      } else {
        converted = processTextReverse(text, HTML_ENTITIES_REVERSE);
      }
    } else {
      if (mode === 'escape') {
        converted = processText(text, JS_ESCAPES);
      } else {
        converted = processTextReverse(text, JS_UNESCAPES);
      }
    }
    setResult(converted);
  };

  const copyResult = () => {
    if (result) navigator.clipboard.writeText(result);
  };

  const clearAll = () => {
    setText('');
    setResult('');
  };

  const swap = () => {
    setText(result);
    setResult(text);
    setMode(mode === 'escape' ? 'unescape' : 'escape');
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
            {t('textTools.escape')}
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('textTools.escape')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('textTools.escapeDesc')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('textTools.inputText')}</h3>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full h-96 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none font-mono text-sm"
                placeholder={t('textTools.inputPlaceholder')}
                spellCheck={false}
              />
            </div>

            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('textTools.escapeType')}</h3>
              <div className="space-y-3">
                <label className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg cursor-pointer hover:border-orange-300 dark:hover:border-orange-500/50 transition-colors">
                  <input
                    type="radio"
                    name="type"
                    value="html"
                    checked={type === 'html'}
                    onChange={() => setType('html')}
                    className="w-5 h-5 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="text-gray-700 dark:text-gray-300">{t('textTools.htmlEscape')}</span>
                </label>
                <label className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg cursor-pointer hover:border-orange-300 dark:hover:border-orange-500/50 transition-colors">
                  <input
                    type="radio"
                    name="type"
                    value="js"
                    checked={type === 'js'}
                    onChange={() => setType('js')}
                    className="w-5 h-5 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="text-gray-700 dark:text-gray-300">{t('textTools.javascriptEscape')}</span>
                </label>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('textTools.escapeMode')}</h3>
              <div className="space-y-3">
                <label className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg cursor-pointer hover:border-orange-300 dark:hover:border-orange-500/50 transition-colors">
                  <input
                    type="radio"
                    name="mode"
                    value="escape"
                    checked={mode === 'escape'}
                    onChange={() => setMode('escape')}
                    className="w-5 h-5 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="text-gray-700 dark:text-gray-300">{t('textTools.escape')}</span>
                </label>
                <label className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg cursor-pointer hover:border-orange-300 dark:hover:border-orange-500/50 transition-colors">
                  <input
                    type="radio"
                    name="mode"
                    value="unescape"
                    checked={mode === 'unescape'}
                    onChange={() => setMode('unescape')}
                    className="w-5 h-5 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="text-gray-700 dark:text-gray-300">{t('textTools.unescape')}</span>
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={convert}
                disabled={!text}
                className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white rounded-xl font-medium transition-all shadow-lg shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                {t('textTools.convert')}
              </button>
              <button
                onClick={swap}
                disabled={!text && !result}
                className="w-full py-3.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white rounded-xl font-medium transition-all shadow-lg shadow-pink-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                {t('textTools.swap')}
              </button>
              <button
                onClick={clearAll}
                disabled={!text && !result}
                className="w-full py-3.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('textTools.clearAll')}
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('textTools.result')}</h3>
                <button
                  onClick={copyResult}
                  disabled={!result}
                  className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:border-orange-300 dark:hover:border-orange-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 012-2h10a2 2 0 012 2v12a2 2 0 01-2 2h-10a2 2 0 01-2-2V5z" />
                  </svg>
                  {t('textTools.copy')}
                </button>
              </div>
              <textarea
                value={result}
                readOnly
                className="w-full h-96 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none font-mono text-sm"
                placeholder={t('textTools.resultPlaceholder')}
              />
            </div>

            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('textTools.tips')}</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-orange-500">•</span>
                  {t('textTools.tip1')}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500">•</span>
                  {t('textTools.tip2')}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500">•</span>
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