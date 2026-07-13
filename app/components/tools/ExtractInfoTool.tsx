'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import LanguageSwitcher from '@/app/components/LanguageSwitcher';
import ThemeToggle from '@/app/components/ThemeToggle';

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const URL_RE = /https?:\/\/[^\s<>"']+|www\.[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}[^\s<>"']*/g;
const PHONE_RE = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g;
const IP_RE = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;

export default function ExtractInfoTool({ children }: { children?: React.ReactNode }) {
  const t = useTranslations('tools');
  const tc = useTranslations('common');

  const [text, setText] = useState('');
  const [extractEmails, setExtractEmails] = useState(true);
  const [extractUrls, setExtractUrls] = useState(true);
  const [extractPhones, setExtractPhones] = useState(true);
  const [extractIps, setExtractIps] = useState(false);

  const results = useMemo(() => {
    if (!text) return {};
    const data: Record<string, string[]> = {};
    if (extractEmails) {
      const matches = text.match(EMAIL_RE) || [];
      data.emails = [...new Set(matches)];
    }
    if (extractUrls) {
      const matches = text.match(URL_RE) || [];
      data.urls = [...new Set(matches)];
    }
    if (extractPhones) {
      const matches = text.match(PHONE_RE) || [];
      data.phones = [...new Set(matches)];
    }
    if (extractIps) {
      const matches = text.match(IP_RE) || [];
      data.ips = [...new Set(matches.filter(ip => ip.split('.').every(n => parseInt(n) >= 0 && parseInt(n) <= 255)))];
    }
    return data;
  }, [text, extractEmails, extractUrls, extractPhones, extractIps]);

  const totalExtracted = useMemo(() => {
    return Object.values(results).reduce((sum, arr) => sum + arr.length, 0);
  }, [results]);

  const copyAll = () => {
    const all = Object.entries(results)
      .map(([key, vals]) => `=== ${key.toUpperCase()} ===\n${vals.join('\n')}`)
      .join('\n\n');
    if (all) navigator.clipboard.writeText(all);
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
          <span className="text-lg font-semibold text-gray-900 dark:text-white">{t('textTools.extractInfo')}</span>
        </div>
        <div className="flex items-center space-x-3"><LanguageSwitcher /><ThemeToggle /></div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('textTools.extractInfo')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('textTools.extractInfoDesc')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('textTools.options')}</h3>
              <div className="space-y-3">
                {([
                  ['extractEmails', '📧', 'extractInfoEmails'],
                  ['extractUrls', '🔗', 'extractInfoUrls'],
                  ['extractPhones', '📞', 'extractInfoPhones'],
                  ['extractIps', '🌐', 'extractInfoIps'],
                ] as const).map(([key, icon, labelKey]) => (
                  <label key={key} className={`flex items-center space-x-3 p-3 bg-white dark:bg-gray-900 border rounded-lg cursor-pointer transition-colors ${key === 'extractEmails' ? extractEmails ? 'border-violet-300 dark:border-violet-500/50' : 'border-gray-200 dark:border-white/10' : key === 'extractUrls' ? extractUrls ? 'border-violet-300 dark:border-violet-500/50' : 'border-gray-200 dark:border-white/10' : key === 'extractPhones' ? extractPhones ? 'border-violet-300 dark:border-violet-500/50' : 'border-gray-200 dark:border-white/10' : extractIps ? 'border-violet-300 dark:border-violet-500/50' : 'border-gray-200 dark:border-white/10'} hover:border-violet-300 dark:hover:border-violet-500/50`}>
                    <input type="checkbox" checked={key === 'extractEmails' ? extractEmails : key === 'extractUrls' ? extractUrls : key === 'extractPhones' ? extractPhones : extractIps} onChange={() => {
                      const fn = key === 'extractEmails' ? setExtractEmails : key === 'extractUrls' ? setExtractUrls : key === 'extractPhones' ? setExtractPhones : setExtractIps;
                      fn((v: boolean) => !v);
                    }} className="w-5 h-5 text-violet-500 border-gray-300 rounded focus:ring-violet-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{icon} {t(`textTools.${labelKey}`)}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-6">
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-white/10">
                <h3 className="font-semibold text-gray-900 dark:text-white">{t('textTools.inputText')}</h3>
              </div>
              <textarea value={text} onChange={(e) => setText(e.target.value)} className="w-full h-36 bg-white dark:bg-gray-900 p-4 text-gray-900 dark:text-white font-mono text-sm focus:outline-none resize-none" placeholder={t('textTools.inputPlaceholder')} />
            </div>

            {totalExtracted > 0 && (
              <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('textTools.result')} ({totalExtracted})</h3>
                  <button onClick={copyAll} className="px-4 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:border-violet-300 dark:hover:border-violet-500/50 transition-colors">{t('textTools.copy')}</button>
                </div>
                <div className="space-y-4">
                  {Object.entries(results).map(([key, items]) => items.length > 0 && (
                    <div key={key}>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        {key === 'emails' ? '📧' : key === 'urls' ? '🔗' : key === 'phones' ? '📞' : '🌐'}
                        {t(`textTools.extractInfo${key.charAt(0).toUpperCase() + key.slice(1)}`)}
                        <span className="text-xs text-gray-400 font-normal">({items.length})</span>
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {items.map((item, i) => (
                          <span key={i} onClick={() => navigator.clipboard.writeText(item)} className="px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-700 dark:text-gray-300 font-mono cursor-pointer hover:border-violet-300 dark:hover:border-violet-500/50 transition-colors">{item}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {text && totalExtracted === 0 && (
              <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">{t('textTools.extractInfoNone')}</p>
              </div>
            )}
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
