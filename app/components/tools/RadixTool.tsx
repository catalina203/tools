'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import LanguageSwitcher from '@/app/components/LanguageSwitcher';
import ThemeToggle from '@/app/components/ThemeToggle';

const RADIX_CONFIG: { key: string; base: number; prefix: string; placeholder: string }[] = [
  { key: 'binary', base: 2, prefix: '0b', placeholder: '1010' },
  { key: 'octal', base: 8, prefix: '0o', placeholder: '12' },
  { key: 'decimal', base: 10, prefix: '', placeholder: '10' },
  { key: 'hexadecimal', base: 16, prefix: '0x', placeholder: 'A' },
];

function validateInput(value: string, base: number): boolean {
  if (value === '') return true;
  const regex = base === 16 ? /^[0-9a-fA-F]*$/ : new RegExp(`^[0-${base - 1}]*$`);
  return regex.test(value);
}

function convertValue(value: string, fromBase: number, toBase: number): string {
  if (value === '') return '';
  const num = parseInt(value, fromBase);
  if (isNaN(num)) return '';
  return num.toString(toBase).toUpperCase();
}

export default function RadixTool({ children }: { children?: React.ReactNode }) {
  const t = useTranslations('tools');
  const tc = useTranslations('common');

  const [values, setValues] = useState<Record<string, string>>({
    binary: '',
    octal: '',
    decimal: '',
    hexadecimal: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({
    binary: '',
    octal: '',
    decimal: '',
    hexadecimal: '',
  });
  const [copiedKey, setCopiedKey] = useState<string>('');

  const handleChange = useCallback((key: string, input: string) => {
    const config = RADIX_CONFIG.find(c => c.key === key);
    if (!config) return;

    if (!validateInput(input, config.base)) {
      setErrors(prev => ({ ...prev, [key]: 'devTools.invalidInput' }));
      return;
    }

    setErrors(prev => ({ ...prev, [key]: '' }));

    const newValues: Record<string, string> = { ...values, [key]: input };
    if (input === '') {
      const empty: Record<string, string> = {};
      RADIX_CONFIG.forEach(c => { empty[c.key] = ''; });
      setValues(empty);
      return;
    }

    RADIX_CONFIG.forEach(c => {
      if (c.key !== key) {
        newValues[c.key] = convertValue(input, config.base, c.base);
      }
    });
    setValues(newValues);
  }, [values]);

  const copyValue = useCallback(async (key: string, value: string) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = value;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2000);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a1a] transition-colors">
      <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center space-x-4">
          <Link href="/tools" className="flex items-center text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            {tc('tools')}
          </Link>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">{t('devTools.radix')}</span>
        </div>
        <div className="flex items-center space-x-3"><LanguageSwitcher /><ThemeToggle /></div>
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('devTools.radix')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('devTools.radixDesc')}</p>
        </div>

        <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6 sm:p-8">
          <div className="space-y-5">
            {RADIX_CONFIG.map(({ key, base, prefix, placeholder }) => (
              <div key={key} className="group">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t(`devTools.${key}`)}
                    <span className="ml-2 text-xs text-gray-400 font-mono">(base-{base})</span>
                  </label>
                  <button
                    onClick={() => copyValue(key, values[key])}
                    disabled={!values[key]}
                    className="px-3 py-1 text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-500/50 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    {copiedKey === key ? (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        {t('devTools.copied')}
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        {t('devTools.copy')}
                      </>
                    )}
                  </button>
                </div>
                <div className="relative">
                  <div className={`flex items-center bg-white dark:bg-gray-900 border ${errors[key] ? 'border-red-400 dark:border-red-500' : 'border-gray-200 dark:border-white/10'} rounded-xl transition-all duration-300 focus-within:ring-2 focus-within:ring-amber-400`}>
                    {prefix && (
                      <span className="flex-shrink-0 pl-4 pr-0 text-sm font-mono text-gray-400 dark:text-gray-500 select-none">
                        {prefix}
                      </span>
                    )}
                    <input
                      type="text"
                      value={values[key]}
                      onChange={(e) => handleChange(key, e.target.value)}
                      placeholder={placeholder}
                      className="w-full bg-transparent px-4 py-3.5 text-lg font-mono text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none"
                    />
                  </div>
                  {errors[key] && (
                    <p className="mt-1.5 text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                      {t(errors[key])}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('devTools.prefix')}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="text-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                <span className="text-xs text-gray-400 dark:text-gray-500 block mb-1">{t('devTools.binary')}</span>
                <span className="font-mono text-sm text-gray-700 dark:text-gray-300">0b1010</span>
              </div>
              <div className="text-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                <span className="text-xs text-gray-400 dark:text-gray-500 block mb-1">{t('devTools.octal')}</span>
                <span className="font-mono text-sm text-gray-700 dark:text-gray-300">0o12</span>
              </div>
              <div className="text-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                <span className="text-xs text-gray-400 dark:text-gray-500 block mb-1">{t('devTools.decimal')}</span>
                <span className="font-mono text-sm text-gray-700 dark:text-gray-300">10</span>
              </div>
              <div className="text-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                <span className="text-xs text-gray-400 dark:text-gray-500 block mb-1">{t('devTools.hexadecimal')}</span>
                <span className="font-mono text-sm text-gray-700 dark:text-gray-300">0xA</span>
              </div>
            </div>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
