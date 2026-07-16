'use client';

import { useTranslations } from 'next-intl';
import Navbar from '@/app/components/Navbar';

const stats = [
  { key: 'toolCount', value: '98', icon: '🛠️' },
  { key: 'categoryCount', value: '6', icon: '📂' },
  { key: 'localProcess', value: '100%', icon: '🔒' },
];

const features = [
  { key: 'feature1', gradient: 'from-violet-500 to-indigo-600', shadow: 'shadow-violet-500/30' },
  { key: 'feature2', gradient: 'from-cyan-500 to-blue-600', shadow: 'shadow-cyan-500/30' },
  { key: 'feature3', gradient: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/30' },
  { key: 'feature4', gradient: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-500/30' },
];

export default function AboutPage() {
  const t = useTranslations('about');
  const tc = useTranslations('common');

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a1a] relative overflow-hidden transition-colors">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-violet-500/15 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl"></div>
      </div>

      <Navbar />

      <main className="relative z-10 max-w-4xl mx-auto px-8 py-20">
        <div className="text-center mb-20">
          <div className="inline-block px-4 py-2 bg-gradient-to-r from-violet-500/20 to-indigo-500/20 rounded-full border border-violet-500/30 mb-6">
            <span className="text-violet-600 dark:text-violet-300 text-sm font-medium">{t('subtitle')}</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-gray-900 via-gray-700 to-gray-500 dark:from-white dark:via-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
              {t('title')}
            </span>
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
            {t('description')}
          </p>
        </div>

        <div className="mb-20">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('stats')}</h2>
            <p className="text-gray-500 dark:text-gray-400">{t('statsDesc')}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {stats.map((s) => (
              <div key={s.key} className="bg-gray-50 dark:bg-[#1a1a2e] border border-gray-200 dark:border-white/10 rounded-2xl p-6 text-center">
                <span className="text-4xl mb-3 block">{s.icon}</span>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{s.value}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t(s.key)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-20">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('features')}</h2>
            <p className="text-gray-500 dark:text-gray-400">{t('featuresDesc')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((f) => (
              <div key={f.key} className="group relative bg-gray-50 dark:bg-[#1a1a2e] border border-gray-200 dark:border-white/10 rounded-2xl p-6 hover:border-violet-500/30 dark:hover:border-white/20 transition-all duration-300 overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${f.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                <div className={`w-12 h-12 bg-gradient-to-br ${f.gradient} rounded-xl flex items-center justify-center mb-4 shadow-lg ${f.shadow}`}>
                  <span className="text-white text-xl">✦</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t(`${f.key}Title`)}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{t(`${f.key}Desc`)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-[#1a1a2e] border border-gray-200 dark:border-white/10 rounded-2xl p-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <span className="text-emerald-500 text-xl">🔒</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('privacy')}</h2>
          </div>
          <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{t('privacyDesc')}</p>
        </div>
      </main>

      <footer className="relative z-10 border-t border-gray-200 dark:border-white/5 mt-24 bg-gray-50/80 dark:bg-[#0a0a1a]/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-6 md:mb-0">
              <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white">⚡</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                {tc('appName')}
              </span>
            </div>
            <p className="text-gray-500 dark:text-gray-400">{t('footer')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
