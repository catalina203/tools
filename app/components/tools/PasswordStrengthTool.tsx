'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import LanguageSwitcher from '@/app/components/LanguageSwitcher';
import ThemeToggle from '@/app/components/ThemeToggle';

interface StrengthResult {
  score: number;
  label: string;
  color: string;
  checks: { label: string; passed: boolean }[];
  suggestions: string[];
}

function analyzePassword(password: string): StrengthResult {
  const checks = [
    { label: 'length8', passed: password.length >= 8 },
    { label: 'length12', passed: password.length >= 12 },
    { label: 'hasLower', passed: /[a-z]/.test(password) },
    { label: 'hasUpper', passed: /[A-Z]/.test(password) },
    { label: 'hasNumber', passed: /[0-9]/.test(password) },
    { label: 'hasSymbol', passed: /[^a-zA-Z0-9]/.test(password) },
  ];

  const score = checks.filter((c) => c.passed).length;
  const suggestions: string[] = [];

  if (password.length < 8) suggestions.push('sugLength');
  if (!/[a-z]/.test(password)) suggestions.push('sugLower');
  if (!/[A-Z]/.test(password)) suggestions.push('sugUpper');
  if (!/[0-9]/.test(password)) suggestions.push('sugNumber');
  if (!/[^a-zA-Z0-9]/.test(password)) suggestions.push('sugSymbol');
  if (/(.)\1{2,}/.test(password)) suggestions.push('sugRepeat');
  if (/^[a-zA-Z]+$/.test(password) || /^\d+$/.test(password)) suggestions.push('sugMixed');

  let label: string, color: string;
  if (score <= 2) { label = 'weak'; color = 'red'; }
  else if (score <= 3) { label = 'fair'; color = 'orange'; }
  else if (score <= 4) { label = 'good'; color = 'yellow'; }
  else if (score <= 5) { label = 'strong'; color = 'lime'; }
  else { label = 'veryStrong'; color = 'green'; }

  return { score, label, color, checks, suggestions };
}

export default function PasswordStrengthTool({ children }: { children?: React.ReactNode }) {
  const t = useTranslations('tools');
  const tc = useTranslations('common');

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const result = useMemo(() => analyzePassword(password), [password]);

  const barColorMap: Record<string, string> = {
    red: 'bg-red-500',
    orange: 'bg-orange-500',
    yellow: 'bg-yellow-500',
    lime: 'bg-lime-500',
    green: 'bg-green-500',
  };

  const timeToCrack = useMemo(() => {
    if (!password) return '';
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[^a-zA-Z0-9]/.test(password);
    let charset = 0;
    if (hasLower) charset += 26;
    if (hasUpper) charset += 26;
    if (hasNumber) charset += 10;
    if (hasSymbol) charset += 32;
    if (charset === 0 || password.length === 0) return '';
    const combinations = Math.pow(charset, password.length);
    const guessesPerSecond = 1e9;
    const seconds = combinations / guessesPerSecond;
    if (seconds < 1) return t('efficiencyTools.passwordStrengthInstant');
    if (seconds < 60) return Math.round(seconds) + t('efficiencyTools.passwordStrengthSeconds');
    if (seconds < 3600) return Math.round(seconds / 60) + t('efficiencyTools.passwordStrengthMinutes');
    if (seconds < 86400) return Math.round(seconds / 3600) + t('efficiencyTools.passwordStrengthHours');
    if (seconds < 31536000) return Math.round(seconds / 86400) + t('efficiencyTools.passwordStrengthDays');
    if (seconds < 315360000) return Math.round(seconds / 31536000) + t('efficiencyTools.passwordStrengthYears');
    return t('efficiencyTools.passwordStrengthCenturies');
  }, [password, t]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a1a] transition-colors">
      <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center space-x-4">
          <Link href="/tools" className="flex items-center text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            {tc('tools')}
          </Link>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">{t('efficiencyTools.passwordStrength')}</span>
        </div>
        <div className="flex items-center space-x-3"><LanguageSwitcher /><ThemeToggle /></div>
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('efficiencyTools.passwordStrength')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('efficiencyTools.passwordStrengthDesc')}</p>
        </div>

        <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('efficiencyTools.passwordStrengthInput')}</h3>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('efficiencyTools.passwordStrengthPlaceholder')}
              className="w-full h-14 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl px-4 pr-12 text-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-2"
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              )}
            </button>
          </div>
        </div>

        {password && (
          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('efficiencyTools.passwordStrengthStrength')}</h3>
                <span className={`text-lg font-bold capitalize ${
                  result.color === 'red' ? 'text-red-500' :
                  result.color === 'orange' ? 'text-orange-500' :
                  result.color === 'yellow' ? 'text-yellow-500' :
                  result.color === 'lime' ? 'text-lime-500' :
                  'text-green-500'
                }`}>
                  {t(`efficiencyTools.passwordStrength${result.label.charAt(0).toUpperCase() + result.label.slice(1)}`)}
                </span>
              </div>
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className={`flex-1 h-2.5 rounded-full transition-all duration-300 ${
                    i <= result.score ? barColorMap[result.color] : 'bg-gray-200 dark:bg-gray-700'
                  }`} />
                ))}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('efficiencyTools.passwordStrengthCrackTime')}: <span className="font-semibold text-gray-700 dark:text-gray-300">{timeToCrack}</span>
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('efficiencyTools.passwordStrengthChecks')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.checks.map((check, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      check.passed ? 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                    }`}>
                      {check.passed ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      )}
                    </div>
                    <span className={`text-sm ${check.passed ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400'}`}>
                      {t(`efficiencyTools.passwordStrengthCheck${check.label.charAt(0).toUpperCase() + check.label.slice(1)}`)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {result.suggestions.length > 0 && (
              <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('efficiencyTools.passwordStrengthSuggestions')}</h3>
                <ul className="space-y-2">
                  {result.suggestions.map((sug, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
                      <span className="text-violet-500 mt-0.5 flex-shrink-0">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                      </span>
                      {t(`efficiencyTools.passwordStrength${sug.charAt(0).toUpperCase() + sug.slice(1)}`)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {children}
      </div>
    </div>
  );
}
