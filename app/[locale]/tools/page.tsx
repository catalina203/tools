'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import ThemeToggle from '@/app/components/ThemeToggle';
import LanguageSwitcher from '@/app/components/LanguageSwitcher';
import { useFavoriteTools } from '@/app/context/FavoriteToolsContext';
import { imageTools, textTools, devTools, efficiencyTools, fileTools, dataTools } from '@/src/data/tools';

export default function ToolsPage() {
  const t = useTranslations('tools');
  const tc = useTranslations('common');
  const { isFavorite, toggleFavorite } = useFavoriteTools();

  const categories = [
    { nameKey: 'image', icon: '🖼️', tools: imageTools, gradient: 'from-pink-500 to-violet-500' },
    { nameKey: 'text', icon: '📝', tools: textTools, gradient: 'from-emerald-500 to-cyan-500' },
    { nameKey: 'dev', icon: '🛠️', tools: devTools, gradient: 'from-blue-500 to-indigo-500' },
    { nameKey: 'efficiency', icon: '⚡', tools: efficiencyTools, gradient: 'from-amber-500 to-orange-500' },
    { nameKey: 'file', icon: '📁', tools: fileTools, gradient: 'from-violet-500 to-purple-500' },
    { nameKey: 'data', icon: '📊', tools: dataTools, gradient: 'from-cyan-500 to-blue-500' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a1a] relative overflow-hidden transition-colors">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 right-0 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* 顶部导航 */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/30">
            <span className="text-white text-xl">⚡</span>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
            {tc('appName')}
          </span>
        </div>
        <div className="flex items-center space-x-6">
          <Link href="/" className="text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">
            {tc('home')}
          </Link>
          <Link href="/tools" className="text-gray-900 dark:text-white font-medium">
            {tc('tools')}
          </Link>
          <Link href="/about" className="text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">
            {tc('about')}
          </Link>
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </nav>

      {/* 主体内容 */}
      <main className="relative z-10 max-w-7xl mx-auto px-8 py-16">
        {/* 页面标题 */}
        <div className="text-center mb-20">
          <div className="inline-block px-4 py-2 bg-gradient-to-r from-violet-500/20 to-indigo-500/20 rounded-full border border-violet-500/30 mb-6">
            <span className="text-violet-600 dark:text-violet-300 text-sm font-medium">{t('badge')}</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-gray-900 via-gray-700 to-gray-500 dark:from-white dark:via-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
              {t('title')}
            </span>
          </h1>
          <p className="text-xl text-gray-500 dark:text-gray-400 max-w-3xl mx-auto">
            {t('description')}
          </p>
        </div>

        {/* 工具分类 */}
        <div className="space-y-24">
          {categories.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              <div className="flex items-center mb-10">
                <div className={`w-16 h-16 bg-gradient-to-br ${category.gradient} rounded-2xl flex items-center justify-center shadow-lg mr-6`}>
                  <span className="text-3xl">{category.icon}</span>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    {t(`categories.${category.nameKey}` as any)}
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400">
                    {t(`categories.${category.nameKey}Desc` as any)}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {category.tools.map((tool, toolIndex) => (
                  <Link
                    key={toolIndex}
                    href={`/tools/${tool.key}`}
                    className="group relative bg-gray-50 dark:bg-[#1a1a2e] border border-gray-200 dark:border-white/10 rounded-2xl p-5 hover:border-violet-500/30 dark:hover:border-white/20 transition-all duration-300 cursor-pointer overflow-hidden block"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className={`w-11 h-11 bg-gradient-to-br ${tool.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                            <span className="text-lg">{tool.icon}</span>
                          </div>
                          <h3 className="ml-3 text-base font-semibold text-gray-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                            {t(`${category.nameKey}Tools.${tool.key}` as any)}
                          </h3>
                        </div>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleFavorite(tool.key);
                          }}
                          className={`p-2 rounded-lg transition-all relative z-20 ${
                            isFavorite(tool.key)
                              ? 'text-yellow-500 hover:text-yellow-600'
                              : 'text-gray-400 hover:text-yellow-500'
                          }`}
                          title={isFavorite(tool.key) ? tc('removeFavorite') : tc('addFavorite')}
                        >
                          {isFavorite(tool.key) ? '⭐' : '☆'}
                        </button>
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        {t(`${category.nameKey}Tools.${tool.key}Desc` as any)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 搜索提示 */}
        <div className="mt-24 text-center">
          <div className="relative inline-block">
            <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 rounded-2xl blur opacity-30"></div>
            <div className="relative bg-gray-50 dark:bg-[#1a1a2e] border border-gray-200 dark:border-white/10 rounded-2xl p-10 max-w-2xl">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('notFound')}</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-8">
                {t('notFoundDesc')}
              </p>
              <button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-8 py-4 rounded-xl font-medium transition-all shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50">
                {tc('suggestTool')}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* 页脚 */}
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
            <p className="text-gray-500 dark:text-gray-400">
              {tc('copyright')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
