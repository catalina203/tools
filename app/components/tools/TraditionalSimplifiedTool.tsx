'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import LanguageSwitcher from '@/app/components/LanguageSwitcher';
import ThemeToggle from '@/app/components/ThemeToggle';

const traditionalChars = [
  '繁體字轉換測試開關啟動顯示輸入輸出文本編輯處理工具線上使用方便快速安全隱私保護數據不會上傳服務器本地處理完成支持中英文混雜自動識別按空格分隔統計中文按字符計算英文按單詞計算點擊按鈕即可復製到剪貼板清空所有內容重置輸入框粘貼文本或直接輸入文字支持純文本Markdown代碼等任何文本格式統計時會按字符和空格分隔符計算'
];

const simplifiedChars = [
  '繁体字转换测试开关启动显示输入输出文本编辑处理工具线上使用方便快速安全隐私保护数据不会上传服务器本地处理完成支持中英文混杂自动识别按空格分隔统计中文按字符计算英文按单词计算点击按钮即可复制到剪贴板清空所有内容重置输入框粘贴文本或直接输入文字支持纯文本Markdown代码等任何文本格式统计时会按字符和空格分隔符计算'
];

const traditionalToSimplifiedMap: Record<string, string> = {};
const simplifiedToTraditionalMap: Record<string, string> = {};

for (let i = 0; i < traditionalChars[0].length; i++) {
  const trad = traditionalChars[0][i];
  const simp = simplifiedChars[0][i];
  traditionalToSimplifiedMap[trad] = simp;
  simplifiedToTraditionalMap[simp] = trad;
}

function convertText(text: string, toSimplified: boolean): string {
  const map = toSimplified ? traditionalToSimplifiedMap : simplifiedToTraditionalMap;
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1] || '';
    const twoChar = char + nextChar;
    
    if (map[twoChar]) {
      result += map[twoChar];
      i++;
    } else if (map[char]) {
      result += map[char];
    } else {
      result += char;
    }
  }
  return result;
}

export default function TraditionalSimplifiedTool({ children }: { children?: React.ReactNode }) {
  const t = useTranslations('tools');
  const tc = useTranslations('common');

  const [text, setText] = useState('');
  const [result, setResult] = useState('');
  const [direction, setDirection] = useState<'toSimplified' | 'toTraditional'>('toSimplified');

  const convert = () => {
    if (!text) {
      setResult('');
      return;
    }
    const converted = convertText(text, direction === 'toSimplified');
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
    setDirection(direction === 'toSimplified' ? 'toTraditional' : 'toSimplified');
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
            {t('textTools.traditionalSimplified')}
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('textTools.traditionalSimplified')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('textTools.traditionalSimplifiedDesc')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('textTools.inputText')}</h3>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full h-96 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-mono text-sm"
                placeholder={t('textTools.inputPlaceholder')}
                spellCheck={false}
              />
            </div>

            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('textTools.convertDirection')}</h3>
              <div className="space-y-3">
                <label className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-colors">
                  <input
                    type="radio"
                    name="direction"
                    value="toSimplified"
                    checked={direction === 'toSimplified'}
                    onChange={() => setDirection('toSimplified')}
                    className="w-5 h-5 text-indigo-500 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="text-gray-700 dark:text-gray-300">{t('textTools.toSimplified')}</span>
                </label>
                <label className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-colors">
                  <input
                    type="radio"
                    name="direction"
                    value="toTraditional"
                    checked={direction === 'toTraditional'}
                    onChange={() => setDirection('toTraditional')}
                    className="w-5 h-5 text-indigo-500 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="text-gray-700 dark:text-gray-300">{t('textTools.toTraditional')}</span>
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={convert}
                disabled={!text}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
                  className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
                className="w-full h-96 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-mono text-sm"
                placeholder={t('textTools.resultPlaceholder')}
              />
            </div>

            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('textTools.stats')}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-indigo-500">{text.length}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('textTools.chars')}</div>
                </div>
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-indigo-500">{text.replace(/\s/g, '').length}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('textTools.charsNoSpace')}</div>
                </div>
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-indigo-500">{text.trim() ? text.trim().split(/\s+/).length : 0}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('textTools.words')}</div>
                </div>
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-indigo-500">{text ? text.split('\n').length : 0}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('textTools.lines')}</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('textTools.tips')}</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500">•</span>
                  {t('textTools.tip1')}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500">•</span>
                  {t('textTools.tip2')}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500">•</span>
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