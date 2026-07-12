'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import LanguageSwitcher from '@/app/components/LanguageSwitcher';
import ThemeToggle from '@/app/components/ThemeToggle';

function validateEmail(email: string): { valid: boolean; errors: string[]; parts?: { local: string; domain: string } } {
  const errors: string[] = [];
  
  if (!email || email.trim() === '') {
    return { valid: false, errors: ['请输入邮箱地址'] };
  }

  const trimmed = email.trim();
  
  if (trimmed.length > 254) {
    errors.push('邮箱地址长度不能超过 254 个字符');
  }

  const atIndex = trimmed.lastIndexOf('@');
  if (atIndex <= 0 || atIndex === trimmed.length - 1) {
    errors.push('邮箱格式不正确：缺少 @ 符号或位置错误');
    return { valid: false, errors };
  }

  const local = trimmed.slice(0, atIndex);
  const domain = trimmed.slice(atIndex + 1);

  if (local.length > 64) {
    errors.push('本地部分（@ 前）长度不能超过 64 个字符');
  }

  if (local.startsWith('.') || local.endsWith('.')) {
    errors.push('本地部分不能以点号开头或结尾');
  }

  if (local.includes('..')) {
    errors.push('本地部分不能包含连续的点号');
  }

  const localRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/;
  if (!localRegex.test(local)) {
    errors.push('本地部分包含不允许的字符');
  }

  if (domain.length > 255) {
    errors.push('域名部分长度不能超过 255 个字符');
  }

  const domainParts = domain.split('.');
  if (domainParts.length < 2) {
    errors.push('域名必须包含至少一个点号');
  }

  for (const part of domainParts) {
    if (part.length === 0) {
      errors.push('域名不能包含空段');
      break;
    }
    if (part.length > 63) {
      errors.push('域名标签长度不能超过 63 个字符');
      break;
    }
    if (part.startsWith('-') || part.endsWith('-')) {
      errors.push('域名标签不能以连字符开头或结尾');
      break;
    }
    if (!/^[a-zA-Z0-9-]+$/.test(part)) {
      errors.push('域名标签包含不允许的字符');
      break;
    }
  }

  const tld = domainParts[domainParts.length - 1];
  if (!/^[a-zA-Z]{2,}$/.test(tld)) {
    errors.push('顶级域名必须至少包含 2 个字母');
  }

  return {
    valid: errors.length === 0,
    errors,
    parts: { local, domain }
  };
}

export default function EmailValidateTool({ children }: { children?: React.ReactNode }) {
  const t = useTranslations('tools');
  const tc = useTranslations('common');

  const [input, setInput] = useState('');
  const [result, setResult] = useState<{ valid: boolean; errors: string[]; parts?: { local: string; domain: string } } | null>(null);

  const validate = () => {
    if (!input.trim()) {
      setResult({ valid: false, errors: [t('devTools.emailRequired')] });
      return;
    }
    setResult(validateEmail(input));
  };

  const clearAll = () => {
    setInput('');
    setResult(null);
  };

  const copyOutput = () => {
    if (result) {
      const text = JSON.stringify(result, null, 2);
      navigator.clipboard.writeText(text);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a1a] transition-colors">
      <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center space-x-4">
          <Link href="/tools" className="flex items-center text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            {tc('tools')}
          </Link>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">{t('devTools.emailValidate')}</span>
        </div>
        <div className="flex items-center space-x-3"><LanguageSwitcher /><ThemeToggle /></div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="mb-8"><h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('devTools.emailValidate')}</h1><p className="text-gray-500 dark:text-gray-400">{t('devTools.emailValidateDesc')}</p></div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('devTools.inputEmail')}</h3>
              <textarea value={input} onChange={(e) => setInput(e.target.value)} className="w-full h-96 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-mono text-sm" placeholder={t('devTools.emailInputPlaceholder')} spellCheck={false} rows={1} />
            </div>

            <div className="space-y-4">
              <button onClick={validate} className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/30 flex items-center justify-center"><svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{t('devTools.validate')}</button>
              <button onClick={clearAll} disabled={!input && !result} className="w-full py-3.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">{t('devTools.clearAll')}</button>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('devTools.result')}</h3>
                <button onClick={copyOutput} disabled={!result} className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 012-2h10a2 2 0 012 2v12a2 2 0 01-2 2h-10a2 2 0 01-2-2v-12a2 2 0 012-2z" /></svg>{t('devTools.copy')}</button>
              </div>
              <div className="space-y-4">
                {result ? (
                  <>
                    <div className={`p-4 rounded-xl ${result.valid ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'}`}>
                      <div className="flex items-center gap-3">
                        <svg className={`w-6 h-6 ${result.valid ? 'text-green-500' : 'text-red-500'}`} fill="currentColor" viewBox="0 0 20 20">
                          {result.valid ? (
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          ) : (
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          )}
                        </svg>
                        <span className={`text-lg font-semibold ${result.valid ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                          {result.valid ? t('devTools.validEmail') : t('devTools.invalidEmail')}
                        </span>
                      </div>
                    </div>

                    {result.parts && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl p-4">
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-1">{t('devTools.localPart')}</label>
                          <input type="text" value={result.parts.local} readOnly className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white font-mono text-sm" />
                        </div>
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl p-4">
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-1">{t('devTools.domainPart')}</label>
                          <input type="text" value={result.parts.domain} readOnly className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white font-mono text-sm" />
                        </div>
                      </div>
                    )}

                    {!result.valid && result.errors.length > 0 && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                        <h4 className="font-semibold text-red-700 dark:text-red-400 mb-2">{t('devTools.validationErrors')}</h4>
                        <ul className="space-y-1 text-sm text-red-600 dark:text-red-400">
                          {result.errors.map((error, i) => (
                            <li key={i} className="flex items-start gap-2"><span className="text-red-500">•</span>{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                ) : (
                  <textarea readOnly className="w-full h-96 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-mono text-sm" placeholder={t('devTools.emailOutputPlaceholder')} />
                )}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6"><h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('devTools.tips')}</h3><ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400"><li className="flex items-start gap-2"><span className="text-indigo-500">•</span>{t('devTools.emailValidateTip1')}</li><li className="flex items-start gap-2"><span className="text-indigo-500">•</span>{t('devTools.emailValidateTip2')}</li><li className="flex items-start gap-2"><span className="text-indigo-500">•</span>{t('devTools.emailValidateTip3')}</li></ul></div>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}