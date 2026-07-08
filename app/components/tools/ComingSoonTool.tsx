'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import { allTools } from '@/src/data/tools';
import LanguageSwitcher from '@/app/components/LanguageSwitcher';
import ThemeToggle from '@/app/components/ThemeToggle';

type Props = {
  slug: string;
};

export default function ComingSoonTool({ slug }: Props) {
  const tc = useTranslations('common');
  const t = useTranslations('tools');
  const tool = allTools.find((item) => item.key === slug);

  const name = tool ? tool.key : slug;
  const icon = tool?.icon || '🛠️';
  const gradient = tool?.gradient || 'from-gray-500 to-slate-500';

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
          <span className="text-lg font-semibold text-gray-900 dark:text-white">{name}</span>
        </div>
        <div className="flex items-center space-x-3">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-24 text-center">
        <div className={`w-24 h-24 bg-gradient-to-br ${gradient} rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg animate-float`}>
          <span className="text-4xl">{icon}</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{name}</h1>
        <p className="text-xl text-gray-500 dark:text-gray-400 mb-12 max-w-lg mx-auto">
          {t('notFoundDesc')}
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/tools"
            className="px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-violet-500/30"
          >
            {tc('tools')}
          </Link>
          <Link
            href="/"
            className="px-8 py-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {tc('home')}
          </Link>
        </div>
      </div>
    </div>
  );
}
