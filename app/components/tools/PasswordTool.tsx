'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import LanguageSwitcher from '@/app/components/LanguageSwitcher';
import ThemeToggle from '@/app/components/ThemeToggle';

function generatePassword(length: number, options: { uppercase: boolean; lowercase: boolean; numbers: boolean; symbols: boolean }): string {
  let chars = '';
  if (options.uppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (options.lowercase) chars += 'abcdefghijklmnopqrstuvwxyz';
  if (options.numbers) chars += '0123456789';
  if (options.symbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';

  if (!chars) return '';

  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (x) => chars[x % chars.length]).join('');
}

function checkStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 2) return { score, label: 'weak', color: 'red' };
  if (score <= 4) return { score, label: 'medium', color: 'yellow' };
  return { score, label: 'strong', color: 'green' };
}

export default function PasswordTool({ children }: { children?: React.ReactNode }) {
  const t = useTranslations('tools');
  const tc = useTranslations('common');

  const [output, setOutput] = useState('');
  const [length, setLength] = useState(16);
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [strength, setStrength] = useState<{ score: number; label: string; color: string } | null>(null);

  const generate = useCallback(() => {
    const password = generatePassword(length, { uppercase, lowercase, numbers, symbols });
    setOutput(password);
    if (password) {
      setStrength(checkStrength(password));
    }
  }, [length, uppercase, lowercase, numbers, symbols]);

  const copyOutput = () => {
    if (output) navigator.clipboard.writeText(output);
  };

  const clearAll = () => {
    setOutput('');
    setStrength(null);
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
          <span className="text-lg font-semibold text-gray-900 dark:text-white">{t('devTools.password')}</span>
        </div>
        <div className="flex items-center space-x-3"><LanguageSwitcher /><ThemeToggle /></div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="mb-8"><h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('devTools.password')}</h1><p className="text-gray-500 dark:text-gray-400">{t('devTools.passwordDesc')}</p></div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('devTools.options')}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('devTools.length')} ({length})</label>
                  <input type="range" min="4" max="64" value={length} onChange={(e) => setLength(parseInt(e.target.value))} className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-500" />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg cursor-pointer hover:border-red-300 dark:hover:border-red-500/50 transition-colors">
                    <input type="checkbox" checked={uppercase} onChange={(e) => setUppercase(e.target.checked)} className="w-5 h-5 text-red-500 border-gray-300 rounded focus:ring-red-500" />
                    <span className="text-gray-700 dark:text-gray-300">{t('devTools.uppercase')}</span>
                  </label>
                  <label className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg cursor-pointer hover:border-red-300 dark:hover:border-red-500/50 transition-colors">
                    <input type="checkbox" checked={lowercase} onChange={(e) => setLowercase(e.target.checked)} className="w-5 h-5 text-red-500 border-gray-300 rounded focus:ring-red-500" />
                    <span className="text-gray-700 dark:text-gray-300">{t('devTools.lowercase')}</span>
                  </label>
                  <label className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg cursor-pointer hover:border-red-300 dark:hover:border-red-500/50 transition-colors">
                    <input type="checkbox" checked={numbers} onChange={(e) => setNumbers(e.target.checked)} className="w-5 h-5 text-red-500 border-gray-300 rounded focus:ring-red-500" />
                    <span className="text-gray-700 dark:text-gray-300">{t('devTools.numbers')}</span>
                  </label>
                  <label className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg cursor-pointer hover:border-red-300 dark:hover:border-red-500/50 transition-colors">
                    <input type="checkbox" checked={symbols} onChange={(e) => setSymbols(e.target.checked)} className="w-5 h-5 text-red-500 border-gray-300 rounded focus:ring-red-500" />
                    <span className="text-gray-700 dark:text-gray-300">{t('devTools.symbols')}</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <button onClick={generate} disabled={!uppercase && !lowercase && !numbers && !symbols} className="w-full py-3.5 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-400 hover:to-rose-400 text-white rounded-xl font-medium transition-all shadow-lg shadow-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"><svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>{t('devTools.generate')}</button>
              <button onClick={clearAll} disabled={!output} className="w-full py-3.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">{t('devTools.clearAll')}</button>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('devTools.output')}</h3>
                <button onClick={copyOutput} disabled={!output} className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:border-red-300 dark:hover:border-red-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 012-2h10a2 2 0 012 2v12a2 2 0 01-2 2h-10a2 2 0 01-2-2v-12a2 2 0 012-2z" /></svg>{t('devTools.copy')}</button>
              </div>
              <textarea value={output} readOnly className="w-full h-96 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none font-mono text-sm" placeholder={t('devTools.passwordOutputPlaceholder')} />
            </div>

            {strength && (
              <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('devTools.strength')}</h3>
                <div className="mb-4">
                  <div className="flex gap-1 mb-2">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className={`flex-1 h-2 rounded ${i <= strength.score ? `bg-${strength.color}-500` : 'bg-gray-200 dark:bg-gray-700'}`} />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{strength.label} ({t(`devTools.strength${strength.label.charAt(0).toUpperCase() + strength.label.slice(1)}`)})</p>
                </div>
              </div>
            )}

            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6"><h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('devTools.tips')}</h3><ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400"><li className="flex items-start gap-2"><span className="text-red-500">•</span>{t('devTools.passwordTip1')}</li><li className="flex items-start gap-2"><span className="text-red-500">•</span>{t('devTools.passwordTip2')}</li><li className="flex items-start gap-2"><span className="text-red-500">•</span>{t('devTools.passwordTip3')}</li></ul></div>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}